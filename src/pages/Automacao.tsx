import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Lock,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  CalendarClock,
  ListChecks,
  ArrowLeft,
  Shield,
  Sparkles,
  Terminal,
  NotebookPen,
  Save,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import ProgressBar from "@/components/ProgressBar";
import QuestionText from "@/components/QuestionText";
import AutomationDiagram from "@/components/AutomationDiagram";
import CodeSandbox from "@/components/CodeSandbox";
import CodePlayground from "@/components/CodePlayground";
import LessonTutorialStrip from "@/components/LessonTutorialStrip";
import DailyActivityStrip from "@/components/DailyActivityStrip";
import { Button } from "@/components/ui/button";
import { COURSE_META, modules, type Lesson } from "@/data/automation-course";
import { useAutomationProgress, isLessonComplete } from "@/hooks/useAutomationProgress";

function weeklyReport(activity: { created_at: string; action: string }[]) {
  const now = Date.now();
  const week = activity.filter((a) => now - new Date(a.created_at).getTime() < 7 * 864e5);
  const days = new Set(week.map((a) => new Date(a.created_at).toDateString()));
  return {
    events: week.length,
    activeDays: days.size,
    quizzes: week.filter((a) => a.action === "quiz_aprovado").length,
    submissions: week.filter((a) => a.action === "codigo_enviado").length,
  };
}

