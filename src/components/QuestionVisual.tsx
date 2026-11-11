import { useMemo } from "react";

/**
 * Ilustrações (SVG) de apoio à interpretação das questões.
 * Aplicadas apenas em questões de nível K2 e K3: escolhe o diagrama
 * pelo tópico/enunciado da questão. Se nenhum diagrama corresponder,
 * nada é renderizado.
 *
 * Todos os SVGs usam tokens do design system (currentColor + classes
 * semânticas), portanto respeitam o tema escuro/glassmorphism.
 */

interface QuestionVisualProps {
  level: string;
  chapter?: number;
  topic?: string;
  question?: string;
  className?: string;
}

type VisualKey =
  | "boundary"
  | "equivalence"
  | "state"
  | "decision"
  | "controlflow"
  | "vmodel"
  | "levels"
  | "pyramid"
  | "shiftleft"
  | "defectcost"
  | "review"
  | "process"
  | "riskmatrix"
  | "defectflow"
  | "quadrants"
  | "devops"
  | "errorchain"
  | "regression"
  | "automation";

/** Palavras-chave (pt-BR) por diagrama, em ordem de prioridade. */
const MATCHERS: { key: VisualKey; patterns: RegExp }[] = [
  { key: "boundary", patterns: /valor[- ]limite|valores[- ]limites|bva|análise de valor/i },
  { key: "equivalence", patterns: /partiç(ão|ões) de equival|classe de equival/i },
  { key: "state", patterns: /transiç(ão|ões) de estado|máquina de estado/i },
  { key: "decision", patterns: /tabela de decis/i },
  { key: "controlflow", patterns: /cobertura de (instru|decis|ramo)|caixa[- ]branca|instruç(ão|ões)|branch|fluxo de controle/i },
  { key: "vmodel", patterns: /modelo v|modelo em v|sequencial|waterfall|cascata/i },
  { key: "levels", patterns: /n[íi]ve(l|is) de teste|teste de componente|teste de integraç|teste de sistema|teste de aceite/i },
  { key: "pyramid", patterns: /pir[âa]mide de teste/i },
  { key: "shiftleft", patterns: /shift[- ]left|antecipa/i },
  { key: "defectcost", patterns: /custo (da|de) (correç|defeito)|quanto mais cedo/i },
  { key: "review", patterns: /revis(ão|ões)|inspeç|walkthrough|teste estático/i },
  { key: "riskmatrix", patterns: /risco|baseado em risco|probabilidade e impacto/i },
  { key: "defectflow", patterns: /relat[óo]rio de defeito|gerenciamento de defeito|ciclo de vida do defeito/i },
  { key: "quadrants", patterns: /quadrantes? de teste/i },
  { key: "devops", patterns: /devops|ci\/cd|integraç(ão|ões) cont[íi]nua|pipeline/i },
  { key: "errorchain", patterns: /erro.*defeito.*falha|causa[- ]raiz/i },
  { key: "regression", patterns: /regress(ão|ivo)|teste de confirmaç|manutenç/i },
  { key: "automation", patterns: /ferramenta|automaç/i },
  { key: "process", patterns: /atividades de teste|processo de teste|planejamento|monitoramento|rastreabilidade|testware/i },
];

function pickVisual(topic = "", question = ""): VisualKey | null {
  const haystack = `${topic}\n${question}`;
  for (const m of MATCHERS) {
    if (m.patterns.test(haystack)) return m.key;
  }
  return null;
}

/* ---------------------------------- helpers --------------------------------- */

const box = "fill-transparent stroke-current";

function Frame({
  title,
  caption,
  children,
  viewBox = "0 0 480 150",
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
  viewBox?: string;
}) {
  return (
    <figure className="my-4 rounded-xl border border-border/40 bg-white/5 p-3">
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={`${title}. ${caption}`}
        className="w-full h-auto text-foreground/80"
      >
        <title>{title}</title>
        {children}
      </svg>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">Figura:</span> {caption}
      </figcaption>
    </figure>
  );
}

