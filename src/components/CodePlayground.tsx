import { useState } from "react";
import { Play, Trash2, RotateCcw, Terminal, Save, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePracticeDrafts, sanitizeDraftTitle, type PracticeDraft } from "@/hooks/usePracticeDrafts";

const SNIPPETS: { label: string; code: string }[] = [
  {
    label: "Page Object simulado",
    code: `// Simulação de Page Object com "driver" fake
class LoginPage {
  constructor(driver) { this.driver = driver; }
  login(user, pass) {
    this.driver.type("#user", user);
    this.driver.type("#pass", pass);
    this.driver.click("#entrar");
    return this.driver.text("#msg");
  }
}

const driver = {
  log: [],
  type(sel, v) { this.log.push(\`type \${sel} = \${v}\`); },
  click(sel) { this.log.push(\`click \${sel}\`); },
  text() { return "Bem-vindo, QA!"; },
};

const page = new LoginPage(driver);
console.log(page.login("anderson", "123456"));
console.log(driver.log.join("\\n"));`,
  },
  {
    label: "Cenário Gherkin em passos",
    code: `const steps = {
  "dado que estou na tela de login": () => console.log("abrindo navegador..."),
  "quando informo credenciais validas": () => console.log("preenchendo campos..."),
  "entao vejo a home": () => console.log("assert: titulo = Home"),
};

Object.keys(steps).forEach((s) => { console.log("▶ " + s); steps[s](); });`,
  },
  {
    label: "Casos de teste automáticos",
    code: `// Use test(), assertEquals() e assertTrue() — o relatório aparece abaixo
function somaEsperada(a, b) { return a + b; }
function normaliza(texto) { return texto.trim().toLowerCase(); }

test("soma de valores limite", () => {
  assertEquals(somaEsperada(2, 2), 4, "2 + 2 = 4");
});

test("normalização de entrada", () => {
  assertEquals(normaliza("  QA  "), "qa", "remove espaços e minúsculas");
});

test("caso proposital com falha", () => {
  assertTrue(normaliza("QA") === "Qa", "compara texto sem normalizar");
});

console.log("execução concluída");`,
  },
];


interface PlaygroundTest {
  name: string;
  passed: boolean;
  detail: string;
}

/**
 * Playground livre: o aluno escreve e EXECUTA código de verdade no navegador
 * (sandbox JavaScript com console capturado) e pode validar a própria solução
 * com casos de teste usando as funções `test`, `assertEquals` e `assertTrue`.
 */