export default function Automacao() {
  const { progress, activity, logActivity, upsert, saveDraft, isUnlocked, completedCount, total, percent } =
    useAutomationProgress();
  const [openModule, setOpenModule] = useState<string | null>("m1");
  const [current, setCurrent] = useState<Lesson | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState<string | null>(null);

  const report = useMemo(() => weeklyReport(activity), [activity]);

  const openLesson = (lesson: Lesson) => {
    const row = progress[lesson.id];
    setCurrent(lesson);
    // Restaura rascunhos salvos: respostas em andamento e anotações da aula
    setAnswers((row?.quiz_draft as Record<number, number>) ?? {});
    setNotes(row?.notes ?? "");
    setNotesSaved(null);
    setQuizResult(null);
    logActivity("aula_aberta", lesson.id);
  };

  const submitQuiz = async () => {
    if (!current) return;
    const correct = current.quiz.filter((q, i) => answers[i] === q.answer).length;
    const score = Math.round((correct / current.quiz.length) * 100);
    const passed = score >= 70;
    setQuizResult({ score, passed });
    await upsert(current.id, { quiz_passed: passed, quiz_score: score });
    await logActivity(passed ? "quiz_aprovado" : "quiz_reprovado", current.id);
  };

  const submitCode = async (code: string) => {
    if (!current) return;
    await upsert(current.id, { code_submitted: code, submitted_at: new Date().toISOString() });
    await logActivity("codigo_enviado", current.id);
  };

  const seo = (
    <Seo
      title="Curso de Automação de Testes | Central Automation"
      description="Curso de 6 meses com Anderson Santos: Selenium, Cucumber, JUnit e ExtentReports com sandbox de código, checkpoints e liberação gradual."
      path="/automacao"
    />
  );

  if (current) {
    const row = progress[current.id];
    const done = isLessonComplete(current, row);
    return (
      <AppLayout>
        {seo}
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <button onClick={() => setCurrent(null)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Voltar ao roteiro
          </button>

          <header className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-foreground">{current.title}</h1>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-primary/15 text-primary border border-primary/20">{current.duration}</span>
              <span className="px-2.5 py-1 rounded-lg bg-warning/15 text-warning border border-warning/20 flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" /> Entrega até a semana {current.deadlineWeek}
              </span>
              {done && (
                <span className="px-2.5 py-1 rounded-lg bg-success/15 text-success border border-success/20">Concluída</span>
              )}
            </div>
          </header>

          {/* Tutorial visual do fluxo da aula */}
          <LessonTutorialStrip />

          {/* Vídeo-aula interativa */}
          <section className="glass-card rounded-xl p-5 space-y-3">
            <div className="aspect-video rounded-xl bg-black/50 border border-white/10 flex flex-col items-center justify-center gap-2 text-center px-6">
              <button
                onClick={() => logActivity("video_assistido", current.id)}
                aria-label={`Reproduzir vídeo-aula: ${current.video.title}`}
                className="rounded-full p-1 hover:scale-105 transition-transform"
              >
                <PlayCircle className="h-12 w-12 text-primary" />
              </button>
              <p className="font-display font-semibold text-foreground">{current.video.title}</p>
              <p className="text-xs text-muted-foreground">{current.video.summary}</p>
              <p className="text-[11px] text-muted-foreground/70">Vídeo-aula gravada por {COURSE_META.instructor}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ListChecks className="h-4 w-4 text-primary" /> Checkpoints de aprendizagem
              </h2>
              <ul className="mt-2 space-y-1.5">
                {current.video.checkpoints.map((c) => (
                  <li key={c} className="text-xs text-foreground/85 flex gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Conteúdo + ilustração */}
          <section className="glass-card rounded-xl p-5">
            <AutomationDiagram diagram={current.diagram} />
            <QuestionText>{current.content}</QuestionText>
          </section>

          {/* Questionário (trava de segurança) */}
          <section className="glass-card rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Questionário de liberação
            </h2>
            <p className="text-xs text-muted-foreground">Aproveitamento mínimo de 70% para liberar a etapa seguinte.</p>
            {current.quiz.map((q, qi) => (
              <div key={qi} className="space-y-2">
                <p className="text-sm font-medium text-foreground">{qi + 1}. {q.question}</p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => {
                    const selected = answers[qi] === oi;
                    const reveal = quizResult !== null;
                    const isRight = oi === q.answer;
                    return (
                      <button
                        key={oi}
                        onClick={() => {
                          if (reveal) return;
                          const next = { ...answers, [qi]: oi };
                          setAnswers(next);
                          saveDraft(current.id, { quiz_draft: next as Record<string, number> });
                        }}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition-colors ${
                          reveal && isRight
                            ? "border-success/40 bg-success/10 text-foreground"
                            : reveal && selected
                            ? "border-destructive/40 bg-destructive/10 text-foreground"
                            : selected
                            ? "border-primary/50 bg-primary/10 text-foreground"
                            : "border-border/40 hover:bg-white/5 text-foreground/85"
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}) {opt}
                      </button>
                    );
                  })}
                </div>
                {quizResult && <p className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-3">{q.explanation}</p>}
              </div>
            ))}

            {quizResult ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className={`text-sm font-medium ${quizResult.passed ? "text-success" : "text-destructive"}`}>
                  Aproveitamento: {quizResult.score}% — {quizResult.passed ? "aprovado" : "aproveitamento insuficiente"}
                </p>
                {!quizResult.passed && (
                  <Button size="sm" variant="secondary" onClick={() => { setAnswers({}); setQuizResult(null); }}>
                    Tentar novamente
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={submitQuiz}
                disabled={Object.keys(answers).length < current.quiz.length}
                className="gradient-primary text-primary-foreground shadow-glow disabled:opacity-40"
              >
                Enviar questionário
              </Button>
            )}
          </section>

          {/* Sandbox */}
          {current.exercise && (
            <section className="space-y-2">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Ambiente hands-on
              </h2>
              <CodeSandbox
                exercise={current.exercise}
                initialCode={row?.code_submitted}
                draft={row?.code_draft}
                draftSavedAt={row?.code_draft_updated_at}
                submitted={!!row?.code_submitted}
                onSubmit={submitCode}
                onSaveDraft={(code) => saveDraft(current.id, { code_draft: code })}
              />
              {row?.submitted_at && (
                <p className="text-xs text-success">
                  Código enviado em {new Date(row.submitted_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </p>
              )}
            </section>
          )}

          {/* Prática livre com execução real */}
          <section className="space-y-2">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" /> Pratique e execute seu código
            </h2>
            <p className="text-xs text-muted-foreground">
              Área livre para treinar lógica de automação quantas vezes quiser — não interfere na avaliação da aula.
            </p>
            <CodePlayground lessonId={current.id} onRun={() => logActivity("pratica_livre", current.id)} />
          </section>

          {/* Anotações da aula (rascunho pessoal) */}
          <section className="glass-card rounded-xl p-5 space-y-2">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <NotebookPen className="h-5 w-5 text-primary" /> Minhas anotações
            </h2>
            <label className="sr-only" htmlFor="lesson-notes">
              Anotações da aula
            </label>
            <textarea
              id="lesson-notes"
              value={notes}
              maxLength={4000}
              rows={5}
              onChange={(e) => {
                setNotes(e.target.value);
                setNotesSaved(null);
              }}
              placeholder="Registre dúvidas, comandos e insights desta aula..."
              className="w-full text-sm p-3 rounded-xl bg-black/40 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] text-muted-foreground">
                {notesSaved ? `Anotações salvas às ${notesSaved}` : `${notes.length}/4000 caracteres`}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await saveDraft(current.id, { notes });
                  setNotesSaved(new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" }));
                }}
              >
                <Save className="h-3.5 w-3.5 mr-1" /> Salvar anotações
              </Button>
            </div>
          </section>

          {done && (
            <div className="glass-card rounded-xl p-4 text-sm text-success flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Etapa concluída — a próxima aula foi liberada.
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {seo}
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <header className="space-y-1">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
            <Bot className="h-6 w-6 text-primary" />
            {COURSE_META.title}
          </h1>
          <p className="text-muted-foreground">
            {COURSE_META.subtitle} · Instrutor {COURSE_META.instructor} · {COURSE_META.duration} em fluxo universitário dinamizado
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COURSE_META.stack.map((s) => (
              <span key={s} className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 border border-border/40 text-foreground/80">
                {s}
              </span>
            ))}
          </div>
        </header>

        <Link to="/banco-questoes" className="block rounded-xl glass-card p-5 hover:shadow-glow transition-shadow">
          <p className="font-display font-semibold text-foreground">Banco de Questões · Júnior, Pleno e Sênior</p>
          <p className="text-sm text-muted-foreground">120 questões com feedback imediato, cronômetro, histórico e revisão dos erros. Aprovação mínima de 75%.</p>
        </Link>

        <Link to="/laboratorio-java" className="block rounded-xl glass-card p-5 hover:shadow-glow transition-shadow">
          <p className="font-display font-semibold text-foreground">Laboratório Java · IDE Web</p>
          <p className="text-sm text-muted-foreground">15 exercícios em sequência com editor, console e validação por gabarito (Metodos, Elementos, DriverFactory e Hooks).</p>
        </Link>

        <Link to="/pratica-digitacao" className="block rounded-xl glass-card p-5 hover:shadow-glow transition-shadow">
          <p className="font-display font-semibold text-foreground">Prática de Digitação Java · Modo Aula</p>
          <p className="text-sm text-muted-foreground">Tela dividida: código do instrutor de um lado, sua digitação do outro, com verificação de erros e anotações.</p>
        </Link>

        {/* Desempenho */}
        <section className="glass-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground">Acompanhamento de desempenho</h2>
            <span className="text-sm text-muted-foreground">{completedCount}/{total} aulas</span>
          </div>
          <ProgressBar value={percent} variant={percent < 40 ? "destructive" : percent < 70 ? "warning" : "success"} />
          <DailyActivityStrip activity={activity} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            {[
              { label: "Atividades (7 dias)", value: report.events },
              { label: "Dias ativos", value: report.activeDays },
              { label: "Questionários aprovados", value: report.quizzes },
              { label: "Códigos enviados", value: report.submissions },
            ].map((k) => (
              <div key={k.label} className="rounded-xl bg-white/5 border border-border/40 p-3">
                <p className="text-lg font-display font-bold text-foreground">{k.value}</p>
                <p className="text-[11px] text-muted-foreground">{k.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/70">
            Monitoramento contínuo com suporte assistido por IA sob gestão de {COURSE_META.adminEmail}.
          </p>
        </section>

        {/* Roteiro */}
        <div className="space-y-3">
          {modules.map((mod) => {
            const isOpen = openModule === mod.id;
            const doneCount = mod.lessons.filter((l) => isLessonComplete(l, progress[l.id])).length;
            return (
              <div key={mod.id} className="glass-card rounded-xl overflow-hidden shadow-card">
                <button
                  onClick={() => setOpenModule(isOpen ? null : mod.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="h-9 w-9 shrink-0 rounded-xl gradient-primary text-primary-foreground grid place-items-center font-display font-bold text-sm">
                    {mod.month}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-semibold text-foreground">Mês {mod.month} – {mod.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{mod.goal}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{doneCount}/{mod.lessons.length}</span>
                  {isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-5 pt-3 space-y-2 border-t border-border/30">
                        {mod.lessons.map((lesson) => {
                          const unlocked = isUnlocked(lesson.id);
                          const row = progress[lesson.id];
                          const done = isLessonComplete(lesson, row);
                          const hasDraft =
                            !done &&
                            (!!row?.code_draft || !!row?.notes || Object.keys(row?.quiz_draft ?? {}).length > 0);

                          return (
                            <button
                              key={lesson.id}
                              disabled={!unlocked}
                              onClick={() => openLesson(lesson)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-colors ${
                                done
                                  ? "bg-success/10 border-success/20"
                                  : unlocked
                                  ? "bg-white/3 hover:bg-white/5 border-transparent"
                                  : "bg-white/3 border-transparent opacity-50 cursor-not-allowed"
                              }`}
                            >
                              {done ? (
                                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                              ) : unlocked ? (
                                <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                              ) : (
                                <Lock className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.duration} · prazo semana {lesson.deadlineWeek}
                                  {lesson.exercise ? " · exercício obrigatório" : ""}
                                </p>
                              </div>
                              {hasDraft && (
                                <span className="text-[11px] px-2 py-0.5 rounded-lg bg-warning/15 text-warning border border-warning/20 shrink-0">
                                  Rascunho salvo
                                </span>
                              )}
                              {!unlocked && <span className="text-[11px] text-muted-foreground shrink-0">Bloqueada</span>}
                            </button>
                          );
                        })}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