function Label({ x, y, children, anchor = "middle", cls = "" }: { x: number; y: number; children: React.ReactNode; anchor?: "start" | "middle" | "end"; cls?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={`text-[11px] fill-current ${cls}`} style={{ fontSize: 11 }}>
      {children}
    </text>
  );
}

function Arrow({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <path d="M0,0 L7,3 L0,6 Z" className="fill-current" />
      </marker>
    </defs>
  );
}

/* --------------------------------- diagrams --------------------------------- */

function Boundary() {
  const marks = [
    { x: 70, label: "min-1", cls: "text-destructive" },
    { x: 130, label: "min", cls: "text-success" },
    { x: 190, label: "min+1", cls: "text-success" },
    { x: 290, label: "max-1", cls: "text-success" },
    { x: 350, label: "max", cls: "text-success" },
    { x: 410, label: "max+1", cls: "text-destructive" },
  ];
  return (
    <Frame
      title="Análise de valor-limite"
      caption="Os limites de cada partição (e seus vizinhos) são os valores testados pela análise de valor-limite."
    >
      <line x1="30" y1="80" x2="460" y2="80" className="stroke-current" strokeWidth="1.5" />
      <rect x="130" y="60" width="220" height="40" rx="6" className="fill-success/10 stroke-success/40" />
      <Label x={240} y={122} cls="text-muted-foreground">partição válida</Label>
      <Label x={70} y={122} cls="text-muted-foreground">inválida</Label>
      <Label x={410} y={122} cls="text-muted-foreground">inválida</Label>
      {marks.map((m) => (
        <g key={m.label} className={m.cls}>
          <circle cx={m.x} cy={80} r="4" className="fill-current" />
          <Label x={m.x} y={48}>{m.label}</Label>
        </g>
      ))}
    </Frame>
  );
}

function Equivalence() {
  const parts = [
    { x: 20, w: 130, t: "Inválida (< mín.)", cls: "fill-destructive/10 stroke-destructive/40" },
    { x: 165, w: 150, t: "Válida", cls: "fill-success/10 stroke-success/40" },
    { x: 330, w: 130, t: "Inválida (> máx.)", cls: "fill-destructive/10 stroke-destructive/40" },
  ];
  return (
    <Frame
      title="Partição de equivalência"
      caption="O domínio de entrada é dividido em partições; basta um valor representativo por partição."
    >
      {parts.map((p, i) => (
        <g key={p.t}>
          <rect x={p.x} y="45" width={p.w} height="55" rx="8" className={p.cls} />
          <Label x={p.x + p.w / 2} y={78}>{p.t}</Label>
          <circle cx={p.x + p.w / 2} cy={92} r="3.5" className="fill-current" />
          <Label x={p.x + p.w / 2} y={122} cls="text-muted-foreground">1 caso de teste</Label>
        </g>
      ))}
      <Label x={240} y={28} cls="text-muted-foreground">Domínio de entrada</Label>
    </Frame>
  );
}

function StateDiagram() {
  return (
    <Frame
      title="Diagrama de transição de estados"
      caption="Estados (círculos), eventos e transições (setas). Cobertura de transições válidas = 0-switch."
    >
      <Arrow id="ar-state" />
      {[
        { cx: 70, cy: 80, t: "S1" },
        { cx: 200, cy: 80, t: "S2" },
        { cx: 330, cy: 80, t: "S3" },
        { cx: 440, cy: 80, t: "S4" },
      ].map((s) => (
        <g key={s.t}>
          <circle cx={s.cx} cy={s.cy} r="24" className={box} strokeWidth="1.5" />
          <Label x={s.cx} y={s.cy + 4}>{s.t}</Label>
        </g>
      ))}
      <line x1="94" y1="80" x2="172" y2="80" className="stroke-current" strokeWidth="1.5" markerEnd="url(#ar-state)" />
      <line x1="224" y1="80" x2="302" y2="80" className="stroke-current" strokeWidth="1.5" markerEnd="url(#ar-state)" />
      <line x1="354" y1="80" x2="412" y2="80" className="stroke-current" strokeWidth="1.5" markerEnd="url(#ar-state)" />
      <path d="M200,56 C210,20 320,20 330,56" className="fill-none stroke-current" strokeWidth="1.5" markerEnd="url(#ar-state)" />
      <Label x={133} y={70} cls="text-muted-foreground">evento A</Label>
      <Label x={263} y={70} cls="text-muted-foreground">evento B</Label>
      <Label x={383} y={70} cls="text-muted-foreground">evento C</Label>
      <Label x={265} y={22} cls="text-muted-foreground">evento B (atalho)</Label>
    </Frame>
  );
}

