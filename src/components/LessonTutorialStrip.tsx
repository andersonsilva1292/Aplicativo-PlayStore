import { BookOpen, Code2, ClipboardCheck, Send } from "lucide-react";

const STEPS = [
  { icon: BookOpen, label: "1. Assista", hint: "vídeo-aula + checkpoints" },
  { icon: Code2, label: "2. Pratique", hint: "playground com execução" },
  { icon: ClipboardCheck, label: "3. Responda", hint: "questionário 70%" },
  { icon: Send, label: "4. Entregue", hint: "envio do exercício" },
];

/** Figurinha/tutorial visual do fluxo de aprendizagem de cada aula */
export default function LessonTutorialStrip() {
  return (
    <ol className="grid grid-cols-2 md:grid-cols-4 gap-2" aria-label="Como estudar esta aula">
      {STEPS.map(({ icon: Icon, label, hint }) => (
        <li key={label} className="rounded-xl bg-white/5 border border-border/40 p-3 flex items-start gap-2.5">
          <span className="h-8 w-8 shrink-0 rounded-lg gradient-primary text-primary-foreground grid place-items-center">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{label}</p>
            <p className="text-[11px] text-muted-foreground">{hint}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
