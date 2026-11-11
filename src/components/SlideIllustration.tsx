import { motion, useReducedMotion } from "framer-motion";

/**
 * Ilustração de apoio para os slides da vídeo-aula.
 * A cena é escolhida por palavras-chave do título/tópicos do slide,
 * então toda aula ganha uma imagem de exemplo coerente com o conteúdo.
 */

type Scene = "browser" | "maven" | "gherkin" | "report" | "pipeline" | "code" | "pageobject" | "generic";

const RULES: [Scene, RegExp][] = [
  ["maven", /maven|pom|depend|jdk|eclipse|instala|ambiente|setup/i],
  ["gherkin", /gherkin|cucumber|bdd|feature|dado|cenário|cenario/i],
  ["report", /report|relat|extent|evidên|evidenc|print|screenshot/i],
  ["pipeline", /pipeline|ci\b|jenkins|git|execu(ção|cao) em massa|runner|junit|suite/i],
  ["pageobject", /page object|elementos|localizador|xpath|css selector|classe/i],
  ["browser", /selenium|webdriver|navegador|browser|clique|formul/i],
  ["code", /código|codigo|método|metodo|java|assert|refator/i],
];

function pickScene(text: string): Scene {
  for (const [scene, re] of RULES) if (re.test(text)) return scene;
  return "generic";
}

const CAPTIONS: Record<Scene, string> = {
  browser: "Selenium conduzindo o navegador",
  maven: "Projeto Maven e dependências",
  gherkin: "Cenário em Gherkin",
  report: "Relatório com evidências",
  pipeline: "Execução da suíte de testes",
  code: "Código do teste automatizado",
  pageobject: "Página mapeada em objetos",
  generic: "Visão geral do fluxo",
};

const stroke = "stroke-current text-primary/50";
const fillSoft = "fill-current text-primary/10";

function BrowserScene() {
  return (
    <>
      <rect x="20" y="24" width="280" height="170" rx="12" className={`${fillSoft} ${stroke}`} strokeWidth="1.5" />
      <rect x="20" y="24" width="280" height="26" rx="12" className="fill-current text-primary/20" />
      {[38, 52, 66].map((cx) => (
        <circle key={cx} cx={cx} cy="37" r="4" className="fill-current text-accent/70" />
      ))}
      <rect x="40" y="66" width="150" height="14" rx="4" className="fill-current text-foreground/25" />
      <rect x="40" y="90" width="240" height="10" rx="4" className="fill-current text-foreground/15" />
      <rect x="40" y="108" width="200" height="10" rx="4" className="fill-current text-foreground/15" />
      <rect x="40" y="140" width="96" height="30" rx="8" className="fill-current text-primary/40" />
      <text x="88" y="160" textAnchor="middle" className="fill-current text-foreground" style={{ fontSize: 12 }}>
        Entrar
      </text>
      <motion.g
        animate={{ x: [180, 100, 92], y: [40, 120, 148] }}
        transition={{ duration: 3.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <path d="M0 0 L0 16 L5 12 L9 20 L13 18 L9 10 L15 10 Z" className="fill-current text-accent" />
      </motion.g>
    </>
  );
}

function MavenScene() {
  const rows = ["selenium-java", "cucumber-java", "junit", "extentreports"];
  return (
    <>
      <rect x="20" y="20" width="280" height="180" rx="12" className={`${fillSoft} ${stroke}`} strokeWidth="1.5" />
      <text x="36" y="46" className="fill-current text-primary" style={{ fontSize: 13 }}>
        pom.xml
      </text>
      {rows.map((r, i) => (
        <motion.g
          key={r}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 + i * 0.25, duration: 0.5 }}
        >
          <rect x="36" y={60 + i * 30} width="248" height="22" rx="6" className="fill-current text-foreground/12" />
          <text x="46" y={75 + i * 30} className="fill-current text-foreground/80" style={{ fontSize: 11 }}>
            &lt;artifactId&gt;{r}&lt;/artifactId&gt;
          </text>
        </motion.g>
      ))}
    </>
  );
}

function GherkinScene() {
  const lines = ["Funcionalidade: Login", "Dado que acesso o portal", "Quando informo credenciais", "Então vejo o dashboard"];
  return (
    <>
      <rect x="20" y="26" width="280" height="168" rx="12" className={`${fillSoft} ${stroke}`} strokeWidth="1.5" />
      {lines.map((l, i) => (
        <motion.text
          key={l}
          x="40"
          y={58 + i * 34}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.35, duration: 0.4 }}
          className={i === 0 ? "fill-current text-primary" : "fill-current text-foreground/80"}
          style={{ fontSize: 12 }}
        >
          {l}
        </motion.text>
      ))}
    </>
  );
}