function DecisionTable() {
  const cols = ["T1", "T2", "T3", "T4"];
  const rows = [
    { t: "Condição 1", v: ["V", "V", "F", "F"] },
    { t: "Condição 2", v: ["V", "F", "V", "F"] },
    { t: "Ação", v: ["X", "–", "–", "X"] },
  ];
  return (
    <Frame
      title="Estrutura de uma tabela de decisão"
      caption="Cada coluna é uma regra (combinação de condições) que gera um caso de teste."
      viewBox="0 0 480 160"
    >
      {cols.map((c, i) => (
        <Label key={c} x={190 + i * 70} y={30}>{c}</Label>
      ))}
      {rows.map((r, ri) => (
        <g key={r.t}>
          <Label x={20} y={62 + ri * 36} anchor="start">{r.t}</Label>
          {r.v.map((v, ci) => (
            <g key={ci}>
              <rect x={160 + ci * 70} y={44 + ri * 36} width="60" height="26" rx="5" className={ri === 2 ? "fill-accent/10 stroke-accent/40" : "fill-transparent stroke-current opacity-60"} />
              <Label x={190 + ci * 70} y={62 + ri * 36}>{v}</Label>
            </g>
          ))}
        </g>
      ))}
    </Frame>
  );
}

function ControlFlow() {
  return (
    <Frame
      title="Grafo de fluxo de controle"
      caption="Instruções (retângulos) e decisões (losango). Cobertura de instrução percorre nós; cobertura de decisão percorre os dois ramos."
      viewBox="0 0 480 200"
    >
      <Arrow id="ar-cf" />
      <rect x="200" y="10" width="80" height="26" rx="6" className={box} strokeWidth="1.5" />
      <Label x={240} y={28}>início</Label>
      <path d="M240,80 L285,105 L240,130 L195,105 Z" className={box} strokeWidth="1.5" />
      <Label x={240} y={109}>if</Label>
      <rect x="60" y="150" width="90" height="26" rx="6" className={box} strokeWidth="1.5" />
      <Label x={105} y={168}>ramo V</Label>
      <rect x="330" y="150" width="90" height="26" rx="6" className={box} strokeWidth="1.5" />
      <Label x={375} y={168}>ramo F</Label>
      <line x1="240" y1="36" x2="240" y2="74" className="stroke-current" strokeWidth="1.5" markerEnd="url(#ar-cf)" />
      <path d="M195,105 L105,105 L105,144" className="fill-none stroke-current" strokeWidth="1.5" markerEnd="url(#ar-cf)" />
      <path d="M285,105 L375,105 L375,144" className="fill-none stroke-current" strokeWidth="1.5" markerEnd="url(#ar-cf)" />
      <Label x={150} y={98} cls="text-muted-foreground">verdadeiro</Label>
      <Label x={332} y={98} cls="text-muted-foreground">falso</Label>
    </Frame>
  );
}

function VModel() {
  const left = ["Requisitos", "Projeto", "Código"];
  const right = ["Teste de aceite", "Teste de sistema", "Teste de componente"];
  return (
    <Frame
      title="Modelo V"
      caption="Cada atividade de desenvolvimento (esquerda) tem uma atividade de teste correspondente (direita)."
      viewBox="0 0 480 190"
    >
      <Arrow id="ar-v" />
      {left.map((t, i) => (
        <g key={t}>
          <rect x={30} y={20 + i * 45} width="140" height="30" rx="6" className={box} strokeWidth="1.5" />
          <Label x={100} y={40 + i * 45}>{t}</Label>
          <line x1={170} y1={35 + i * 45} x2={302} y2={35 + i * 45} className="stroke-current opacity-50" strokeDasharray="4 4" markerEnd="url(#ar-v)" />
        </g>
      ))}
      {right.map((t, i) => (
        <g key={t}>
          <rect x={310} y={20 + i * 45} width="140" height="30" rx="6" className="fill-accent/10 stroke-accent/40" />
          <Label x={380} y={40 + i * 45}>{t}</Label>
        </g>
      ))}
      <Label x={240} y={175} cls="text-muted-foreground">verificação e validação em paralelo</Label>
    </Frame>
  );
}

