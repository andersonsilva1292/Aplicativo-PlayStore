import { BookOpen, Check, Lock, PlayCircle } from "lucide-react";
import { modules, type Lesson } from "@/data/automation-course";

interface Props {
  currentId: string;
  isComplete: (lesson: Lesson) => boolean;
  isUnlocked: (lessonId: string) => boolean;
  onSelect: (lesson: Lesson) => void;
  percent: number;
}

/** Grade curricular estilo EAD: módulos com aulas, status e aula atual destacada. */
export default function CourseSidebar({ currentId, isComplete, isUnlocked, onSelect, percent }: Props) {
  return (
    <aside aria-label="Conteúdo do curso" className="rounded-2xl overflow-hidden border border-border bg-card/55 backdrop-blur-xl lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] flex flex-col shadow-elevated">
      <div className="px-5 py-5 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-5 w-5 text-primary" />
          <p className="font-display font-semibold text-foreground">Roteiro de estudo</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progresso do curso</span>
          <span className="font-semibold text-success">{percent}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
          <div className="h-full rounded-full bg-success transition-[width] duration-700" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="overflow-y-auto py-2">
        {modules.map((m, mi) => {
          const doneCount = m.lessons.filter(isComplete).length;
          return (
            <section key={m.id} className="border-b border-border/40 last:border-0 py-2">
              <div className="px-5 pt-3 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">Módulo {mi + 1} · Mês {m.month}</p>
                  <p className="text-[10px] text-muted-foreground">{doneCount}/{m.lessons.length}</p>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground leading-snug">{m.title}</p>
              </div>
              <ul className="pb-2">
                {m.lessons.map((l) => {
                  const done = isComplete(l);
                  const open = done || isUnlocked(l.id);
                  const active = l.id === currentId;
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => open && onSelect(l)}
                        disabled={!open}
                        aria-current={active ? "page" : undefined}
                        className={`group w-full min-h-[48px] flex items-start gap-3 px-5 py-2.5 text-left text-sm transition-all duration-200 border-l-2 ${
                          active
                            ? "border-primary bg-primary/10 text-foreground"
                            : open
                            ? "border-transparent text-foreground/80 hover:bg-secondary/60 hover:text-foreground"
                            : "border-transparent text-muted-foreground/60 cursor-not-allowed"
                        }`}
                      >
                        <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${done ? "border-success/40 bg-success/15" : active ? "border-primary/50 bg-primary/15" : "border-border bg-background/40"}`}>
                          {done ? (
                            <Check className="h-3.5 w-3.5 text-success" />
                          ) : open ? (
                            <PlayCircle className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block leading-snug font-medium">{l.title}</span>
                          <span className="mt-0.5 block text-[10px] text-muted-foreground">{l.duration}{active ? " · em andamento" : ""}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
