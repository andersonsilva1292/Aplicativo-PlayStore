import type { DiagramKey } from "@/data/automation-course";

const box = "fill-current text-primary/10";
const stroke = "stroke-current text-primary/40";

function Frame({ title, children, label }: { title: string; children: React.ReactNode; label: string }) {
  return (
    <figure className="my-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <svg viewBox="0 0 640 220" role="img" aria-label={label} className="w-full h-auto">
        {children}
      </svg>
      <figcaption className="mt-2 text-xs text-muted-foreground text-center">{title}</figcaption>
    </figure>
  );
}

function Node({ x, y, w = 130, h = 46, text }: { x: number; y: number; w?: number; h?: number; text: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} className={`${box} ${stroke}`} strokeWidth={1.5} />
      {text.split("\n").map((line, i, arr) => (
        <text
          key={i}
          x={x + w / 2}
          y={y + h / 2 + (i - (arr.length - 1) / 2) * 13 + 4}
          textAnchor="middle"
          className="fill-current text-foreground"
          style={{ fontSize: 11 }}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-current text-accent" strokeWidth={1.6} markerEnd="url(#arrowHead)" />
  );
}

const Defs = () => (
  <defs>
    <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" className="fill-current text-accent" />
    </marker>
  </defs>
);

export default function AutomationDiagram({ diagram }: { diagram?: DiagramKey }) {
  if (!diagram) return null;

  if (diagram === "webdriver-flow") {
    return (
      <Frame title="Fluxo de execução do Selenium WebDriver" label="Diagrama do fluxo do WebDriver: teste Java, WebDriver API, driver do navegador, protocolo W3C e navegador">
        <Defs />
        <Node x={10} y={90} text={"Teste Java\n(Steps)"} />
        <Node x={165} y={90} text={"WebDriver API"} />
        <Node x={320} y={90} text={"chromedriver\n(processo)"} />
        <Node x={480} y={90} w={150} text={"Navegador\n(página web)"} />
        <Arrow x1={140} y1={105} x2={163} y2={105} />
        <Arrow x1={295} y1={105} x2={318} y2={105} />
        <Arrow x1={450} y1={105} x2={478} y2={105} />
        <Arrow x1={478} y1={125} x2={452} y2={125} />
        <Arrow x1={318} y1={125} x2={297} y2={125} />
        <Arrow x1={163} y1={125} x2={142} y2={125} />
        <text x={320} y={60} textAnchor="middle" className="fill-current text-muted-foreground" style={{ fontSize: 11 }}>
          comando (JSON / protocolo W3C) →
        </text>
        <text x={320} y={185} textAnchor="middle" className="fill-current text-muted-foreground" style={{ fontSize: 11 }}>
          ← resposta (elemento, texto, screenshot)
        </text>
      </Frame>
    );
  }

  if (diagram === "architecture") {
    return (
      <Frame title="Arquitetura em camadas do Central Automation" label="Diagrama de camadas: feature, steps, metodos, elementos, hooks e utils">
        <Defs />
        <Node x={20} y={20} w={180} text={"Central.feature\n(Gherkin)"} />
        <Node x={20} y={90} w={180} text={"Steps\n(implementação)"} />
        <Node x={20} y={160} w={180} text={"Metodos\n(ações utilitárias)"} />
        <Node x={250} y={90} w={160} text={"Elementos\n(seletores By)"} />
        <Node x={440} y={20} w={180} text={"Hooks\n(driver + relatório)"} />
        <Node x={440} y={130} w={180} text={"Utils / ReportManager\n(prints e logs)"} />
        <Arrow x1={110} y1={68} x2={110} y2={88} />
        <Arrow x1={110} y1={138} x2={110} y2={158} />
        <Arrow x1={203} y1={113} x2={248} y2={113} />
        <Arrow x1={412} y1={100} x2={438} y2={60} />
        <Arrow x1={412} y1={125} x2={438} y2={155} />
      </Frame>
    );
  }

  if (diagram === "cucumber-flow") {
    return (
      <Frame title="Execução do Cucumber: Runner → Hooks → Steps → Relatório" label="Diagrama do ciclo de execução do Cucumber">
        <Defs />
        <Node x={10} y={90} w={120} text={"Runner\n(JUnit)"} />
        <Node x={150} y={90} w={120} text={"@Before\n(abre driver)"} />
        <Node x={290} y={90} w={130} text={"Steps do\ncenário"} />
        <Node x={440} y={90} w={190} text={"@After\n(print + quit + flush)"} />
        <Arrow x1={132} y1={113} x2={148} y2={113} />
        <Arrow x1={272} y1={113} x2={288} y2={113} />
        <Arrow x1={422} y1={113} x2={438} y2={113} />
        <text x={320} y={60} textAnchor="middle" className="fill-current text-muted-foreground" style={{ fontSize: 11 }}>
          um ciclo completo por cenário
        </text>
      </Frame>
    );
  }

  if (diagram === "maven-project") {
    return (
      <Frame title="Estrutura do projeto Maven" label="Diagrama da estrutura de pastas do projeto Maven">
        <Defs />
        <Node x={20} y={20} w={200} text={"pom.xml\n(dependências)"} />
        <Node x={20} y={100} w={200} text={"src/test/java\n(código)"} />
        <Node x={20} y={165} w={200} text={"src/test/resources\n(features)"} />
        <Node x={300} y={20} w={320} h={60} text={"Selenium · Cucumber · JUnit\nWebDriverManager · ExtentReports"} />
        <Node x={300} y={100} w={320} text={"elementos · metodos · hooks · steps · runner"} />
        <Node x={300} y={165} w={320} text={"Central.feature"} />
        <Arrow x1={222} y1={45} x2={298} y2={45} />
        <Arrow x1={222} y1={123} x2={298} y2={123} />
        <Arrow x1={222} y1={188} x2={298} y2={188} />
      </Frame>
    );
  }

  if (diagram === "report-flow") {
    return (
      <Frame title="Geração de evidências e relatório" label="Diagrama do fluxo de screenshots e relatório ExtentReports">
        <Defs />
        <Node x={10} y={90} w={140} text={"Passo executado\n(metodos.print)"} />
        <Node x={175} y={90} w={150} text={"TakesScreenshot\n+ Commons-IO"} />
        <Node x={350} y={30} w={130} text={"target/\nscreenshots"} />
        <Node x={350} y={150} w={130} text={"ExtentTest\n.log()"} />
        <Node x={505} y={90} w={125} text={"target/\nExtentReport.html"} />
        <Arrow x1={152} y1={113} x2={173} y2={113} />
        <Arrow x1={327} y1={105} x2={348} y2={70} />
        <Arrow x1={327} y1={125} x2={348} y2={168} />
        <Arrow x1={482} y1={70} x2={503} y2={105} />
        <Arrow x1={482} y1={168} x2={503} y2={128} />
      </Frame>
    );
  }

  return (
    <Frame title="Execução da suíte no pipeline de CI" label="Diagrama do pipeline de integração contínua com testes automatizados">
      <Defs />
      <Node x={10} y={90} w={120} text={"Commit /\nPull Request"} />
      <Node x={150} y={90} w={120} text={"Build\nmvn clean"} />
      <Node x={290} y={90} w={140} text={"mvn test\n-Dheadless=true"} />
      <Node x={450} y={90} w={180} text={"Artefatos:\nrelatório + screenshots"} />
      <Arrow x1={132} y1={113} x2={148} y2={113} />
      <Arrow x1={272} y1={113} x2={288} y2={113} />
      <Arrow x1={432} y1={113} x2={448} y2={113} />
      <text x={320} y={185} textAnchor="middle" className="fill-current text-muted-foreground" style={{ fontSize: 11 }}>
        teste vermelho reprova o build
      </text>
    </Frame>
  );
}
