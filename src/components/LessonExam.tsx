import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Award, CheckCircle2, PartyPopper, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EXAM_PASS_SCORE, type LessonExtras } from "@/data/lesson-extras";
import type { QuizQuestion } from "@/data/automation-course";

interface Props {
  exam: LessonExtras["exam"];
  passed: boolean;
  lastScore: number;
  attempts: number;
  onFinish: (score: number, passed: boolean) => Promise<void> | void;
  onWrongAnswer?: (info: string) => void;
}

interface Shuffled extends QuizQuestion {
  key: number;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const spring = { type: "spring" as const, stiffness: 320, damping: 30 };

/** Prova final: uma questão por vez, sorteada a cada tentativa, com feedback imediato. */
export default function LessonExam({ exam, passed, lastScore, attempts, onFinish, onWrongAnswer }: Props) {
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [firstWrong, setFirstWrong] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  // Sorteia a ordem das questões e das alternativas a cada nova tentativa.
  const questions = useMemo<Shuffled[]>(
    () =>
      shuffle(exam).map((q, i) => {
        const correct = q.options[q.answer];
        const options = shuffle(q.options);
        return { ...q, options, answer: options.indexOf(correct), key: i };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exam, round]
  );

  const q = questions[index];
  const answered = picked !== null;
  const isRight = answered && picked === q?.answer;
  const isLast = index === questions.length - 1;

  const choose = (oi: number) => {
    if (answered) return;
    setPicked(oi);
    if (oi === q.answer) setCorrectCount((c) => c + 1);
    else if (!firstWrong) {
      setFirstWrong(`${q.question}\nAlternativas: ${q.options.join(" | ")}\nResposta correta: ${q.options[q.answer]}`);
    }
  };

  const next = async () => {
    if (!isLast) {
      setIndex((i) => i + 1);
      setPicked(null);
      return;
    }
    const score = Math.round((correctCount / questions.length) * 100);
    const ok = score >= EXAM_PASS_SCORE;
    setResult({ score, passed: ok });
    if (firstWrong && onWrongAnswer) onWrongAnswer(firstWrong);
    setSaving(true);
    await onFinish(score, ok);
    setSaving(false);
  };

  const retry = () => {
    setIndex(0);
    setPicked(null);
    setCorrectCount(0);
    setFirstWrong(null);
    setResult(null);
    setRound((r) => r + 1);
  };

  return (
    <section className="glass-card rounded-3xl p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <span className="ios-icon ios-icon-primary h-7 w-7"><Award className="h-4 w-4 text-primary-foreground" /></span>
            Prova final da aula
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {questions.length} questões, uma por vez · aprovação mínima de {EXAM_PASS_SCORE}% · nova ordem a cada tentativa
          </p>
        </div>
        <div className="text-xs text-right">
          {passed ? (
            <span className="text-success flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Aprovado com {lastScore}%
            </span>
          ) : attempts > 0 ? (
            <span className="text-muted-foreground">
              Última nota: {lastScore}% · {attempts} tentativa{attempts > 1 ? "s" : ""}
            </span>
          ) : null}
        </div>
      </div>

      {result ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
          className="space-y-3 text-center py-4"
        >
          <span className={`ios-icon mx-auto h-14 w-14 ${result.passed ? "ios-icon-primary" : ""}`}>
            {result.passed ? <CheckCircle2 className="h-7 w-7 text-primary-foreground" /> : <XCircle className="h-7 w-7 text-destructive" />}
          </span>
          <p className="font-display text-3xl font-bold text-foreground">{result.score}%</p>
          <p className={`text-sm font-medium ${result.passed ? "text-success" : "text-destructive"}`}>
            {result.passed ? "Aprovado! A próxima etapa foi liberada." : `Faltou pouco: o mínimo é ${EXAM_PASS_SCORE}%.`}
          </p>
          <p className="text-xs text-muted-foreground">{correctCount} de {questions.length} acertos</p>
          {!result.passed && (
            <Button variant="secondary" className="min-h-11 rounded-full" onClick={retry} disabled={saving}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> Tentar de novo com novas questões
            </Button>
          )}
        </motion.div>
      ) : q ? (
        <>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Questão {index + 1} de {questions.length}</span>
              <span>{correctCount} acerto{correctCount === 1 ? "" : "s"}</span>
            </div>
            <Progress value={((index + (answered ? 1 : 0)) / questions.length) * 100} className="h-1.5" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${round}-${q.key}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={spring}
              className="space-y-3"
            >
              <p className="text-base font-medium text-foreground">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = picked === oi;
                  const right = oi === q.answer;
                  return (
                    <motion.button
                      key={oi}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => choose(oi)}
                      disabled={answered}
                      className={`w-full text-left text-sm px-4 py-3 rounded-2xl border transition-colors ${
                        answered && right
                          ? "border-success/50 bg-success/15 text-foreground"
                          : answered && selected
                          ? "border-destructive/50 bg-destructive/15 text-foreground"
                          : "border-border bg-secondary/40 hover:bg-secondary text-foreground"
                      }`}
                    >
                      <span className="font-semibold text-muted-foreground mr-2">{String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={spring}
                    className={`rounded-2xl border p-4 space-y-1.5 ${isRight ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"}`}
                    role="status"
                  >
                    <p className={`font-semibold flex items-center gap-2 ${isRight ? "text-success" : "text-destructive"}`}>
                      {isRight ? <PartyPopper className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {isRight ? "Parabéns! Resposta correta." : `Não foi dessa vez. A correta é a ${String.fromCharCode(65 + q.answer)}.`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Por que: </span>{q.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          <Button
            onClick={next}
            disabled={!answered || saving}
            className="w-full sm:w-auto min-h-11 rounded-full gradient-primary text-primary-foreground shadow-glow disabled:opacity-40"
          >
            {saving ? "Enviando..." : isLast ? "Ver meu resultado" : "Próxima questão"}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </>
      ) : null}
    </section>
  );
}
