import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock, Play } from "lucide-react";
import type { Lesson } from "@/data/automation-course";

interface Props {
  lessons: Lesson[];
  currentId: string;
  isComplete: (lesson: Lesson) => boolean;
  isUnlocked: (lessonId: string) => boolean;
  onSelect: (lesson: Lesson) => void;
}

/** Barra de etapas: concluídas navegáveis livremente, atual destacada, futuras bloqueadas. */
export default function JourneyStepper({ lessons, currentId, isComplete, isUnlocked, onSelect }: Props) {
  const reduce = useReducedMotion();

  return (
    <nav aria-label="Etapas da trajetória" className="glass-card rounded-xl p-4">
      <ol className="flex gap-2 overflow-x-auto pb-1">
        {lessons.map((lesson, i) => {
          const done = isComplete(lesson);
          const unlocked = isUnlocked(lesson.id);
          const active = lesson.id === currentId;
          const clickable = done || unlocked;
          return (
            <li key={lesson.id} className="shrink-0">
              <button
                onClick={() => clickable && onSelect(lesson)}
                disabled={!clickable}
                aria-current={active ? "step" : undefined}
                title={clickable ? lesson.title : "Conclua a etapa anterior para liberar"}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-colors ${
                  active
                    ? "border-primary/60 text-foreground"
                    : done
                    ? "border-success/40 bg-success/10 text-foreground/90 hover:bg-success/15"
                    : clickable
                    ? "border-border/40 text-foreground/85 hover:bg-white/5"
                    : "border-border/30 text-muted-foreground/60 cursor-not-allowed"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="journey-active-step"
                    className="absolute inset-0 rounded-xl bg-primary/15"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span
                    className={`h-5 w-5 rounded-lg grid place-items-center text-[10px] font-semibold ${
                      done ? "bg-success text-success-foreground" : active ? "gradient-primary text-primary-foreground" : "bg-white/10"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" /> : !clickable ? <Lock className="h-3 w-3" /> : active ? <Play className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="max-w-[9rem] truncate">{lesson.title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
