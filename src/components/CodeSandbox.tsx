import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Send, CheckCircle2, XCircle, Lightbulb, FlaskConical, Timer, AlertTriangle, Save, Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Exercise } from "@/data/automation-course";
import { runCodeTests, structuralTests, testsFromRequired, type CodeTestReport } from "@/lib/code-tests";

interface CodeSandboxProps {
  exercise: Exercise;
  initialCode?: string | null;
  /** Rascunho salvo anteriormente (prioridade sobre o código enviado) */
  draft?: string | null;
  draftSavedAt?: string | null;
  submitted?: boolean;
  onSubmit: (code: string) => Promise<void> | void;
  /** Persiste o rascunho do exercício no backend */
  onSaveDraft?: (code: string) => Promise<void> | void;
}

/**
 * Ambiente hands-on: editor de código com validação automática por casos de
 * teste e feedback detalhado (o que passou, o que falhou, esperado x encontrado,
 * linha e como corrigir). O envio só é liberado quando todos os casos
 * obrigatórios passam.
 */
export default function CodeSandbox({
  exercise,
  initialCode,
  draft,
  draftSavedAt,
  submitted,
  onSubmit,
  onSaveDraft,
}: CodeSandboxProps) {
  const [code, setCode] = useState(draft || initialCode || exercise.starter);
  const [report, setReport] = useState<CodeTestReport | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [sending, setSending] = useState(false);
  const [draftState, setDraftState] = useState<"idle" | "dirty" | "saving" | "saved">("idle");
  const [savedAt, setSavedAt] = useState<string | null>(draftSavedAt ?? null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(code);

  latest.current = code;

  const persistDraft = async (value: string) => {
    if (!onSaveDraft) return;
    setDraftState("saving");
    try {
      await onSaveDraft(value);
      setSavedAt(new Date().toISOString());
      setDraftState("saved");
    } catch {
      setDraftState("dirty");
    }
  };

  /** Autosave do rascunho 1,5s após a última digitação */
  const changeCode = (value: string) => {
    setCode(value);
    if (!onSaveDraft) return;
    setDraftState("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => persistDraft(value), 1500);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const suite = useMemo(
    () => [...structuralTests(), ...testsFromRequired(exercise.required), ...(exercise.tests ?? [])],
    [exercise]
  );

  const run = () => setReport(runCodeTests(code, suite));

  const send = async () => {
    setSending(true);
    try {
      await onSubmit(code);
    } finally {
      setSending(false);
    }
  };

  const approved = report?.approved ?? false;

  return (
    <div className="rounded-2xl border border-border/50 bg-black/30 overflow-hidden card-modern">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/40 bg-white/5 flex-wrap">
        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
          <FlaskConical className="h-3.5 w-3.5 text-primary" /> Sandbox · {suite.length} casos de teste automáticos
        </span>
        <div className="flex gap-2 items-center">
          {onSaveDraft && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (timer.current) clearTimeout(timer.current);
                persistDraft(latest.current);
              }}
              disabled={draftState === "saving"}
              className="text-xs"
            >
              {draftState === "saving" ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1" />
              )}
              Salvar rascunho
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={run} className="hover-scale">
            <Play className="h-3.5 w-3.5 mr-1" /> Rodar testes
          </Button>
          <Button
            size="sm"
            onClick={send}
            disabled={!approved || sending}
            className="gradient-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5 mr-1" /> {submitted ? "Reenviar" : "Enviar"}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-foreground">{exercise.prompt}</p>
        <label className="sr-only" htmlFor="sandbox-code">
          Editor de código do exercício
        </label>
        <textarea
          id="sandbox-code"
          value={code}
          onChange={(e) => changeCode(e.target.value)}
          spellCheck={false}
          rows={10}
          className="w-full font-mono text-xs p-3 rounded-xl bg-black/50 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y transition-shadow focus:shadow-glow"
        />

        {onSaveDraft && (
          <div className="flex items-center justify-between gap-3 flex-wrap text-[11px]">
            <span
              className={
                draftState === "saved"
                  ? "text-success"
                  : draftState === "dirty"
                  ? "text-warning"
                  : "text-muted-foreground"
              }
            >
              {draftState === "saving"
                ? "Salvando rascunho..."
                : draftState === "dirty"
                ? "Alterações não salvas — salvamento automático em instantes"
                : savedAt
                ? `Rascunho salvo em ${new Date(savedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
                : "Rascunho automático ativado — você pode sair e voltar depois"}
            </span>
            <div className="flex gap-2">
              {initialCode && initialCode !== code && (
                <button
                  onClick={() => changeCode(initialCode)}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Undo2 className="h-3 w-3" /> Usar código enviado
                </button>
              )}
              <button
                onClick={() => changeCode(exercise.starter)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Undo2 className="h-3 w-3" /> Recomeçar do modelo
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowHint((v) => !v)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <Lightbulb className="h-3.5 w-3.5" /> {showHint ? "Ocultar dica" : "Ver dica"}
        </button>
        {showHint && <p className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-3">{exercise.hint}</p>}

        <AnimatePresence mode="wait">
          {report && (
            <motion.div
              key={report.durationMs + "-" + report.score}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Resumo */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-mono">
                  <span className="text-foreground/90">
                    Tests run: {report.total} · Passed: {report.passed} · Failures: {report.failed}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" /> {report.durationMs} ms
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${report.score}%` }}
                    transition={{ type: "spring", stiffness: 90, damping: 18 }}
                    className={report.approved ? "h-full gradient-success" : "h-full bg-destructive/70"}
                  />
                </div>
                <p className={`text-xs font-medium ${report.approved ? "text-success" : "text-destructive"}`}>
                  {report.approved
                    ? "BUILD SUCCESS — todos os casos obrigatórios passaram. Você pode enviar."
                    : `BUILD FAILURE — ${report.results.filter((r) => !r.passed && !r.optional).length} caso(s) obrigatório(s) falhando.`}
                </p>
              </div>

              {/* Detalhe por caso de teste */}
              <ul className="space-y-1.5">
                {report.results.map((r, i) => (
                  <motion.li
                    key={r.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`rounded-xl border p-2.5 text-xs ${
                      r.passed
                        ? "border-success/25 bg-success/5"
                        : r.optional
                        ? "border-warning/30 bg-warning/5"
                        : "border-destructive/30 bg-destructive/5"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {r.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      ) : r.optional ? (
                        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium text-foreground">
                          {r.name}
                          {r.optional && <span className="ml-1.5 text-warning/80">(recomendado)</span>}
                          {r.line && <span className="ml-1.5 text-muted-foreground font-mono">linha {r.line}</span>}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="text-foreground/70">esperado:</span> {r.expected}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="text-foreground/70">encontrado:</span> {r.actual}
                        </p>
                        {!r.passed && (
                          <p className="text-foreground/85 border-l-2 border-primary/40 pl-2">Como corrigir: {r.message}</p>
                        )}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
