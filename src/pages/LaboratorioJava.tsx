import { useCallback, useEffect, useMemo, useState } from "react";
import { CodeMentorPanel } from "@/components/CodeMentorPanel";
import { Link } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { autocompletion, type CompletionContext } from "@codemirror/autocomplete";
import { oneDarkTheme } from "@/lib/editor-theme";
import { ArrowLeft, CheckCircle2, Circle, Lock, Play, RotateCcw, ShieldCheck, Terminal, Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useDevMode } from "@/hooks/useDevMode";
import { supabase } from "@/integrations/supabase/client";
import { LAB_EXERCISES, TROUBLESHOOTING } from "@/data/java-lab-exercises";
import { compile, execute, validate, FRAMEWORK_SYMBOLS, type ValidationResult } from "@/lib/java-sim";
import { toast } from "sonner";

const draftKey = (id: string) => `java-lab-draft:${id}`;

function frameworkCompletions(ctx: CompletionContext) {
  const word = ctx.matchBefore(/[\w.]+/);
  if (!word || (word.from === word.to && !ctx.explicit)) return null;
  return { from: word.from, options: FRAMEWORK_SYMBOLS.map((s) => ({ label: s, type: "function" })) };
}

export default function LaboratorioJava() {
  const { user } = useAuth();
  const devMode = useDevMode();
  const isMobile = useIsMobile();
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [index, setIndex] = useState(0);
  const ex = LAB_EXERCISES[index];
  const fileName = `${ex.template.match(/class\s+(\w+)/)?.[1] ?? "Main"}.java`;
  const [code, setCode] = useState(ex.template);
  const [terminal, setTerminal] = useState<string[]>([]);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [busy, setBusy] = useState<"run" | "validate" | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("java_lab_submissions").select("exercise_id").eq("user_id", user.id).eq("passed", true)
      .then(({ data }) => setPassedIds(new Set((data ?? []).map((d) => d.exercise_id))));
  }, [user]);

  useEffect(() => {
    setCode(localStorage.getItem(draftKey(ex.id)) ?? ex.template);
    setTerminal([]);
    setResults([]);
  }, [ex.id, ex.template]);

  useEffect(() => { localStorage.setItem(draftKey(ex.id), code); }, [code, ex.id]);

  const isUnlocked = (i: number) => devMode || i === 0 || passedIds.has(LAB_EXERCISES[i - 1].id);

  const javaLinter = useMemo(() => linter((view) => {
    const doc = view.state.doc;
    return compile(doc.toString(), fileName).map<Diagnostic>((e) => {
      const line = doc.line(Math.min(Math.max(e.line, 1), doc.lines));
      return { from: line.from, to: line.to, severity: "error", message: e.message };
    });
  }, { delay: 400 }), [fileName]);

  const streamLines = useCallback(async (lines: string[]) => {
    setTerminal([]);
    for (const l of lines) {
      setTerminal((t) => [...t, l]);
      await new Promise((r) => setTimeout(r, 70));
    }
  }, []);

  const run = async () => {
    setBusy("run");
    setResults([]);
    await streamLines(execute(code, fileName).lines);
    setBusy(null);
  };

  const check = async () => {
    if (!user) return;
    setBusy("validate");
    const v = validate(code, ex);
    await streamLines([...v.run.lines, "", `[Gabarito] ${v.passed}/${v.total} verificações aprovadas`]);
    setResults(v.results);
    await supabase.from("java_lab_submissions").insert({
      user_id: user.id, exercise_id: ex.id, code, logs: v.run.lines.join("\n"),
      passed: v.success, passed_count: v.passed, total_count: v.total,
    });
    if (v.success) {
      setPassedIds((s) => new Set(s).add(ex.id));
      const now = new Date().toISOString();
      const { data: row } = await supabase.from("automation_progress").select("id").eq("user_id", user.id).eq("lesson_id", ex.id).maybeSingle();
      if (row) await supabase.from("automation_progress").update({ code_submitted: code, submitted_at: now }).eq("id", row.id);
      else await supabase.from("automation_progress").insert({ user_id: user.id, lesson_id: ex.id, code_submitted: code, submitted_at: now });
      toast.success("Exercício concluído! O próximo foi liberado.");
    } else toast.error("Ainda há verificações falhando. Veja as dicas abaixo.");
    setBusy(null);
  };

  const done = LAB_EXERCISES.filter((e) => passedIds.has(e.id)).length;

  const statementPanel = (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <p className="text-xs text-primary font-medium">{ex.module} · Exercício {index + 1} de {LAB_EXERCISES.length}</p>
        <h2 className="font-display text-lg font-semibold text-foreground">{ex.title}</h2>
        <p className="text-sm text-foreground/85 mt-2">{ex.statement}</p>
      </div>
      <div className="grid gap-2 text-xs">
        <p><span className="text-muted-foreground">Entrada:</span> <span className="text-foreground">{ex.input}</span></p>
        <p><span className="text-muted-foreground">Saída esperada:</span> <span className="text-foreground">{ex.output}</span></p>
      </div>
      {results.length > 0 && (
        <ul className="space-y-1.5">
          {results.map((r) => (
            <li key={r.name} className={`text-xs rounded-lg border p-2 ${r.passed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
              <span className={r.passed ? "text-success" : "text-destructive"}>{r.passed ? "✔" : "✘"} {r.name}</span>
              {!r.passed && <p className="text-muted-foreground mt-0.5">{r.hint}</p>}
            </li>
          ))}
        </ul>
      )}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Diagnóstico de erros comuns</h3>
        <div className="space-y-2">
          {TROUBLESHOOTING.map((t) => (
            <div key={t.ex} className="rounded-lg border border-border/40 bg-muted/20 p-2 text-xs">
              <p className="font-mono text-warning">{t.ex}</p>
              <p className="text-muted-foreground">Causa: {t.cause}</p>
              <p className="text-foreground/85">Ação: {t.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const editorPanel = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/40 bg-muted/20 flex-wrap">
        <span className="text-xs font-mono text-muted-foreground">src/test/java/{fileName}</span>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost"><RotateCcw className="h-3.5 w-3.5 mr-1" /> Restaurar</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restaurar o código base?</AlertDialogTitle>
                <AlertDialogDescription>Seu código atual deste exercício será substituído pelo modelo inicial.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => setCode(ex.template)}>Restaurar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button size="sm" variant="secondary" onClick={run} disabled={!!busy}>
            {busy === "run" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1" />} Executar código
          </Button>
          <Button size="sm" onClick={check} disabled={!!busy} className="gradient-primary text-primary-foreground">
            {busy === "validate" ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5 mr-1" />} Validar resposta
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <CodeMirror
          value={code}
          onChange={setCode}
          height="100%"
          className="h-full text-sm"
          theme={oneDarkTheme}
          extensions={[java(), javaLinter, lintGutter(), autocompletion({ override: [frameworkCompletions] })]}
        />
      </div>
    </div>
  );

  const terminalPanel = (
    <div className="h-full flex flex-col bg-background">
      <div className="px-3 py-1.5 border-b border-border/40 text-xs font-mono text-muted-foreground flex items-center gap-1.5">
        <Terminal className="h-3.5 w-3.5" /> Console · sandbox simulada (512 MB · 1 vCPU · 10 s)
      </div>
      <pre className="flex-1 overflow-auto p-3 text-xs font-mono text-foreground/90 whitespace-pre-wrap">
        {terminal.length === 0 ? "// clique em Executar código para ver a saída" : terminal.map((l, i) => (
          <div key={i} className={/error|Exception|Timeout/.test(l) ? "text-destructive" : l.startsWith("$") ? "text-primary" : l.startsWith("[") ? "text-muted-foreground" : ""}>{l || "\u00a0"}</div>
        ))}
      </pre>
    </div>
  );

  return (
    <AppLayout>
      <Seo path="/laboratorio-java" title="Laboratório Java · Central Automation" description="IDE web para praticar automação de testes em Java com JUnit e Selenium." />
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <Link to="/automacao" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Curso de Automação</Link>
            <h1 className="font-display text-2xl font-bold text-foreground">Laboratório Java</h1>
            <p className="text-xs text-muted-foreground">Simulação no navegador: a compilação e a execução são imitadas, não rodam Java real.</p>
          </div>
          <span className="text-sm text-muted-foreground">{done}/{LAB_EXERCISES.length} concluídos</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {LAB_EXERCISES.map((e, i) => {
            const unlocked = isUnlocked(i);
            return (
              <button
                key={e.id}
                disabled={!unlocked}
                onClick={() => setIndex(i)}
                title={e.title}
                className={`shrink-0 text-xs px-2.5 py-1.5 rounded-lg border inline-flex items-center gap-1 transition-colors ${i === index ? "border-primary bg-primary/15 text-primary" : "border-border/40 bg-muted/20 text-foreground/80"} disabled:opacity-40`}
              >
                {passedIds.has(e.id) ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : unlocked ? <Circle className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden glass-card" style={{ height: isMobile ? "auto" : "75vh" }}>
          {isMobile ? (
            <div className="flex flex-col">
              <div className="h-[60vh]">{editorPanel}</div>
              <div className="h-64 border-t border-border/40">{terminalPanel}</div>
              <div className="border-t border-border/40">{statementPanel}</div>
            </div>
          ) : (
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={30} minSize={20}>{statementPanel}</ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={70} minSize={40}>
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={65} minSize={30}>{editorPanel}</ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={35} minSize={15}>{terminalPanel}</ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
        <CodeMentorPanel code={code} />
      </div>
    </AppLayout>
  );
}