function ReportScene() {
  const bars = [70, 110, 48, 130, 92];
  return (
    <>
      <rect x="20" y="20" width="280" height="180" rx="12" className={`${fillSoft} ${stroke}`} strokeWidth="1.5" />
      <text x="36" y="44" className="fill-current text-primary" style={{ fontSize: 12 }}>
        Extent Report
      </text>
      {bars.map((h, i) => (
        <motion.rect
          key={i}
          x={44 + i * 48}
          width="28"
          rx="6"
          initial={{ height: 0, y: 180 }}
          animate={{ height: h, y: 180 - h }}
          transition={{ delay: 0.15 * i, duration: 0.6, ease: "easeOut" }}
          className={i === 2 ? "fill-current text-destructive/70" : "fill-current text-accent/70"}
        />
      ))}
      <line x1="36" y1="182" x2="288" y2="182" className={stroke} strokeWidth="1.5" />
    </>
  );
}

function PipelineScene() {
  const steps = ["Runner", "Cenários", "Evidência", "Relatório"];
  return (
    <>
      {steps.map((s, i) => (
        <g key={s}>
          <motion.rect
            x={20 + i * 72}
            y="86"
            width="60"
            height="48"
            rx="10"
            className={`${fillSoft} ${stroke}`}
            strokeWidth="1.5"
            initial={{ opacity: 0, y: 96 }}
            animate={{ opacity: 1, y: 86 }}
            transition={{ delay: i * 0.2, duration: 0.45 }}
          />
          <text x={50 + i * 72} y="114" textAnchor="middle" className="fill-current text-foreground/85" style={{ fontSize: 10 }}>
            {s}
          </text>
          {i < steps.length - 1 && (
            <motion.line
              x1={80 + i * 72}
              y1="110"
              x2={92 + i * 72}
              y2="110"
              className="stroke-current text-accent"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.15 + i * 0.2, duration: 0.35 }}
            />
          )}
        </g>
      ))}
      <motion.circle
        r="5"
        cy="110"
        className="fill-current text-primary"
        animate={{ cx: [24, 268] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function PageObjectScene() {
  return (
    <>
      <rect x="18" y="34" width="120" height="150" rx="12" className={`${fillSoft} ${stroke}`} strokeWidth="1.5" />
      <text x="78" y="56" textAnchor="middle" className="fill-current text-primary" style={{ fontSize: 11 }}>
        Página
      </text>
      {[74, 100, 126, 152].map((y) => (
        <rect key={y} x="32" y={y} width="92" height="16" rx="5" className="fill-current text-foreground/15" />
      ))}
      <rect x="182" y="34" width="120" height="150" rx="12" className={`${fillSoft} ${stroke}`} strokeWidth="1.5" />
      <text x="242" y="56" textAnchor="middle" className="fill-current text-accent" style={{ fontSize: 11 }}>
        Elementos.java
      </text>
      {[74, 100, 126, 152].map((y, i) => (
        <motion.line
          key={y}
          x1="124"
          y1={y + 8}
          x2="182"
          y2={y + 8}
          className="stroke-current text-accent/70"
          strokeWidth="1.6"
          strokeDasharray="4 4"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
    </>
  );
}

function CodeScene() {
  const widths = [180, 130, 210, 96, 160];
  return (
    <>
      <rect x="20" y="26" width="280" height="168" rx="12" className={`${fillSoft} ${stroke}`} strokeWidth="1.5" />
      {widths.map((w, i) => (
        <g key={i}>
          <text x="34" y={58 + i * 28} className="fill-current text-muted-foreground" style={{ fontSize: 10 }}>
            {i + 1}
          </text>
          <motion.rect
            x="50"
            y={48 + i * 28}
            height="12"
            rx="4"
            className={i % 2 === 0 ? "fill-current text-primary/45" : "fill-current text-foreground/20"}
            initial={{ width: 0 }}
            animate={{ width: w }}
            transition={{ delay: i * 0.18, duration: 0.5 }}
          />
        </g>
      ))}
    </>
  );
}

function GenericScene() {
  return (
    <>
      <motion.circle
        cx="160"
        cy="110"
        r="66"
        className={`${fillSoft} ${stroke}`}
        strokeWidth="1.5"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <motion.circle
            key={i}
            cx={160 + Math.cos(a) * 92}
            cy={110 + Math.sin(a) * 66}
            r="14"
            className="fill-current text-accent/60"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 }}
          />
        );
      })}
      <text x="160" y="115" textAnchor="middle" className="fill-current text-foreground/80" style={{ fontSize: 12 }}>
        Central Automation
      </text>
    </>
  );
}

const SCENES: Record<Scene, () => JSX.Element> = {
  browser: BrowserScene,
  maven: MavenScene,
  gherkin: GherkinScene,
  report: ReportScene,
  pipeline: PipelineScene,
  code: CodeScene,
  pageobject: PageObjectScene,
  generic: GenericScene,
};

export default function SlideIllustration({ hint, className = "" }: { hint: string; className?: string }) {
  const reduce = useReducedMotion();
  const scene = pickScene(hint);
  const Scene = SCENES[scene];

  return (
    <figure className={`rounded-2xl border border-white/10 bg-black/30 p-3 overflow-hidden ${className}`}>
      <svg viewBox="0 0 320 220" role="img" aria-label={CAPTIONS[scene]} className="w-full h-auto">
        {reduce ? <GenericScene /> : <Scene />}
      </svg>
      <figcaption className="mt-1.5 text-[11px] text-center text-muted-foreground">{CAPTIONS[scene]}</figcaption>
    </figure>
  );
}
