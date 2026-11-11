import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Award, BarChart3, CheckCircle2, Clock, Eye, History, Layers, ListX, Play, RefreshCw, Target, Timer, XCircle,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TRACK_THEMES } from "@/data/track-themes";
import { BANK_PASS_SCORE, LEVEL_LABEL, questionBank, type BankLevel, type BankQuestion } from "@/data/automation-question-bank";

interface AnswerLog { n: number; selected: number | null; text?: string; correct: boolean; timeSec: number }
interface Attempt {
  id: string; level: BankLevel; total_questions: number; correct_answers: number; score_percentage: number;
  passed: boolean; time_spent_seconds: number; answers: AnswerLog[]; created_at: string;
}
type View = { kind: "home" } | { kind: "quiz"; level: BankLevel } | { kind: "result"; attempt: Attempt } | { kind: "review"; attempt: Attempt };

const LEVELS: { id: BankLevel; desc: string; tone: string }[] = [
  { id: "junior", desc: "Fundamentos: Java, Maven, Gherkin, Selenium, estrutura do projeto.", tone: "text-success" },
  { id: "pleno", desc: "Esperas, ThreadLocal, Hooks, relatórios, CI/CD e boas práticas.", tone: "text-primary" },
  { id: "senior", desc: "Arquitetura, SOLID, concorrência, pipelines e questões discursivas.", tone: "text-warning" },
];
const byN = new Map(questionBank.map((q) => [q.n, q]));
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** Código em linhas que começam com palavras de Java/XML é exibido em bloco monoespaçado. */
function Stem({ text }: { text: string }) {
  const lines = text.split("\n").filter((l) => l.trim() !== "Java");
  const isCode = (l: string) => /[;{}]\s*$|^\s*(public|private|if|TakesScreenshot|File|<|@)/.test(l);
  const blocks: { code: boolean; lines: string[] }[] = [];
  lines.forEach((l) => {
    const c = isCode(l);
    const last = blocks[blocks.length - 1];
    if (last && last.code === c) last.lines.push(l); else blocks.push({ code: c, lines: [l] });
  });
  return (
    <div className="space-y-2">
      {blocks.map((b, i) => b.code ? (
        <pre key={i} className="rounded-xl bg-background/80 border border-border/60 p-3 text-xs font-mono overflow-x-auto text-foreground/90">{b.lines.join("\n")}</pre>
      ) : (
        <p key={i} className="text-base sm:text-lg font-medium text-foreground leading-relaxed">{b.lines.join(" ")}</p>
      ))}
    </div>
  );
}

