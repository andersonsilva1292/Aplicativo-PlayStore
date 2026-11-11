import { BookOpen, CheckCircle2, Lightbulb, ShieldAlert, Sparkles } from "lucide-react";
import type { LessonExtras } from "@/data/lesson-extras";

/** Reforço de estudo: resumo, pontos-chave, erros comuns, boas práticas e glossário. */
export default function LessonExtrasPanel({ extras }: { extras: LessonExtras }) {
  return (
    <div className="space-y-4">
      <section className="rounded-r-2xl border border-l-4 border-success/30 border-l-success bg-success/[0.07] p-4 sm:p-5">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-1.5">
          <Sparkles className="h-4 w-4 text-success" /> Resumo da aula
        </h3>
        <p className="text-sm text-foreground/90 leading-relaxed">{extras.summary}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card icon={CheckCircle2} title="Pontos-chave" tone="success" items={extras.keyPoints} />
        <Card icon={ShieldAlert} title="Erros comuns" tone="warning" items={extras.commonMistakes} />
        <Card icon={Lightbulb} title="Boas práticas" tone="primary" items={extras.bestPractices} />

        <section className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-2.5">
            <BookOpen className="h-4 w-4 text-primary" /> Glossário
          </h3>
          <dl className="space-y-2.5 text-sm">
            {extras.glossary.map((g) => (
              <div key={g.term}>
                <dt className="font-medium text-foreground">{g.term}</dt>
                <dd className="text-muted-foreground">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  tone: "success" | "warning" | "primary";
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary";
  return (
    <section className="rounded-2xl border border-border bg-card/50 p-4 sm:p-5 transition-colors duration-300 hover:border-primary/40">
      <h3 className="font-display font-semibold text-foreground flex items-center gap-2 mb-2.5">
        <Icon className={`h-4 w-4 ${toneClass}`} /> {title}
      </h3>
      <ul className="space-y-2 text-sm text-foreground/90">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${toneClass.replace("text-", "bg-")}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
