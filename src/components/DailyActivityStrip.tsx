interface Props {
  activity: { created_at: string }[];
  days?: number;
}

/** Mapa de atividade diária dos últimos dias (salvo no backend por aluno) */
export default function DailyActivityStrip({ activity, days = 14 }: Props) {
  const counts = new Map<string, number>();
  activity.forEach((a) => {
    const key = new Date(a.created_at).toDateString();
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: d, count: counts.get(d.toDateString()) || 0 };
  });

  const tone = (c: number) =>
    c === 0 ? "bg-white/5 border-border/40" : c < 3 ? "bg-primary/25 border-primary/30" : c < 6 ? "bg-primary/50 border-primary/40" : "gradient-primary border-primary/60";

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Atividade diária (últimos {days} dias)</p>
      <div className="flex flex-wrap gap-1.5">
        {cells.map(({ date, count }) => (
          <div
            key={date.toISOString()}
            title={`${date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} · ${count} atividade(s)`}
            aria-label={`${date.toLocaleDateString("pt-BR")}: ${count} atividades`}
            className={`h-7 w-7 rounded-lg border grid place-items-center text-[10px] text-foreground/80 ${tone(count)}`}
          >
            {date.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
}