function TestLevels() {
  const levels = [
    { t: "Aceite", w: 120 },
    { t: "Sistema", w: 200 },
    { t: "Integração", w: 290 },
    { t: "Componente", w: 380 },
  ];
  return (
    <Frame
      title="Níveis de teste"
      caption="Do componente ao aceite: cada nível tem objetivos, base de teste e responsáveis distintos."
      viewBox="0 0 480 175"
    >
      {levels.map((l, i) => (
        <g key={l.t}>
          <rect x={(480 - l.w) / 2} y={15 + i * 38} width={l.w} height="30" rx="6" className="fill-primary/10 stroke-primary/40" />
          <Label x={240} y={35 + i * 38}>{l.t}</Label>
        </g>
      ))}
      <Label x={240} y={168} cls="text-muted-foreground">base de teste e escopo crescem de baixo para cima</Label>
    </Frame>
  );
}

function Pyramid() {
  const rows = [
    { t: "E2E / UI", w: 120, cls: "fill-destructive/10 stroke-destructive/40" },
    { t: "Integração / serviço", w: 250, cls: "fill-warning/10 stroke-warning/40" },
    { t: "Unidade / componente", w: 380, cls: "fill-success/10 stroke-success/40" },
  ];
  return (
    <Frame
      title="Pirâmide de teste"
      caption="Muitos testes rápidos de baixo nível na base; poucos testes lentos de ponta a ponta no topo."
      viewBox="0 0 480 160"
    >
      {rows.map((r, i) => (
        <g key={r.t}>
          <rect x={(480 - r.w) / 2} y={20 + i * 40} width={r.w} height="32" rx="6" className={r.cls} />
          <Label x={240} y={41 + i * 40}>{r.t}</Label>
        </g>
      ))}
      <Label x={240} y={152} cls="text-muted-foreground">↑ mais lento e caro  ·  ↓ mais rápido e barato</Label>
    </Frame>
  );
}

function ShiftLeft() {
  return (
    <Frame
      title="Abordagem shift-left"
      caption="O esforço de teste é antecipado para as fases iniciais do ciclo, encontrando defeitos mais cedo."
    >
      <Arrow id="ar-sl" />
      <line x1="30" y1="105" x2="455" y2="105" className="stroke-current" strokeWidth="1.5" markerEnd="url(#ar-sl)" />
      {["Requisitos", "Projeto", "Código", "Teste", "Produção"].map((t, i) => (
        <g key={t}>
          <circle cx={60 + i * 90} cy={105} r="4" className="fill-current" />
          <Label x={60 + i * 90} y={126} cls="text-muted-foreground">{t}</Label>
        </g>
      ))}
      <rect x="35" y="45" width="185" height="34" rx="8" className="fill-success/10 stroke-success/40" />
      <Label x={127} y={66}>testar aqui (shift-left)</Label>
      <path d="M330,66 L235,66" className="fill-none stroke-current" strokeWidth="1.5" markerEnd="url(#ar-sl)" />
      <Label x={392} y={70} cls="text-muted-foreground">em vez daqui</Label>
    </Frame>
  );
}

function DefectCost() {
  const bars = [
    { t: "Requisitos", h: 18 },
    { t: "Projeto", h: 34 },
    { t: "Código", h: 55 },
    { t: "Teste", h: 78 },
    { t: "Produção", h: 100 },
  ];
  return (
    <Frame
      title="Custo de correção do defeito"
      caption="Quanto mais tarde o defeito é encontrado, maior o custo de corrigi-lo."
      viewBox="0 0 480 165"
    >
      <line x1="40" y1="120" x2="460" y2="120" className="stroke-current opacity-60" />
      {bars.map((b, i) => (
        <g key={b.t}>
          <rect x={60 + i * 80} y={120 - b.h} width="46" height={b.h} rx="4" className="fill-warning/20 stroke-warning/50" />
          <Label x={83 + i * 80} y={138} cls="text-muted-foreground">{b.t}</Label>
        </g>
      ))}
      <Label x={30} y={30} anchor="start" cls="text-muted-foreground">custo</Label>
    </Frame>
  );
}

