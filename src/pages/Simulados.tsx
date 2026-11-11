import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, Play, Pause, CheckCircle, XCircle, RotateCcw, Filter, BookOpen, ArrowLeft, ArrowRight, Shuffle, History, Eye } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import QuestionText from "@/components/QuestionText";
import QuestionVisual from "@/components/QuestionVisual";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sampleQuestions, chapters, type Question } from "@/data/ctfl-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { saveSimuladoResult } from "@/lib/firestore-service";
import { toast } from "sonner";

type SimState = "menu" | "running" | "results";

interface SavedQuestionData {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer: number | null;
  explanation: string;
  chapter: number;
  level: string;
}


const quizModes = [
  { label: "Rápido", count: 10, time: "~15 min", desc: "Revisão rápida", icon: "⚡" },
  { label: "Médio", count: 20, time: "~30 min", desc: "Prática intermediária", icon: "📝" },
  { label: "Simulado CTFL", count: 40, time: "~60 min", desc: "Formato do exame real", icon: "🎯" },
  { label: "Maratona", count: 100, time: "~2h30", desc: "Treino intensivo", icon: "🏆" },
];

export default function Simulados() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<SimState>("menu");
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [reviewing, setReviewing] = useState<any | null>(null);


  // Load history
  useEffect(() => {
    if (!user) return;
    supabase
      .from("quiz_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => { if (data) setHistory(data); });
  }, [user, state]);

  const filteredPool = sampleQuestions.filter((q) => {
    if (selectedChapters.length > 0 && !selectedChapters.includes(q.chapter)) return false;
    if (selectedLevel !== "all" && q.level !== selectedLevel) return false;
    return true;
  });

  const toggleChapter = (id: number) => {
    setSelectedChapters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const startSimulado = (count: number, customPool?: Question[]) => {
    const pool = customPool && customPool.length > 0
      ? customPool
      : (filteredPool.length > 0 ? filteredPool : sampleQuestions);
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
    // Shuffle options for each question so the correct answer isn't always A
    const shuffled = picked.map((q) => {
      const indices = q.options.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      return {
        ...q,
        options: indices.map((i) => q.options[i]),
        correctAnswer: indices.indexOf(q.correctAnswer),
      };
    });
    setQuestions(shuffled);
    setCurrentQ(0);
    setAnswers({});
    setShowExplanation(false);
    setTimeLeft(shuffled.length * 90);
    setTimerActive(true);
    setIsPaused(false);
    setElapsedBeforePause(0);
    setStartTime(Date.now());
    setState("running");
  };

  // Auto-start from navigation state (e.g. "praticar não respondidas" from Trilhas)
  useEffect(() => {
    const navState = location.state as { questionIds?: string[]; label?: string } | null;
    if (navState?.questionIds && navState.questionIds.length > 0 && state === "menu") {
      const pool = sampleQuestions.filter((q) => navState.questionIds!.includes(q.id));
      if (pool.length > 0) {
        toast.success(`Iniciando: ${navState.label ?? "Questões selecionadas"} (${pool.length})`);
        startSimulado(pool.length, pool);
        navigate(location.pathname, { replace: true, state: null });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const togglePause = () => {
    if (isPaused) {
      // Resume
      setStartTime(Date.now());
      setIsPaused(false);
      setTimerActive(true);
    } else {
      // Pause
      setElapsedBeforePause((e) => e + Math.round((Date.now() - startTime) / 1000));
      setIsPaused(true);
      setTimerActive(false);
    }
  };

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0 || isPaused) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setTimerActive(false);
          setState("results");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isPaused]);


  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const selectAnswer = (qId: string, idx: number) => {
    if (answers[qId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setShowExplanation(false);
    } else {
      setTimerActive(false);
      setState("results");
      // Save will be triggered by useEffect
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) {
      setCurrentQ((prev) => prev - 1);
      setShowExplanation(answers[questions[currentQ - 1]?.id] !== undefined);
    }
  };

  const score = questions.filter((q) => answers[q.id] === q.correctAnswer).length;

  const chapterStats = () => {
    const stats: Record<number, { total: number; correct: number }> = {};
    questions.forEach((q) => {
      if (!stats[q.chapter]) stats[q.chapter] = { total: 0, correct: 0 };
      stats[q.chapter].total++;
      if (answers[q.id] === q.correctAnswer) stats[q.chapter].correct++;
    });
    return stats;
  };

  const saveResults = async () => {
    if (!user) return;
    const pct = Math.round((score / questions.length) * 100);
    const timeSpent = elapsedBeforePause + Math.round((Date.now() - startTime) / 1000);
    const stats = chapterStats();
    const questionsData: SavedQuestionData[] = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedAnswer: answers[q.id] ?? null,
      explanation: q.explanation,
      chapter: q.chapter,
      level: q.level,
    }));
    try {
      await saveSimuladoResult(user.id, {
        score,
        totalQuestions: questions.length,
        percentage: pct,
        passed: pct >= 65,
        timeSpentSeconds: timeSpent,
        completedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Firestore saveSimuladoResult error:", e);
    }

    try {
      const { error } = await supabase.from("quiz_results").insert({
        user_id: user.id,
        total_questions: questions.length,
        correct_answers: score,
        score_percentage: pct,
        passed: pct >= 65,
        time_spent_seconds: timeSpent,
        chapters_filter: selectedChapters,
        level_filter: selectedLevel,
        chapter_breakdown: stats,
        questions_data: questionsData as any,
      });
      if (error) {
        console.warn("Supabase save result:", error);
      }
    } catch {
      // Ignored if offline
    }
    toast.success("Resultado salvo com sucesso!");
  };


  // Save results when entering results state
  useEffect(() => {
    if (state === "results" && questions.length > 0) {
      saveResults();
    }
  }, [state]);

  // ====== MENU ======
  if (state === "menu") {
    return (
      <AppLayout>
        <Seo
          title="Simulados CTFL | Anderson Academy"
          description="Pratique simulados CTFL no formato do exame oficial: modos Rápido, Médio, Simulado e Maratona com filtros por capítulo e nível cognitivo."
          path="/simulados"
        />
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
              <FileText className="h-6 w-6 text-primary" />
              Simulados
            </h1>
            <p className="text-muted-foreground">
              {sampleQuestions.length.toLocaleString()} questões disponíveis · Pratique no formato do exame CTFL
            </p>
          </div>

          {/* Filters */}
          <div className="glass-card rounded-xl shadow-card p-5 space-y-4">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filtros
            </h2>

            {/* Chapter filter */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Capítulos (deixe vazio para todos)</p>
              <div className="flex flex-wrap gap-2">
                {chapters.map((ch) => {
                  const isActive = selectedChapters.includes(ch.id);
                  const count = sampleQuestions.filter((q) => q.chapter === ch.id).length;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => toggleChapter(ch.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isActive
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-white/5 border-border/30 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      {ch.icon} Cap. {ch.id} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level filter */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Nível Cognitivo</p>
              <div className="flex gap-2">
                {["all", "K1", "K2", "K3"].map((lvl) => {
                  const count = lvl === "all" ? filteredPool.length : sampleQuestions.filter((q) => q.level === lvl && (selectedChapters.length === 0 || selectedChapters.includes(q.chapter))).length;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedLevel === lvl
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-white/5 border-border/30 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      {lvl === "all" ? "Todos" : lvl} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              <Shuffle className="inline h-3 w-3 mr-1" />
              {filteredPool.length} questões disponíveis com os filtros atuais
            </p>
          </div>

          {/* Quiz modes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quizModes.map((opt, i) => {
              const available = Math.min(opt.count, filteredPool.length);
              const disabled = filteredPool.length === 0;
              return (
                <motion.div
                  key={opt.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={disabled ? {} : { y: -4, transition: { duration: 0.2 } }}
                  className={`glass-card rounded-xl shadow-card p-5 text-center hover:shadow-glow transition-shadow duration-300 ${disabled ? "opacity-40" : ""}`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <h2 className="font-display font-semibold text-lg text-foreground mt-1">{opt.label}</h2>
                  <p className="text-3xl font-bold text-primary my-1">{available}</p>
                  <p className="text-xs text-muted-foreground">questões · {opt.time}</p>
                  <p className="text-xs text-muted-foreground mb-3">{opt.desc}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={disabled}
                    onClick={() => startSimulado(opt.count)}
                    className="gradient-primary text-primary-foreground w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-glow disabled:opacity-40"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          {/* Question bank stats */}
          <div className="glass-card rounded-xl shadow-card p-5">
            <h2 className="font-display font-semibold mb-3 text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Banco de Questões
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {chapters.map((ch) => {
                const count = sampleQuestions.filter((q) => q.chapter === ch.id).length;
                return (
                  <div key={ch.id} className="text-center p-3 rounded-xl bg-white/5 border border-border/20">
                    <span className="text-lg">{ch.icon}</span>
                    <p className="text-2xl font-bold text-primary">{count}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate" title={ch.title}>
                      Cap. {ch.id}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="glass-card rounded-xl shadow-card p-5">
              <h2 className="font-display font-semibold mb-3 text-foreground flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Histórico Recente
              </h2>
              <div className="space-y-2">
                {history.map((r) => {
                  const date = new Date(r.created_at);
                  const timeStr = `${Math.floor((r.time_spent_seconds || 0) / 60)}min`;
                  const modeLabel = r.total_questions <= 10 ? "⚡ Rápido" : r.total_questions <= 20 ? "📝 Médio" : r.total_questions <= 40 ? "🎯 Simulado CTFL" : "🏆 Maratona";
                  return (
                    <div key={r.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${r.passed ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {r.passed ? <CheckCircle className="h-4 w-4 text-success shrink-0" /> : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {r.correct_answers}/{r.total_questions} ({r.score_percentage}%)
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {date.toLocaleDateString("pt-BR")} · {timeStr} · <span className="font-medium">{modeLabel}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-bold hidden sm:inline ${r.passed ? "text-success" : "text-destructive"}`}>
                          {r.passed ? "✅" : "❌"}
                        </span>
                        {Array.isArray(r.questions_data) && r.questions_data.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReviewing(r)}
                            className="border-primary/30 text-primary hover:bg-primary/10 h-8"
                            aria-label="Visualizar questões deste simulado"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Visualizar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review past attempt dialog */}
          <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-background border-border/50">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Revisão do Simulado · {reviewing && new Date(reviewing.created_at).toLocaleString("pt-BR")}
                </DialogTitle>
              </DialogHeader>
              {reviewing && (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Acertos: <span className="font-bold text-foreground">{reviewing.correct_answers}/{reviewing.total_questions}</span> ({reviewing.score_percentage}%)
                  </div>
                  {(reviewing.questions_data as SavedQuestionData[]).map((q, i) => {
                    const correct = q.selectedAnswer === q.correctAnswer;
                    const notAnswered = q.selectedAnswer === null || q.selectedAnswer === undefined;
                    return (
                      <div key={q.id + i} className={`p-4 rounded-xl border ${correct ? "bg-success/5 border-success/20" : notAnswered ? "bg-warning/5 border-warning/20" : "bg-destructive/5 border-destructive/20"}`}>
                        <div className="flex items-start gap-2 mb-2">
                          {correct ? <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" /> : notAnswered ? <Clock className="h-4 w-4 text-warning shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                          <div className="text-sm font-medium text-foreground flex-1">
                            <span className="mr-1">Q{i + 1}.</span>
                            <QuestionText>{q.question}</QuestionText>
                            <QuestionVisual level={q.level} chapter={q.chapter} question={q.question} />
                          </div>
                        </div>
                        <div className="space-y-1 ml-6">
                          {q.options.map((opt, idx) => {
                            const isCorrect = idx === q.correctAnswer;
                            const isSelected = idx === q.selectedAnswer;
                            return (
                              <div key={idx} className={`text-xs px-2 py-1.5 rounded-lg border ${isCorrect ? "bg-success/10 border-success/30 text-success" : isSelected ? "bg-destructive/10 border-destructive/30 text-destructive" : "border-transparent text-muted-foreground"}`}>
                                <span className="font-medium mr-1">{String.fromCharCode(97 + idx)})</span>{opt}
                                {isCorrect && " ✓"}
                                {isSelected && !isCorrect && " (sua resposta)"}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 ml-6 italic">💡 {q.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
      </AppLayout>
    );
  }

  // ====== RESULTS ======
  if (state === "results") {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 65;
    const stats = chapterStats();

    return (
      <AppLayout>
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl shadow-card p-8 text-center"
          >
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${passed ? "gradient-success shadow-glow" : "bg-destructive"}`}>
              {passed ? <CheckCircle className="h-10 w-10 text-primary-foreground" /> : <XCircle className="h-10 w-10 text-primary-foreground" />}
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {passed ? "Parabéns! 🎉" : "Continue estudando! 💪"}
            </h2>
            <p className="text-muted-foreground mt-1">
              Você acertou {score} de {questions.length} questões
            </p>
            <p className={`text-4xl font-display font-bold mt-4 ${passed ? "text-success" : "text-destructive"}`}>
              {pct}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Meta: 65% para aprovação</p>
          </motion.div>

          {/* Per-chapter breakdown */}
          <div className="glass-card rounded-xl shadow-card p-5">
            <h2 className="font-display font-semibold mb-3 text-foreground">📊 Desempenho por Capítulo</h2>
            <div className="space-y-2">
              {Object.entries(stats).sort(([a], [b]) => Number(a) - Number(b)).map(([ch, s]) => {
                const p = Math.round((s.correct / s.total) * 100);
                const chInfo = chapters.find((c) => c.id === Number(ch));
                return (
                  <div key={ch} className="flex items-center gap-3">
                    <span className="text-sm w-6">{chInfo?.icon}</span>
                    <span className="text-sm text-muted-foreground w-20 truncate">Cap. {ch}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${p >= 65 ? "gradient-success" : "bg-destructive"}`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium w-16 text-right ${p >= 65 ? "text-success" : "text-destructive"}`}>
                      {s.correct}/{s.total} ({p}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question review */}
          <div className="glass-card rounded-xl shadow-card p-5">
            <h2 className="font-display font-semibold mb-3 text-foreground">📝 Revisão das Questões</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {questions.map((q, i) => {
                const correct = answers[q.id] === q.correctAnswer;
                return (
                  <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl text-left ${correct ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"}`}>
                    {correct ? <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        Q{i + 1}: {q.question.slice(0, 80)}...
                      </p>
                      {!correct && <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setState("menu")} className="border-border/50 text-foreground hover:bg-white/5">
              Voltar ao Menu
            </Button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startSimulado(questions.length)}
              className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-glow"
            >
              <RotateCcw className="h-4 w-4" />
              Refazer
            </motion.button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ====== RUNNING ======
  const q = questions[currentQ];
  const answered = answers[q.id] !== undefined;

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {/* Progress header */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Questão {currentQ + 1} de {questions.length}
          </span>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm font-mono ${timeLeft < 60 ? "text-destructive" : "text-muted-foreground"}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={togglePause}
              aria-label={isPaused ? "Retomar simulado" : "Pausar simulado"}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-white/5 border border-border/30 text-foreground hover:bg-white/10 transition-colors"
            >
              {isPaused ? <><Play className="h-3 w-3" /> Retomar</> : <><Pause className="h-3 w-3" /> Pausar</>}
            </button>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${q.level === "K1" ? "bg-primary/15 text-primary" : q.level === "K2" ? "bg-accent/15 text-accent" : "bg-warning/15 text-warning"}`}>
              {q.level}
            </span>
          </div>
        </div>

        {/* Pause overlay */}
        {isPaused && (
          <div className="glass-card rounded-xl shadow-card p-8 text-center space-y-3">
            <Pause className="h-10 w-10 mx-auto text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Simulado Pausado</h2>
            <p className="text-sm text-muted-foreground">O cronômetro está parado. Clique em "Retomar" para continuar de onde parou.</p>
            <Button onClick={togglePause} className="gradient-primary text-primary-foreground shadow-glow">
              <Play className="h-4 w-4 mr-1" /> Retomar
            </Button>
          </div>
        )}


        {!isPaused && (<>
        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-500"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card rounded-xl shadow-card p-6"
          >
            <p className="text-sm text-muted-foreground mb-2">
              Cap. {q.chapter} · {q.topic}
            </p>
            <div className="font-display font-semibold text-lg mb-4 text-foreground">
              <QuestionText>{q.question}</QuestionText>
              <QuestionVisual level={q.level} chapter={q.chapter} topic={q.topic} question={q.question} />
            </div>

            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === idx;
                const isCorrect = idx === q.correctAnswer;
                let style = "bg-white/5 hover:bg-white/10 border-border/30";
                if (answered) {
                  if (isCorrect) style = "bg-success/10 border-success/30";
                  else if (selected && !isCorrect) style = "bg-destructive/10 border-destructive/30";
                  else style = "bg-white/3 border-transparent opacity-40";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(q.id, idx)}
                    disabled={answered}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all text-foreground ${style}`}
                  >
                    <span className="font-medium mr-2 text-muted-foreground">{String.fromCharCode(97 + idx)})</span>
                    {opt}
                    {answered && isCorrect && <CheckCircle className="inline h-4 w-4 ml-2 text-success" />}
                    {answered && selected && !isCorrect && <XCircle className="inline h-4 w-4 ml-2 text-destructive" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl ${
                  answers[q.id] === q.correctAnswer
                    ? "bg-success/10 border border-success/20"
                    : "bg-destructive/10 border border-destructive/20"
                }`}
              >
                <p className="text-sm font-medium mb-1 text-foreground">
                  {answers[q.id] === q.correctAnswer ? "✅ Correto!" : "❌ Incorreto"}
                </p>
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-4">
              {currentQ > 0 && (
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  className="border-border/50 text-foreground hover:bg-white/5"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              {answered && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={nextQuestion}
                  className="flex-1 gradient-primary text-primary-foreground py-3 rounded-xl font-medium text-sm shadow-glow flex items-center justify-center gap-2"
                >
                  {currentQ < questions.length - 1 ? "Próxima Questão" : "Ver Resultado"}
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Question navigator dots */}
        <div className="flex flex-wrap gap-1 justify-center">
          {questions.map((qq, i) => {
            const isAnswered = answers[qq.id] !== undefined;
            const isCurrent = i === currentQ;
            const isCorrect = answers[qq.id] === qq.correctAnswer;
            return (
              <button
                key={qq.id}
                onClick={() => { setCurrentQ(i); setShowExplanation(isAnswered); }}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isAnswered
                      ? isCorrect
                        ? "bg-success/20 text-success border border-success/30"
                        : "bg-destructive/20 text-destructive border border-destructive/30"
                      : "bg-white/5 text-muted-foreground border border-border/20"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        </>)}
      </div>

    </AppLayout>
  );
}
