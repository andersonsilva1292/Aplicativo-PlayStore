import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle, Check, Copy, Info, List, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  /** Conteúdo em Markdown da aula. */
  children: string;
  /** Exibe o sumário lateral gerado a partir dos títulos. */
  toc?: boolean;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const flatten = (node: unknown): string => {
  if (node === null || node === undefined || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flatten).join("");
  const el = node as { props?: { children?: unknown } };
  return el.props ? flatten(el.props.children) : "";
};

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = flatten(children);
  return (
    <div className="relative group my-4">
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        aria-label="Copiar código"
        className="absolute right-2 top-2 z-10 h-9 px-2.5 rounded-lg border border-border/50 bg-background/80 backdrop-blur text-xs text-foreground/85 flex items-center gap-1.5 hover:bg-white/10 transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copiado" : "Copiar"}
      </button>
      <pre className="p-4 pr-24 rounded-xl bg-black/45 border border-white/10 overflow-x-auto text-[12.5px] leading-relaxed font-mono text-foreground">
        {children}
      </pre>
    </div>
  );
}

/** Blockquote vira bloco de destaque: "Atenção"/"Cuidado" = alerta, restante = dica. */
function Callout({ children }: { children: React.ReactNode }) {
  const text = flatten(children).toLowerCase();
  const warn = /aten[çc][ãa]o|cuidado|evite|nunca|risco/.test(text);
  const Icon = warn ? AlertTriangle : Info;
  return (
    <div
      className={`my-4 rounded-xl border p-4 flex gap-3 text-sm ${
        warn ? "border-warning/40 bg-warning/10" : "border-primary/35 bg-primary/10"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${warn ? "text-warning" : "text-primary"}`} />
      <div className="[&>p]:mb-0 [&>p+p]:mt-2 text-foreground/90">{children}</div>
    </div>
  );
}

/** Leitor de material de estudo: tipografia confortável, sumário, destaques e código copiável. */
export default function StudyDoc({ children, toc = true }: Props) {
  const [scale, setScale] = useState(1);

  const headings = useMemo(
    () =>
      children
        .split("\n")
        .filter((l) => /^#{2,3}\s+/.test(l))
        .map((l) => {
          const level = l.startsWith("###") ? 3 : 2;
          const text = l.replace(/^#{2,3}\s+/, "").replace(/[*`]/g, "").trim();
          return { level, text, id: slug(text) };
        }),
    [children]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">Leitura de apoio da aula</p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            className="h-9 w-9 p-0"
            aria-label="Diminuir texto"
            onClick={() => setScale((s) => Math.max(0.9, +(s - 0.1).toFixed(2)))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(scale * 100)}%</span>
          <Button
            variant="secondary"
            size="sm"
            className="h-9 w-9 p-0"
            aria-label="Aumentar texto"
            onClick={() => setScale((s) => Math.min(1.35, +(s + 0.1).toFixed(2)))}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <article
          className="min-w-0 text-foreground/90 leading-relaxed"
          style={{ fontSize: `${scale}rem` }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children: c }) => (
                <h2 id={slug(flatten(c))} className="font-display text-xl font-bold text-foreground mt-6 mb-3 scroll-mt-24">
                  {c}
                </h2>
              ),
              h2: ({ children: c }) => (
                <h2 id={slug(flatten(c))} className="font-display text-lg font-bold text-foreground mt-6 mb-3 pb-1.5 border-b border-border/40 scroll-mt-24">
                  {c}
                </h2>
              ),
              h3: ({ children: c }) => (
                <h3 id={slug(flatten(c))} className="font-display text-base font-semibold text-foreground mt-5 mb-2 scroll-mt-24">
                  {c}
                </h3>
              ),
              p: (props) => <p className="mb-4" {...props} />,
              ul: (props) => <ul className="list-disc pl-5 mb-4 space-y-1.5" {...props} />,
              ol: (props) => <ol className="list-decimal pl-5 mb-4 space-y-1.5" {...props} />,
              strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
              a: (props) => <a className="text-primary hover:underline" target="_blank" rel="noreferrer" {...props} />,
              blockquote: ({ children: c }) => <Callout>{c}</Callout>,
              code: ({ children: c, ...props }) => (
                <code className="px-1.5 py-0.5 rounded bg-white/10 text-[0.85em] font-mono text-foreground" {...props}>
                  {c}
                </code>
              ),
              pre: ({ children: c }) => <CodeBlock>{c}</CodeBlock>,
              table: (props) => (
                <div className="my-4 overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-sm border-collapse" {...props} />
                </div>
              ),
              thead: (props) => <thead className="bg-white/10" {...props} />,
              tr: (props) => <tr className="border-b border-white/10 last:border-0" {...props} />,
              th: (props) => <th className="px-3 py-2 text-left font-semibold text-foreground border-r border-white/10 last:border-0" {...props} />,
              td: (props) => <td className="px-3 py-2 text-foreground/90 border-r border-white/10 last:border-0 align-top" {...props} />,
              hr: () => <hr className="my-6 border-border/40" />,
            }}
          >
            {children}
          </ReactMarkdown>
        </article>

        {toc && headings.length > 1 && (
          <nav aria-label="Sumário do material" className="hidden lg:block">
            <div className="sticky top-20 rounded-xl border border-border/40 bg-white/[0.02] p-4">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                <List className="h-3.5 w-3.5 text-primary" /> Sumário
              </p>
              <ul className="space-y-1.5 text-xs">
                {headings.map((h, i) => (
                  <li key={`${h.id}-${i}`} className={h.level === 3 ? "pl-3" : ""}>
                    <a href={`#${h.id}`} className="text-muted-foreground hover:text-primary transition-colors line-clamp-2">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