function ReviewProcess() {
  const steps = ["Planejar", "Iniciar", "Revisão individual", "Comunicar", "Corrigir/Relatar"];
  return (
    <Frame
      title="Processo de revisão (teste estático)"
      caption="Atividades do processo formal de revisão, do planejamento à correção dos achados."
      viewBox="0 0 480 120"
    >
      <Arrow id="ar-rv" />
      {steps.map((s, i) => (
        <g key={s}>
          <rect x={12 + i * 94} y="45" width="84" height="34" rx="8" className="fill-accent/10 stroke-accent/40" />
          <text x={54 + i * 94} y={66} textAnchor="middle" className="fill-current" style={{ fontSize: 9.5 }}>{s}</text>
          {i < steps.length - 1 && (
            <line x1={96 + i * 94} y1="62" x2={104 + i * 94} y2="62" className="stroke-current" strokeWidth="1.5" markerEnd="url(#ar-rv)" />
          )}
        </g>
      ))}
    </Frame>
  );
}

function TestProcess() {
  const steps = ["Planejamento", "Monitoramento e controle", "Análise", "Modelagem", "Implementação", "Execução", "Conclusão"];
  return (
    <Frame
      title="Atividades do processo de teste"
      caption="As atividades de teste e o testware produzido em cada uma delas."
      viewBox="0 0 480 140"
    >
      <Arrow id="ar-tp" />
      {steps.map((s, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <g key={s}>
            <rect x={12 + col * 118} y={20 + row * 60} width="108" height="36" rx="8" className="fill-primary/10 stroke-primary/40" />
            <text x={66 + col * 118} y={42 + row * 60} textAnchor="middle" className="fill-current" style={{ fontSize: 9 }}>{s}</text>
          </g>
        );
      })}
      <Label x={240} y={132} cls="text-muted-foreground">atividades podem se sobrepor e iterar</Label>
    </Frame>
  );
}

function RiskMatrix() {
  const cells = [
    { r: 0, c: 0, cls: "fill-warning/15 stroke-warning/40", t: "médio" },
    { r: 0, c: 1, cls: "fill-destructive/20 stroke-destructive/50", t: "alto" },
    { r: 1, c: 0, cls: "fill-success/15 stroke-success/40", t: "baixo" },
    { r: 1, c: 1, cls: "fill-warning/15 stroke-warning/40", t: "médio" },
  ];
  return (
    <Frame
      title="Matriz de risco"
      caption="Nível de risco = probabilidade × impacto. O teste baseado em risco prioriza os itens de risco alto."
      viewBox="0 0 480 175"
    >
      {cells.map((c) => (
        <g key={`${c.r}${c.c}`}>
          <rect x={150 + c.c * 140} y={25 + c.r * 62} width="130" height="55" rx="8" className={c.cls} />
          <Label x={215 + c.c * 140} y={57 + c.r * 62}>{c.t}</Label>
        </g>
      ))}
      <Label x={215} y={152} cls="text-muted-foreground">impacto baixo</Label>
      <Label x={355} y={152} cls="text-muted-foreground">impacto alto</Label>
      <Label x={140} y={57} anchor="end" cls="text-muted-foreground">prob. alta</Label>
      <Label x={140} y={119} anchor="end" cls="text-muted-foreground">prob. baixa</Label>
    </Frame>
  );
}

