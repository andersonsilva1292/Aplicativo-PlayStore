import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertOctagon, AlertTriangle, Lightbulb, GraduationCap, CheckCircle2, ChevronDown } from "lucide-react";
import { analyzeJava, type MentorSeverity } from "@/lib/java-mentor";

const SEV: Record<MentorSeverity, { icon: typeof AlertOctagon; label: string; cls: string }> = {
  critico: { icon: AlertOctagon, label: "Crítico", cls: "text-destructive border-destructive/40 bg-destructive/10" },
  atencao: { icon: AlertTriangle, label: "Atenção", cls: "text-warning border-warning/40 bg-warning/10" },
  dica: { icon: Lightbulb, label: "Dica", cls: "text-primary border-primary/40 bg-primary/10" },
};

export function CodeMentorPanel({ code }: { code: string }) {
  const [debounced, setDebounced] = useState(code);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(code), 400);
    return () => clearTimeout(t);
  }, [code]);
  const report = useMemo(() => analyzeJava(debounced), [debounced]);
  const ring = 2 * Math.PI * 26;
  const color = report.score >= 85 ? "hsl(var(--success))" : report.score >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <section aria-label="Mentor técnico" className="rounded-xl border border-border/50 glass-card p-4 space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 60 60" className="h-16 w-16 -rotate-90">
            <circle cx="30" cy="30" r="26" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
            <motion.circle cx="30" cy="30" r="26" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={ring} animate={{ strokeDashoffset: ring - (ring * report.score) / 100 }} transition={{ duration: 0.6 }} />
          </svg>
          <span className="absolute inset-0 grid place-items-center font-display text-sm font-bold text-foreground">{report.score}</span>
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-display font-semibold text-foreground"><GraduationCap className="h-4 w-4 text-primary" /> Mentor técnico</p>
          <p className="text-xs text-muted-foreground">Nível do código: <strong className="text-foreground">{report.level}</strong> · analisa enquanto você digita</p>
          {report.strengths.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {report.strengths.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] text-success"><CheckCircle2 className="h-3 w-3" />{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {report.tips.length === 0 ? (
        <p className="text-xs text-muted-foreground">{debounced.trim() ? "Nenhum problema encontrado. Código limpo de profissional! 🎯" : "Comece a digitar para receber orientações."}</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {report.tips.map((t) => {
              const s = SEV[t.severity];
              const isOpen = open === t.id;
              return (
                <motion.li key={t.id} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  className={`rounded-lg border ${s.cls}`}>
                  <button onClick={() => setOpen(isOpen ? null : t.id)} className="flex w-full items-center gap-2 p-2.5 text-left">
                    <s.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-xs font-semibold text-foreground">{t.title}</span>
                    <span className="text-[10px] opacity-80">linha {t.line}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="space-y-1.5 px-2.5 pb-2.5 text-xs">
                          <p className="text-foreground/85"><strong>Por quê:</strong> {t.why}</p>
                          <pre className="whitespace-pre-wrap rounded-md bg-background/70 p-2 font-mono text-[11px] text-foreground">{t.fix}</pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
