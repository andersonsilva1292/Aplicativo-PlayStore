import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PagerStep {
  key: string;
  label: string;
  short: string;
  done: boolean;
  unlocked: boolean;
  blockedHint?: string;
}

interface Props {
  steps: PagerStep[];
  current: number;
  onChange: (index: number) => void;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
  nextLessonLabel?: string;
}

/** Paginação interna da aula: indicador de páginas + navegação Voltar/Avançar. */
export default function StepPager({ steps, current, onChange, onPrevLesson, onNextLesson, nextLessonLabel }: Props) {
  const next = steps[current + 1];
  const isLast = current >= steps.length - 1;
  const canAdvance = !!next?.unlocked;
  const advanceHint = !next ? undefined : next.unlocked ? undefined : next.blockedHint;

  return (
    <div className="space-y-3">
      <nav aria-label="Páginas da etapa" className="rounded-2xl border border-border bg-card/45 p-2.5 sm:p-3 backdrop-blur-xl">
        <ol className="flex gap-1.5 sm:gap-2 overflow-x-auto">
          {steps.map((s, i) => {
            const active = i === current;
            const clickable = s.unlocked;
            return (
              <li key={s.key} className="shrink-0 flex-1 min-w-[4.5rem]">
                <button
                  onClick={() => clickable && onChange(i)}
                  disabled={!clickable}
                  aria-current={active ? "page" : undefined}
                  title={clickable ? s.label : s.blockedHint}
                  className={`w-full min-h-[48px] px-2 sm:px-3 py-2 rounded-lg border text-[11px] sm:text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    active
                      ? "border-primary/60 bg-primary/15 text-foreground"
                      : s.done
                      ? "border-success/40 bg-success/10 text-foreground/90 hover:bg-success/15"
                      : clickable
                       ? "border-border/40 text-foreground/85 hover:bg-secondary/60"
                      : "border-border/30 text-muted-foreground/60 cursor-not-allowed"
                  }`}
                >
                  <span
                     className={`h-5 w-5 rounded-full grid place-items-center text-[10px] font-semibold shrink-0 ${
                      s.done ? "bg-success text-success-foreground" : active ? "gradient-primary text-primary-foreground" : "bg-secondary"
                    }`}
                  >
                    {s.done ? <Check className="h-3 w-3" /> : !clickable ? <Lock className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="truncate hidden xs:inline sm:inline">{s.short}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          className="w-full sm:w-auto min-h-[44px]"
          onClick={() => (current > 0 ? onChange(current - 1) : onPrevLesson?.())}
          disabled={current === 0 && !onPrevLesson}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          {current > 0 ? "Voltar" : "Aula anterior"}
        </Button>

        <div className="flex flex-col items-stretch sm:items-end gap-1">
          {isLast ? (
            <Button
              className="w-full sm:w-auto min-h-[44px] gradient-primary text-primary-foreground shadow-glow disabled:opacity-40"
              onClick={() => onNextLesson?.()}
              disabled={!onNextLesson}
            >
              {nextLessonLabel ?? "Próxima aula"} <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              className="w-full sm:w-auto min-h-[44px] gradient-primary text-primary-foreground shadow-glow disabled:opacity-40"
              onClick={() => canAdvance && onChange(current + 1)}
              disabled={!canAdvance}
              title={advanceHint}
            >
              Avançar <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          )}
          {advanceHint && !isLast && <p className="text-[11px] text-muted-foreground sm:text-right">{advanceHint}</p>}
        </div>
      </div>
    </div>
  );
}
