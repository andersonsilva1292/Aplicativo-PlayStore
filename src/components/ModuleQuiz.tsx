import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Lock, RotateCcw, Trophy, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { questionBank, BANK_PASS_SCORE, LEVEL_LABEL, type BankLevel } from "@/data/automation-question-bank";

export const MAX_QUIZ_ATTEMPTS = 3;
const QUESTIONS_PER_ROUND = 10;

interface Props {
  passed: boolean;
  lastScore: number;
  attempts: number;
  locked: boolean;
  onFinish: (score: number, passed: boolean) => Promise<void>;
}

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Questionário adaptativo: escolha de nível, validação instantânea e avanço automático. */
export default function ModuleQuiz({ passed, lastScore, attempts, locked, onFinish }: Props) {
  const [level, setLevel] = useState<BankLevel | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const correctRef = useRef(0);

  const questions = useMemo(() => {
    if (!level) return [];
    return shuffle(questionBank.filter((q) => q.level === level && q.type === "choice" && q.options && q.answer !== undefined))
      .slice(0, QUESTIONS_PER_ROUND)
      .map((q) => {
        const right = q.options![q.answer!];
        const options = shuffle(q.options!);
        return { ...q, options, answer: options.indexOf(right) };
      });
  }, [level]);

  const remaining = MAX_QUIZ_ATTEMPTS - attempts;

  const reset = () => {
    setLevel(null);
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    correctRef.current = 0;
    setResult(null);
  };

  const choose = (oi: number) => {
    if (picked !== null) return;
    const q = questions[index];
    setPicked(oi);
    const ok = oi === q.answer;
    if (ok) {
      correctRef.current += 1;
      setCorrect(correctRef.current);
    }
    setTimeout(async () => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1);
        setPicked(null);
        return;
      }
      const score = Math.round((correctRef.current / questions.length) * 100);
      const ok2 = score >= BANK_PASS_SCORE;
      setResult({ score, passed: ok2 });
      if (ok2) toast.success(`Aprovado com ${score}%!`, { description: "Próxima etapa liberada." });
      else toast.error(`Nota ${score}% — mínimo ${BANK_PASS_SCORE}%`);
      await onFinish(score, ok2);
    }, ok ? 900 : 1700);
  };

  if (locked) {
    return (
      <section className="rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-6 text-center space-y-2">
        <Lock className="h-8 w-8 mx-auto text-destructive" />
        <h3 className="font-display font-semibold text-foreground">Questionário bloqueado para reestudo</h3>
        <p className="text-sm text-muted-foreground">
          As 3 tentativas foram esgotadas e o progresso do módulo foi reiniciado. Revise a vídeo-aula ou o material complementar para liberar novamente.
        </p>
      </section>
    );
  }

  if (!level) {
    return (
      <section className="rounded-2xl border border-border bg-card/55 p-5 shadow-card sm:p-6 space-y-5">
        {passed && (
          <p className="text-sm text-success flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Você já foi aprovado com {lastScore}%. Pode refazer para praticar.
          </p>
        )}
        <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <p className="text-foreground/90">
            Você tem até <strong>{MAX_QUIZ_ATTEMPTS} tentativas</strong> para atingir {BANK_PASS_SCORE}%. Se reprovar nas 3, o módulo será
            reiniciado e todo o conteúdo precisará ser revisado. Tentativas restantes: <strong>{Math.max(0, remaining)}</strong>.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Escolha o nível de dificuldade</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(LEVEL_LABEL) as BankLevel[]).map((lv, i) => (
              <motion.button
                key={lv}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLevel(lv)}
                className="rounded-xl border border-border bg-secondary/40 p-4 text-left hover:border-primary/60 hover:bg-primary/10 transition-colors"
              >
                <p className="font-display font-semibold text-foreground">{LEVEL_LABEL[lv]}</p>
                <p className="text-xs text-muted-foreground mt-1">{QUESTIONS_PER_ROUND} questões sorteadas</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (result) {
    const exhausted = !result.passed && attempts >= MAX_QUIZ_ATTEMPTS;
    return (
      <motion.section initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-border bg-card/55 p-6 text-center space-y-3 shadow-card">
        {result.passed ? <Trophy className="h-10 w-10 mx-auto text-success" /> : <XCircle className="h-10 w-10 mx-auto text-destructive" />}
        <p className="font-display text-3xl font-bold text-foreground">{result.score}%</p>
        <p className="text-sm text-muted-foreground">
          {correct} de {questions.length} acertos · nível {LEVEL_LABEL[level]}
        </p>
        <p className={`text-sm font-medium ${result.passed ? "text-success" : "text-destructive"}`}>
          {result.passed ? "Aprovado! Próxima etapa liberada." : exhausted ? "Tentativas esgotadas — o módulo foi reiniciado para reestudo." : `Reprovado. Restam ${MAX_QUIZ_ATTEMPTS - attempts} tentativa(s).`}
        </p>
        {!exhausted && (
          <Button variant="secondary" onClick={reset} className="min-h-10">
            <RotateCcw className="h-4 w-4 mr-1.5" /> {result.passed ? "Praticar de novo" : "Nova tentativa"}
          </Button>
        )}
      </motion.section>
    );
  }

  const q = questions[index];
  return (
    <section className="rounded-2xl border border-border bg-card/55 p-5 shadow-card sm:p-6 space-y-4 overflow-hidden">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Nível {LEVEL_LABEL[level]}</span>
        <span>
          Questão {index + 1} de {questions.length} · {correct} acertos
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div className="h-full bg-success" animate={{ width: `${(index / questions.length) * 100}%` }} transition={{ duration: 0.4 }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.28, ease: "easeOut" }} className="space-y-3">
          <p className="text-base font-medium text-foreground">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const reveal = picked !== null;
              const right = oi === q.answer;
              const sel = picked === oi;
              return (
                <motion.button
                  key={oi}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => choose(oi)}
                  className={`w-full text-left text-sm px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${
                    reveal && right
                      ? "border-success/50 bg-success/15 text-foreground"
                      : reveal && sel
                      ? "border-destructive/50 bg-destructive/15 text-foreground"
                      : "border-border/50 hover:bg-secondary/60 text-foreground/85"
                  }`}
                >
                  <span className="font-semibold">{String.fromCharCode(65 + oi)})</span> <span className="flex-1">{opt}</span>
                  {reveal && right && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {reveal && sel && !right && <XCircle className="h-4 w-4 text-destructive" />}
                </motion.button>
              );
            })}
          </div>
          {picked !== null && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-3">
              {q.explanation}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