export default function CodePlayground({ onRun, lessonId }: { onRun?: () => void; lessonId?: string }) {
  const { drafts, saveDraft, deleteDraft } = usePracticeDrafts(lessonId);
  const [code, setCode] = useState(SNIPPETS[0].code);
  const [title, setTitle] = useState("Rascunho de prática");
  const [currentDraft, setCurrentDraft] = useState<PracticeDraft | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftMsg, setDraftMsg] = useState<string | null>(null);

  const persist = async (asNew: boolean) => {
    setSavingDraft(true);
    setDraftMsg(null);
    const saved = await saveDraft({
      id: asNew ? undefined : currentDraft?.id,
      title: sanitizeDraftTitle(title),
      code,
    });
    setSavingDraft(false);
    if (!saved) {
      setDraftMsg("Não foi possível salvar o rascunho.");
      return;
    }
    setCurrentDraft(saved);
    setTitle(saved.title);
    setDraftMsg(`Salvo em ${new Date(saved.updated_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`);
  };

  const openDraft = (d: PracticeDraft) => {
    setCurrentDraft(d);
    setTitle(d.title);
    setCode(d.code);
    setDraftMsg(`Rascunho "${d.title}" carregado`);
  };

  const [output, setOutput] = useState<string[]>([]);
  const [tests, setTests] = useState<PlaygroundTest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    const logs: string[] = [];
    const results: PlaygroundTest[] = [];
    const fakeConsole = {
      log: (...a: unknown[]) => logs.push(a.map(fmt).join(" ")),
      error: (...a: unknown[]) => logs.push("erro: " + a.map(fmt).join(" ")),
      warn: (...a: unknown[]) => logs.push("aviso: " + a.map(fmt).join(" ")),
    };
    const assertEquals = (atual: unknown, esperado: unknown, nome = "assertEquals") => {
      const ok = fmt(atual) === fmt(esperado);
      results.push({ name: nome, passed: ok, detail: `esperado: ${fmt(esperado)} · atual: ${fmt(atual)}` });
      return ok;
    };
    const assertTrue = (cond: unknown, nome = "assertTrue") => {
      results.push({ name: nome, passed: !!cond, detail: `esperado: true · atual: ${fmt(cond)}` });
      return !!cond;
    };
    const test = (nome: string, fn: () => void) => {
      const before = results.length;
      try {
        fn();
        if (results.length === before) {
          results.push({ name: nome, passed: true, detail: "executado sem erros" });
        } else {
          for (let i = before; i < results.length; i++) results[i].name = `${nome} › ${results[i].name}`;
        }

      } catch (e) {
        results.push({ name: nome, passed: false, detail: e instanceof Error ? `${e.name}: ${e.message}` : String(e) });
      }
    };
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("console", "test", "assertEquals", "assertTrue", `"use strict";\n${code}`);
      fn(fakeConsole, test, assertEquals, assertTrue);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
    }
    setOutput(logs);
    setTests(results);
    onRun?.();
  };


  return (
    <div className="rounded-xl border border-border/50 bg-black/30 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/40 bg-white/5 flex-wrap">
        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5" /> Prática livre · execução real no navegador
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setOutput([])} aria-label="Limpar console">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Console
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setCode(SNIPPETS[0].code)}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reiniciar
          </Button>
          <Button size="sm" variant="secondary" onClick={() => persist(false)} disabled={savingDraft}>
            {savingDraft ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            {currentDraft ? "Atualizar" : "Salvar"} rascunho
          </Button>
          <Button size="sm" onClick={run} className="gradient-primary text-primary-foreground">
            <Play className="h-3.5 w-3.5 mr-1" /> Executar
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {SNIPPETS.map((s) => (
            <button
              key={s.label}
              onClick={() => setCode(s.code)}
              className="text-[11px] px-2 py-1 rounded-lg bg-white/5 border border-border/40 text-foreground/80 hover:bg-white/10"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Gerenciamento de rascunhos */}
        <div className="rounded-xl border border-border/40 bg-white/5 p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="draft-title">
              Nome do rascunho
            </label>
            <input
              id="draft-title"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do rascunho"
              className="flex-1 min-w-[180px] text-xs px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {currentDraft && (
              <>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => persist(true)}>
                  Salvar como novo
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-destructive"
                  onClick={async () => {
                    await deleteDraft(currentDraft.id);
                    setCurrentDraft(null);
                    setDraftMsg("Rascunho excluído");
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                </Button>
              </>
            )}
          </div>
          {drafts.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5 text-primary" /> Meus rascunhos ({drafts.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {drafts.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => openDraft(d)}
                    className={`text-[11px] px-2 py-1 rounded-lg border transition-colors ${
                      currentDraft?.id === d.id
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border/40 bg-white/5 text-foreground/80 hover:bg-white/10"
                    }`}
                    title={`Atualizado em ${new Date(d.updated_at).toLocaleString("pt-BR")}`}
                  >
                    {d.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          {draftMsg && <p className="text-[11px] text-success">{draftMsg}</p>}
        </div>

        <label className="sr-only" htmlFor="playground-code">
          Editor de prática livre
        </label>
        <textarea
          id="playground-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          rows={12}
          className="w-full font-mono text-xs p-3 rounded-lg bg-black/50 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
        />

        <pre className="text-xs font-mono p-3 rounded-xl bg-black/60 border border-white/10 text-foreground/90 overflow-x-auto min-h-[64px]">
          {output.length === 0 && !error ? "// saída do console aparece aqui" : output.join("\n")}
          {error && `\n${error}`}
        </pre>

        {tests.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2 animate-slide-up">
            <p className="text-xs font-mono text-foreground/90">
              Tests run: {tests.length} · Passed: {tests.filter((t) => t.passed).length} · Failures:{" "}
              {tests.filter((t) => !t.passed).length}
            </p>
            <ul className="space-y-1.5">
              {tests.map((t, i) => (
                <li
                  key={t.name + i}
                  className={`text-xs rounded-lg border p-2 ${
                    t.passed ? "border-success/25 bg-success/5" : "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <span className={`font-medium ${t.passed ? "text-success" : "text-destructive"}`}>
                    {t.passed ? "✔" : "✘"} {t.name}
                  </span>
                  <p className="text-muted-foreground mt-0.5">{t.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground/70">
          A lógica praticada aqui é a mesma dos frameworks Java (Page Objects, steps e asserções); a execução em navegador
          usa JavaScript por segurança e não interfere na avaliação das aulas.
        </p>
      </div>
    </div>
  );
}

function fmt(v: unknown) {
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