function Quiz({ level, onDone, onExit }: { level: BankLevel; onDone: (a: Omit<Attempt, "id" | "created_at">) => void; onExit: () => void }) {
  const questions = useMemo(() => shuffle(questionBank.filter((q) => q.level === level)).map((q) => {
    if (q.type !== "choice") return q;
    const order = shuffle(q.options!.map((_, i) => i));
    return { ...q, options: order.map((i) => q.options![i]), answer: order.indexOf(q.answer!), _order: order } as BankQuestion & { _order: number[] };
  }), [level]);
  const [idx, setIdx] = useState(0);
  const [logs, setLogs] = useState<AnswerLog[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const qStart = useRef(0);
  useEffect(() => { const t = setInterval(() => setElapsed((e) => e + 1), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { qStart.current = elapsed; /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [idx]);

  const q = questions[idx];
  const current = logs.find((l) => l.n === q.n);
  const correctSoFar = logs.filter((l) => l.correct).length;

  const record = (correct: boolean, selected: number | null) => {
    setLogs((p) => [...p, { n: q.n, selected, text: q.type === "open" ? text : undefined, correct, timeSec: elapsed - qStart.current }]);
  };
  const choose = (i: number) => { if (current) return; setPicked(i); record(i === q.answer, (q as any)._order?.[i] ?? i); };
  const next = () => {
    if (idx + 1 < questions.length) { setIdx(idx + 1); setPicked(null); setText(""); setRevealed(false); return; }
    const correct = logs.filter((l) => l.correct).length;
    const score = Math.round((correct / questions.length) * 100);
    onDone({ level, total_questions: questions.length, correct_answers: correct, score_percentage: score, passed: score >= BANK_PASS_SCORE, time_spent_seconds: elapsed, answers: logs });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={onExit} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Sair</button>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-primary/15 text-primary border border-primary/20">Nível {LEVEL_LABEL[level]}</span>
          <span className="flex items-center gap-1 text-muted-foreground"><Timer className="h-3.5 w-3.5" /> {fmt(elapsed)}</span>
          <span className="text-success">{correctSoFar} acertos</span>
          <span className="text-destructive">{logs.length - correctSoFar} erros</span>
        </div>
      </div>
      <ProgressBar value={idx + (current ? 1 : 0)} max={questions.length} label={`Questão ${idx + 1} de ${questions.length}`} size="sm" />
      <div className="flex gap-1 flex-wrap" aria-hidden>
        {questions.map((qq, i) => {
          const l = logs.find((x) => x.n === qq.n);
          return <span key={qq.n} className={`h-1.5 w-3 rounded-full transition-colors ${l ? (l.correct ? "bg-success" : "bg-destructive") : i === idx ? "bg-primary" : "bg-secondary"}`} />;
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.section key={q.n} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}
          className="rounded-2xl bg-card/55 backdrop-blur-xl border border-border/50 shadow-elevated p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">Q{String(q.n).padStart(2, "0")}</span>
            <span>·</span>
            <span>{q.type === "open" ? "Discursiva (autoavaliação)" : "Múltipla escolha"}</span>
          </div>
          <Stem text={q.question} />

          {q.type === "choice" ? (
            <div className="space-y-2">
              {q.options!.map((opt, i) => {
                const isRight = i === q.answer; const sel = picked === i;
                const cls = !current ? "border-border/50 hover:border-primary/50 hover:bg-primary/5"
                  : isRight ? "border-success/60 bg-success/10" : sel ? "border-destructive/60 bg-destructive/10" : "border-border/30 opacity-60";
                return (
                  <motion.button key={i} whileTap={!current ? { scale: 0.99 } : undefined} onClick={() => choose(i)} disabled={!!current}
                    className={`w-full text-left flex gap-3 items-start text-sm px-4 py-3 rounded-xl border transition-all ${cls}`}>
                    <span className="h-6 w-6 shrink-0 rounded-full border border-current/30 grid place-items-center text-xs font-semibold">{String.fromCharCode(65 + i)}</span>
                    <span className="flex-1 text-foreground break-words">{opt}</span>
                    {current && isRight && <CheckCircle2 className="h-5 w-5 text-success shrink-0" />}
                    {current && sel && !isRight && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea value={text} onChange={(e) => setText(e.target.value)} disabled={revealed} rows={5} placeholder="Escreva sua resposta antes de ver a resposta esperada..." />
              {!revealed && <Button variant="secondary" onClick={() => setRevealed(true)} disabled={text.trim().length < 10}><Eye className="h-4 w-4 mr-1.5" /> Ver resposta esperada</Button>}
            </div>
          )}

          <AnimatePresence>
            {(current || revealed) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border-l-4 p-4 text-sm space-y-1 ${!current ? "border-l-primary bg-primary/5" : current.correct ? "border-l-success bg-success/[0.07]" : "border-l-destructive bg-destructive/[0.07]"}`}>
                <p className="font-semibold text-foreground">
                  {!current ? "Resposta esperada" : current.correct ? "Correto!" : q.type === "choice" ? `Incorreto — a resposta certa é ${String.fromCharCode(65 + q.answer!)}` : "Registrado como erro"}
                </p>
                <p className="text-foreground/85 whitespace-pre-line leading-relaxed">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {q.type === "open" && revealed && !current && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground w-full">Compare com a resposta esperada. Sua resposta contemplou os pontos principais?</span>
              <Button onClick={() => record(true, null)} className="bg-success text-success-foreground hover:bg-success/90"><CheckCircle2 className="h-4 w-4 mr-1.5" /> Sim, acertei</Button>
              <Button variant="destructive" onClick={() => record(false, null)}><XCircle className="h-4 w-4 mr-1.5" /> Não, errei</Button>
            </div>
          )}

          {current && (
            <div className="flex justify-end">
              <Button onClick={next} className="gradient-primary text-primary-foreground shadow-glow min-h-11">
                {idx + 1 < questions.length ? <>Próxima <ArrowRight className="h-4 w-4 ml-1.5" /></> : <>Finalizar e ver nota <Award className="h-4 w-4 ml-1.5" /></>}
              </Button>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

function Review({ attempt, onBack }: { attempt: Attempt; onBack: () => void }) {
  const [onlyErrors, setOnlyErrors] = useState(!attempt.passed);
  const list = attempt.answers.filter((a) => !onlyErrors || !a.correct);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Voltar</button>
        <div className="flex gap-2">
          <Button size="sm" variant={onlyErrors ? "secondary" : "default"} onClick={() => setOnlyErrors(false)}>Todas ({attempt.answers.length})</Button>
          <Button size="sm" variant={onlyErrors ? "default" : "secondary"} onClick={() => setOnlyErrors(true)}>Só erros ({attempt.answers.filter((a) => !a.correct).length})</Button>
        </div>
      </div>
      {list.length === 0 && <p className="text-sm text-muted-foreground">Nenhum erro nesta tentativa.</p>}
      {list.map((a, i) => {
        const q = byN.get(a.n); if (!q) return null;
        return (
          <motion.div key={a.n} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
            className={`rounded-xl border p-4 space-y-2 bg-card/50 ${a.correct ? "border-success/30" : "border-destructive/30"}`}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">Q{String(q.n).padStart(2, "0")}</span>
              <span className="flex items-center gap-2"><Clock className="h-3 w-3" />{fmt(a.timeSec)} {a.correct ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}</span>
            </div>
            <Stem text={q.question} />
            {q.type === "choice" ? (
              <div className="text-sm space-y-1">
                {a.selected !== null && <p className={a.correct ? "text-success" : "text-destructive"}>Sua resposta: {q.options![a.selected]}</p>}
                {!a.correct && <p className="text-success">Correta: {q.options![q.answer!]}</p>}
              </div>
            ) : a.text ? <p className="text-sm text-foreground/80 italic">Sua resposta: {a.text}</p> : null}
            <p className="text-sm text-foreground/80 border-l-2 border-primary/40 pl-3 whitespace-pre-line">{q.explanation}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function BancoQuestoes() {
  const { user } = useAuth();
  const [view, setView] = useState<View>({ kind: "home" });
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("automation_bank_attempts").select("*").order("created_at", { ascending: false }).limit(100);
    setAttempts((data as unknown as Attempt[]) ?? []);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const finish = async (a: Omit<Attempt, "id" | "created_at">) => {
    if (!user) return;
    setSaving(true);
    const { data } = await supabase.from("automation_bank_attempts").insert({ ...a, answers: a.answers as any, user_id: user.id }).select().single();
    setSaving(false);
    const saved = (data as unknown as Attempt) ?? { ...a, id: "local", created_at: new Date().toISOString() };
    setAttempts((p) => [saved, ...p]);
    setView({ kind: "result", attempt: saved });
  };

  const stats = (lvl?: BankLevel) => {
    const list = attempts.filter((a) => !lvl || a.level === lvl);
    const n = list.length;
    return {
      n, best: n ? Math.max(...list.map((a) => a.score_percentage)) : 0,
      avg: n ? Math.round(list.reduce((s, a) => s + a.score_percentage, 0) / n) : 0,
      passed: list.some((a) => a.passed),
      avgQ: n ? Math.round(list.reduce((s, a) => s + a.time_spent_seconds, 0) / list.reduce((s, a) => s + a.total_questions, 0)) : 0,
    };
  };
  const errorLog = useMemo(() => {
    const m = new Map<number, number>();
    attempts.forEach((a) => a.answers.forEach((x) => { if (!x.correct) m.set(x.n, (m.get(x.n) ?? 0) + 1); }));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [attempts]);
  const all = stats();

  return (
    <AppLayout>
      <Seo title="Banco de Questões | Central Automation" description="Questionário por nível Júnior, Pleno e Sênior com feedback imediato, histórico e revisão." path="/banco-questoes" />
      <div className={`${TRACK_THEMES.automacao.themeClass} font-body p-4 sm:p-6 max-w-4xl mx-auto space-y-6`}>
        {view.kind === "home" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <header className="space-y-2">
              <Link to="/automacao" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Curso de Automação</Link>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2"><Layers className="h-7 w-7 text-primary" /> Banco de Questões</h1>
              <p className="text-muted-foreground text-sm">Framework Central Automation v2.0 · 40 questões por nível · aprovação mínima de {BANK_PASS_SCORE}% · feedback imediato a cada resposta.</p>
            </header>

            <div className="grid sm:grid-cols-3 gap-4">
              {LEVELS.map((l, i) => {
                const s = stats(l.id);
                return (
                  <motion.div key={l.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }} whileHover={{ y: -4 }}
                    className="rounded-2xl bg-card/55 backdrop-blur-xl border border-border/50 shadow-card p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h2 className={`font-display text-xl font-bold ${l.tone}`}>{LEVEL_LABEL[l.id]}</h2>
                      {s.passed && <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/15 text-success flex items-center gap-1"><Award className="h-3 w-3" /> Aprovado</span>}
                    </div>
                    <p className="text-xs text-muted-foreground flex-1">{l.desc}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-secondary/50 p-2"><p className="text-muted-foreground">Melhor nota</p><p className="text-foreground font-semibold text-base">{s.n ? `${s.best}%` : "—"}</p></div>
                      <div className="rounded-lg bg-secondary/50 p-2"><p className="text-muted-foreground">Tentativas</p><p className="text-foreground font-semibold text-base">{s.n}</p></div>
                    </div>
                    <Button onClick={() => setView({ kind: "quiz", level: l.id })} className="gradient-primary text-primary-foreground shadow-glow min-h-11"><Play className="h-4 w-4 mr-1.5" /> Iniciar 40 questões</Button>
                  </motion.div>
                );
              })}
            </div>

            <section className="rounded-2xl bg-card/45 border border-border/50 p-5 space-y-4">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Métricas de desempenho</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[{ l: "Tentativas", v: all.n, i: History }, { l: "Média geral", v: all.n ? `${all.avg}%` : "—", i: Target }, { l: "Melhor nota", v: all.n ? `${all.best}%` : "—", i: Award }, { l: "Tempo médio/questão", v: all.n ? `${all.avgQ}s` : "—", i: Clock }].map((m) => (
                  <div key={m.l} className="rounded-xl bg-secondary/40 p-3"><m.i className="h-4 w-4 text-primary mb-1" /><p className="text-xs text-muted-foreground">{m.l}</p><p className="text-lg font-semibold text-foreground">{m.v}</p></div>
                ))}
              </div>
              {errorLog.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5"><ListX className="h-4 w-4 text-destructive" /> Questões que você mais erra</h3>
                  {errorLog.map(([n, c]) => (
                    <div key={n} className="flex items-start gap-3 text-sm rounded-lg bg-destructive/[0.06] border border-destructive/20 px-3 py-2">
                      <span className="font-mono text-xs text-muted-foreground pt-0.5">Q{String(n).padStart(2, "0")}</span>
                      <span className="flex-1 text-foreground/85 line-clamp-2">{byN.get(n)?.question.split("\n")[0]}</span>
                      <span className="text-xs text-destructive shrink-0">{c}x</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-card/45 border border-border/50 p-5 space-y-3">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Histórico</h2>
              {attempts.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma tentativa ainda. Escolha um nível para começar.</p> : attempts.map((a) => (
                <button key={a.id} onClick={() => setView({ kind: "review", attempt: a })} className="w-full flex items-center gap-3 text-left rounded-xl border border-border/40 hover:bg-secondary/50 transition-colors px-3 py-2.5">
                  {a.passed ? <CheckCircle2 className="h-5 w-5 text-success shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{LEVEL_LABEL[a.level]} · {a.score_percentage}% ({a.correct_answers}/{a.total_questions})</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("pt-BR")} · {fmt(a.time_spent_seconds)}</p>
                  </div>
                  <span className="text-xs text-primary">Revisar</span>
                </button>
              ))}
            </section>
          </motion.div>
        )}

        {view.kind === "quiz" && <Quiz level={view.level} onDone={finish} onExit={() => setView({ kind: "home" })} />}
        {saving && <p className="text-sm text-muted-foreground">Salvando resultado...</p>}

        {view.kind === "result" && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-card/60 border border-border/50 shadow-elevated p-6 sm:p-8 text-center space-y-4">
            {view.attempt.passed ? <Award className="h-14 w-14 text-success mx-auto" /> : <XCircle className="h-14 w-14 text-destructive mx-auto" />}
            <h2 className="font-display text-2xl font-bold text-foreground">{view.attempt.passed ? "Aprovado!" : "Ainda não foi desta vez"}</h2>
            <p className="text-5xl font-display font-bold text-foreground">{view.attempt.score_percentage}%</p>
            <p className="text-sm text-muted-foreground">Nível {LEVEL_LABEL[view.attempt.level]} · {view.attempt.correct_answers} acertos de {view.attempt.total_questions} · tempo {fmt(view.attempt.time_spent_seconds)} · mínimo {BANK_PASS_SCORE}%</p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button variant="secondary" onClick={() => setView({ kind: "review", attempt: view.attempt })}><Eye className="h-4 w-4 mr-1.5" /> Revisar respostas</Button>
              <Button variant="secondary" onClick={() => setView({ kind: "quiz", level: view.attempt.level })}><RefreshCw className="h-4 w-4 mr-1.5" /> Refazer</Button>
              <Button onClick={() => setView({ kind: "home" })} className="gradient-primary text-primary-foreground">Voltar ao painel</Button>
            </div>
          </motion.div>
        )}

        {view.kind === "review" && <Review attempt={view.attempt} onBack={() => setView({ kind: "home" })} />}
      </div>
    </AppLayout>
  );
}