function DefectFlow() {
  const steps = ["Novo", "Atribuído", "Corrigido", "Reteste", "Fechado"];
  return (
    <Frame
      title="Ciclo de vida do relatório de defeito"
      caption="Estados típicos de um defeito, do registro ao fechamento após o teste de confirmação."
      viewBox="0 0 480 120"
    >
      <Arrow id="ar-df" />
      {steps.map((s, i) => (
        <g key={s}>
          <rect x={14 + i * 94} y="42" width="80" height="32" rx="16" className="fill-accent/10 stroke-accent/40" />
          <text x={54 + i * 94} y={62} textAnchor="middle" className="fill-current" style={{ fontSize: 10 }}>{s}</text>
          {i < steps.length - 1 && (
            <line x1={94 + i * 94} y1="58" x2={104 + i * 94} y2="58" className="stroke-current" strokeWidth="1.5" markerEnd="url(#ar-df)" />
          )}
        </g>
      ))}
      <path d="M330,80 C300,105 130,105 100,80" className="fill-none stroke-current opacity-60" strokeDasharray="4 4" markerEnd="url(#ar-df)" />
      <Label x={215} y={112} cls="text-muted-foreground">reaberto (falha no reteste)</Label>
    </Frame>
  );
}

function Quadrants() {
  const q = [
    { t: "Q1 · unidade, componente (apoia a equipe, tecnologia)", cls: "fill-success/10 stroke-success/40" },
    { t: "Q2 · funcional, história (apoia a equipe, negócio)", cls: "fill-primary/10 stroke-primary/40" },
    { t: "Q3 · exploratório, usabilidade (critica o produto, negócio)", cls: "fill-accent/10 stroke-accent/40" },
    { t: "Q4 · desempenho, segurança (critica o produto, tecnologia)", cls: "fill-warning/10 stroke-warning/40" },
  ];
  return (
    <Frame
      title="Quadrantes de teste"
      caption="Classificação dos testes por objetivo (apoiar a equipe × criticar o produto) e visão (negócio × tecnologia)."
      viewBox="0 0 480 170"
    >
      {q.map((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <g key={item.t}>
            <rect x={20 + col * 225} y={15 + row * 78} width="215" height="68" rx="8" className={item.cls} />
            <foreignObject x={28 + col * 225} y={25 + row * 78} width="199" height="52">
              <div style={{ fontSize: 10, lineHeight: 1.3 }} className="text-foreground/85">{item.t}</div>
            </foreignObject>
          </g>
        );
      })}
    </Frame>
  );
}

function DevOps() {
  const steps = ["Commit", "Build", "Testes automatizados", "Deploy", "Monitorar"];
  return (
    <Frame
      title="Pipeline de CI/CD (DevOps)"
      caption="Testes automatizados no pipeline dão feedback rápido a cada alteração de código."
      viewBox="0 0 480 120"
    >
      <Arrow id="ar-do" />
      {steps.map((s, i) => (
        <g key={s}>
          <rect x={12 + i * 94} y="44" width="84" height="34" rx="8" className="fill-primary/10 stroke-primary/40" />
          <text x={54 + i * 94} y={65} textAnchor="middle" className="fill-current" style={{ fontSize: 9.5 }}>{s}</text>
          {i < steps.length - 1 && (
            <line x1={96 + i * 94} y1="61" x2={104 + i * 94} y2="61" className="stroke-current" strokeWidth="1.5" markerEnd="url(#ar-do)" />
          )}
        </g>
      ))}
    </Frame>
  );
}

function ErrorChain() {
  const steps = [
    { t: "Erro (humano)", cls: "fill-muted stroke-current" },
    { t: "Defeito (no código)", cls: "fill-warning/15 stroke-warning/40" },
    { t: "Falha (na execução)", cls: "fill-destructive/15 stroke-destructive/40" },
  ];
  return (
    <Frame
      title="Erro → defeito → falha"
      caption="Um erro humano pode inserir um defeito; o defeito pode causar uma falha quando executado."
      viewBox="0 0 480 120"
    >
      <Arrow id="ar-ec" />
      {steps.map((s, i) => (
        <g key={s.t}>
          <rect x={20 + i * 160} y="45" width="130" height="34" rx="8" className={s.cls} />
          <text x={85 + i * 160} y={66} textAnchor="middle" className="fill-current" style={{ fontSize: 10 }}>{s.t}</text>
          {i < steps.length - 1 && (
            <line x1={152 + i * 160} y1="62" x2={176 + i * 160} y2="62" className="stroke-current" strokeWidth="1.5" markerEnd="url(#ar-ec)" />
          )}
        </g>
      ))}
      <Label x={240} y={104} cls="text-muted-foreground">a causa-raiz é a origem do erro</Label>
    </Frame>
  );
}

