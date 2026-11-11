import { useEffect, useMemo, useState } from "react";
import { CodeMentorPanel } from "@/components/CodeMentorPanel";
import { Link } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { keymap, EditorView } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";
import { ArrowLeft, CheckCheck, Copy, Eraser, FileCode2, Play, StickyNote } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { oneDarkTheme } from "@/lib/editor-theme";
import { TYPING_SNIPPETS, TYPING_TOPICS } from "@/data/typing-practice";
import { compareTyping, type TypingReport } from "@/lib/typing-compare";
import { execute } from "@/lib/java-sim";
import { toast } from "sonner";

const NOTES_KEY = "typing-practice:notes";
const draftKey = (id: string) => `typing-practice:draft:${id}`;

export default function PraticaDigitacao() {
  const isMobile = useIsMobile();
  const [snipId, setSnipId] = useState(TYPING_SNIPPETS[0].id);
  const snip = TYPING_SNIPPETS.find((s) => s.id === snipId)!;
  const [code, setCode] = useState("");
  const [report, setReport] = useState<TypingReport | null>(null);
  const [console_, setConsole] = useState<string[]>([]);
  const [notes, setNotes] = useState(() => localStorage.getItem(NOTES_KEY) ?? "");

  useEffect(() => { setCode(localStorage.getItem(draftKey(snipId)) ?? ""); setReport(null); setConsole([]); }, [snipId]);
  useEffect(() => { localStorage.setItem(draftKey(snipId), code); }, [code, snipId]);
  useEffect(() => { localStorage.setItem(NOTES_KEY, notes); }, [notes]);

  const extensions = useMemo(() => [java(), indentUnit.of("    "), keymap.of([indentWithTab]), EditorView.lineWrapping], []);
  const readOnlyExt = useMemo(() => [java(), EditorView.editable.of(false)], []);

  const copy = async () => { await navigator.clipboard.writeText(code); toast.success("Código copiado."); };
  const verify = () => setReport(compareTyping(code, snip.code));
  const run = () => setConsole(execute(code, `${code.match(/class\s+(\w+)/)?.[1] ?? "Main"}.java`).lines);

  const reference = (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-border/40 bg-muted/20 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto">
          {TYPING_TOPICS.map((t) => (
            <span key={t} className="shrink-0 text-[11px] text-muted-foreground px-1">{t}:</span>
          )).flatMap((label, i) => [label, ...TYPING_SNIPPETS.filter((s) => s.topic === TYPING_TOPICS[i]).map((s) => (
            <button key={s.id} onClick={() => setSnipId(s.id)}
              className={`shrink-0 text-xs px-2 py-1 rounded-md border transition-colors ${s.id === snipId ? "border-primary bg-primary/15 text-primary" : "border-border/40 text-foreground/80 hover:bg-muted/40"}`}>
              {s.title}
            </button>
          ))])}
        </div>
        <p className="text-xs font-mono text-muted-foreground flex items-center gap-1"><FileCode2 className="h-3.5 w-3.5" /> Modelo do instrutor · {snip.topic}</p>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <CodeMirror value={snip.code} theme={oneDarkTheme} extensions={readOnlyExt} height="100%" className="h-full text-sm" />
      </div>
      <div className="border-t border-border/40 p-3 space-y-1.5">
        <p className="text-xs font-semibold text-foreground flex items-center gap-1"><StickyNote className="h-3.5 w-3.5 text-warning" /> Anotações da aula</p>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Registre aqui as dicas do professor… (salvo automaticamente)" className="h-24 text-xs font-mono resize-none" />
      </div>
    </div>
  );

  const editor = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/40 bg-muted/20 flex-wrap">
        <span className="text-xs font-mono text-muted-foreground">Sua digitação · Tab indenta</span>
        <div className="flex gap-1.5 flex-wrap">
          <Button size="sm" variant="ghost" onClick={() => setCode("")}><Eraser className="h-3.5 w-3.5 mr-1" />Limpar</Button>
          <Button size="sm" variant="ghost" onClick={copy}><Copy className="h-3.5 w-3.5 mr-1" />Copiar</Button>
          <Button size="sm" variant="ghost" onClick={() => setCode(snip.code)}><FileCode2 className="h-3.5 w-3.5 mr-1" />Carregar exemplo</Button>
          <Button size="sm" variant="secondary" onClick={run}><Play className="h-3.5 w-3.5 mr-1" />Executar</Button>
          <Button size="sm" onClick={verify} className="gradient-primary text-primary-foreground"><CheckCheck className="h-3.5 w-3.5 mr-1" />Verificar digitação</Button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <CodeMirror value={code} onChange={setCode} theme={oneDarkTheme} extensions={extensions} height="100%" className="h-full text-sm" placeholder="Digite aqui o código acompanhando a aula…" />
      </div>
      <div className="border-t border-border/40 max-h-56 overflow-auto p-3 text-xs space-y-2 bg-background">
        {report ? (
          <>
            <p className={`font-semibold ${report.accuracy === 100 ? "text-success" : report.accuracy >= 70 ? "text-warning" : "text-destructive"}`}>
              Precisão: {report.accuracy}% · {report.correctLines}/{report.totalLines} linhas corretas
            </p>
            {report.issues.length === 0 ? <p className="text-success">Perfeito! Digitação idêntica ao modelo.</p> : (
              <ul className="space-y-1 font-mono">
                {report.issues.map((i, k) => <li key={k} className="text-foreground/85"><span className="text-destructive">{i.line ? `Linha ${i.line}` : "Geral"}:</span> {i.message}</li>)}
              </ul>
            )}
          </>
        ) : console_.length ? (
          <pre className="font-mono whitespace-pre-wrap text-foreground/90">{console_.join("\n")}</pre>
        ) : <p className="text-muted-foreground">Clique em “Verificar digitação” para comparar com o modelo, ou “Executar” para ver a saída.</p>}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <Seo path="/pratica-digitacao" title="Prática de Digitação Java" description="Acompanhe a videoaula e pratique a digitação de código Java linha por linha." />
      <div className="space-y-3">
        <div>
          <Link to="/automacao" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Curso de Automação</Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Prática de Digitação Java</h1>
          <p className="text-xs text-muted-foreground">Deixe a videoaula aberta ao lado e digite o código do instrutor. A execução é simulada no navegador.</p>
        </div>
        <div className="rounded-xl border border-border/50 overflow-hidden glass-card" style={{ height: isMobile ? "auto" : "78vh" }}>
          {isMobile ? (
            <div className="flex flex-col"><div className="h-[60vh]">{editor}</div><div className="h-[60vh] border-t border-border/40">{reference}</div></div>
          ) : (
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={45} minSize={25}>{reference}</ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={55} minSize={30}>{editor}</ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
        <CodeMentorPanel code={code} />
      </div>
    </AppLayout>
  );
}