function Regression() {
  return (
    <Frame
      title="Teste de confirmação e de regressão"
      caption="Após a correção: o teste de confirmação verifica o defeito corrigido; o de regressão verifica efeitos colaterais."
      viewBox="0 0 480 130"
    >
      <Arrow id="ar-rg" />
      <rect x="20" y="50" width="110" height="34" rx="8" className="fill-warning/15 stroke-warning/40" />
      <text x="75" y="71" textAnchor="middle" className="fill-current" style={{ fontSize: 10 }}>Correção</text>
      <rect x="200" y="18" width="150" height="34" rx="8" className="fill-success/10 stroke-success/40" />
      <text x="275" y="39" textAnchor="middle" className="fill-current" style={{ fontSize: 10 }}>Teste de confirmação</text>
      <rect x="200" y="80" width="150" height="34" rx="8" className="fill-accent/10 stroke-accent/40" />
      <text x="275" y="101" textAnchor="middle" className="fill-current" style={{ fontSize: 10 }}>Teste de regressão</text>
      <path d="M130,67 L165,67 L165,35 L192,35" className="fill-none stroke-current" strokeWidth="1.5" markerEnd="url(#ar-rg)" />
      <path d="M130,67 L165,67 L165,97 L192,97" className="fill-none stroke-current" strokeWidth="1.5" markerEnd="url(#ar-rg)" />
      <Label x={420} y={39} cls="text-muted-foreground">o defeito sumiu?</Label>
      <Label x={420} y={101} cls="text-muted-foreground">algo mais quebrou?</Label>
    </Frame>
  );
}

function Automation() {
  return (
    <Frame
      title="Ferramentas de teste: benefícios e riscos"
      caption="Ferramentas apoiam as atividades de teste, mas trazem riscos (expectativas irreais, manutenção do testware)."
      viewBox="0 0 480 140"
    >
      <rect x="20" y="20" width="200" height="100" rx="10" className="fill-success/10 stroke-success/40" />
      <text x="120" y="42" textAnchor="middle" className="fill-current" style={{ fontSize: 11 }}>Benefícios</text>
      {["Trabalho repetitivo reduzido", "Consistência e repetibilidade", "Medição objetiva"].map((t, i) => (
        <text key={t} x="36" y={64 + i * 18} className="fill-current" style={{ fontSize: 9.5 }}>• {t}</text>
      ))}
      <rect x="260" y="20" width="200" height="100" rx="10" className="fill-destructive/10 stroke-destructive/40" />
      <text x="360" y="42" textAnchor="middle" className="fill-current" style={{ fontSize: 11 }}>Riscos</text>
      {["Expectativas irreais", "Esforço de manutenção", "Dependência do fornecedor"].map((t, i) => (
        <text key={t} x="276" y={64 + i * 18} className="fill-current" style={{ fontSize: 9.5 }}>• {t}</text>
      ))}
    </Frame>
  );
}

const VISUALS: Record<VisualKey, () => JSX.Element> = {
  boundary: Boundary,
  equivalence: Equivalence,
  state: StateDiagram,
  decision: DecisionTable,
  controlflow: ControlFlow,
  vmodel: VModel,
  levels: TestLevels,
  pyramid: Pyramid,
  shiftleft: ShiftLeft,
  defectcost: DefectCost,
  review: ReviewProcess,
  process: TestProcess,
  riskmatrix: RiskMatrix,
  defectflow: DefectFlow,
  quadrants: Quadrants,
  devops: DevOps,
  errorchain: ErrorChain,
  regression: Regression,
  automation: Automation,
};

export default function QuestionVisual({ level, topic, question, className = "" }: QuestionVisualProps) {
  const key = useMemo(
    () => (level === "K2" || level === "K3" ? pickVisual(topic, question) : null),
    [level, topic, question],
  );

  if (!key) return null;
  const Visual = VISUALS[key];
  return (
    <div className={className}>
      <Visual />
    </div>
  );
}
