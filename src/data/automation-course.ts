export type DiagramKey =
  | "webdriver-flow"
  | "architecture"
  | "cucumber-flow"
  | "maven-project"
  | "report-flow"
  | "ci-flow";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // índice da alternativa correta
  explanation: string;
}

export interface Exercise {
  prompt: string;
  starter: string;
  /** Palavras-chave obrigatórias para a solução ser aceita no ambiente interativo */
  required: string[];
  hint: string;
  /** Casos de teste extras (validação automática) além dos derivados de `required` */
  tests?: import("@/lib/code-tests").CodeTestCase[];
}


export interface Lesson {
  id: string;
  title: string;
  duration: string;
  /** Prazo relativo (semana do curso) para entrega das atividades desta aula */
  deadlineWeek: number;
  video: {
    title: string;
    summary: string;
    checkpoints: string[];
  };
  diagram?: DiagramKey;
  content: string;
  quiz: QuizQuestion[];
  exercise?: Exercise;
}

export interface CourseModule {
  id: string;
  month: number;
  title: string;
  goal: string;
  lessons: Lesson[];
}

export const COURSE_META = {
  title: "Curso de Automação de Testes",
  subtitle: "Projeto Central Automation",
  instructor: "Anderson Santos",
  duration: "6 meses",
  adminEmail: "andersonsilva1292@hotmail.com",
  stack: ["Java 17", "Maven", "Selenium WebDriver", "Cucumber", "JUnit", "ExtentReports", "WebDriverManager"],
  /** Semanas totais do curso (24 semanas ≈ 6 meses) */
  weeks: 24,
};

export const modules: CourseModule[] = [
  {
    id: "m1",
    month: 1,
    title: "Fundamentos e Ambiente",
    goal: "Preparar a estação de trabalho do QA automatizador e entender o papel da automação na estratégia de testes.",
    lessons: [
      {
        id: "m1-a1",
        title: "Aula 01 · Central Automation v2.0: visão geral",
        duration: "45 min",
        deadlineWeek: 1,
        video: {
          title: "Central Automation v2.0",
          summary:
            "Panorama da pirâmide de automação, ROI, critérios de seleção de casos candidatos e riscos de automação frágil.",
          checkpoints: [
            "Diferenciar teste manual exploratório de teste automatizado de regressão",
            "Identificar 3 critérios para escolher um caso de teste para automação",
            "Reconhecer os custos de manutenção de um framework",
          ],
        },
        diagram: "architecture",
        content: `## O que você vai construir

Ao final dos 6 meses você terá o **Central Automation**: um framework de automação web em Java com Selenium, Cucumber e JUnit, relatórios gráficos em ExtentReports e captura automática de tela.

### Boas candidatas à automação
- Cenários **repetitivos** e de regressão
- Fluxos **críticos de negócio** (login, cadastro, checkout)
- Validações com **massa de dados** variável

### Más candidatas
- Telas em constante redesenho
- Testes exploratórios e de usabilidade
- Cenários executados uma única vez

> Regra do instrutor: automatize o que dói repetir, não o que é bonito de demonstrar.`,
        quiz: [
          {
            question: "Qual cenário é o melhor candidato à automação?",
            options: [
              "Avaliação de usabilidade de um novo layout",
              "Regressão do fluxo de login executada a cada release",
              "Teste exploratório de uma feature recém-criada",
              "Validação visual de cores da marca",
            ],
            answer: 1,
            explanation:
              "Automação entrega maior retorno em cenários estáveis, repetitivos e executados com frequência, como a regressão de login.",
          },
          {
            question: "O principal custo oculto de um framework de automação é:",
            options: ["Licença das ferramentas", "Manutenção dos scripts", "Consumo de banda", "Treinamento de usuários finais"],
            answer: 1,
            explanation: "Scripts acompanham a evolução da aplicação; manutenção é o maior custo de longo prazo.",
          },
        ],
      },
      {
        id: "m1-a2",
        title: "Aula 02 · Ambiente de desenvolvimento",
        duration: "40 min",
        deadlineWeek: 2,
        video: {
          title: "Ambiente de desenvolvimento",
          summary: "Instalação do JDK 17, variáveis de ambiente, IDE Eclipse e validação da instalação pelo terminal.",
          checkpoints: [
            "Validar a instalação com java -version",
            "Configurar JAVA_HOME",
            "Criar um workspace no Eclipse",
          ],
        },
        diagram: "maven-project",
        content: `## Passo a passo

1. Instale o **JDK 17** (Temurin ou Oracle).
2. Configure a variável \`JAVA_HOME\` apontando para a pasta do JDK.
3. Adicione \`%JAVA_HOME%\\bin\` (ou \`$JAVA_HOME/bin\`) ao PATH.
4. Instale o **Eclipse IDE for Enterprise Java Developers**.
5. Valide no terminal:

\`\`\`bash
java -version
javac -version
mvn -v
\`\`\`

| Item | Versão mínima | Verificação |
| --- | --- | --- |
| JDK | 17 | \`java -version\` |
| Maven | 3.8 | \`mvn -v\` |
| Eclipse | 2023-09 | Help > About |`,
        quiz: [
          {
            question: "Qual variável de ambiente o Maven usa para localizar o compilador Java?",
            options: ["PATH_JAVA", "JAVA_HOME", "MAVEN_JDK", "JDK_PATH"],
            answer: 1,
            explanation: "JAVA_HOME é a variável padrão consultada por Maven e outras ferramentas do ecossistema Java.",
          },
        ],
      },
      {
        id: "m1-a3",
        title: "Aula 03 · Configuração do projeto Maven",
        duration: "50 min",
        deadlineWeek: 3,
        video: {
          title: "Configuração do projeto",
          summary:
            "Criação do projeto Maven e inclusão das dependências Selenium, Cucumber, JUnit, WebDriverManager, ExtentReports e Commons-IO.",
          checkpoints: ["Entender groupId/artifactId/version", "Diferenciar dependência de plugin", "Executar mvn clean test"],
        },
        diagram: "maven-project",
        content: `## Estrutura do projeto

\`\`\`text
central-automation
 ├── pom.xml
 └── src/test/java
      ├── elementos/Elementos.java
      ├── metodos/Metodos.java
      ├── hooks/Hooks.java
      ├── steps/Steps.java
      ├── runner/Runner.java
      └── utils/ReportManager.java
 └── src/test/resources/features/Central.feature
\`\`\`

## Dependências essenciais

\`\`\`xml
<dependencies>
  <dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-java</artifactId>
    <version>4.21.0</version>
  </dependency>
  <dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-java</artifactId>
    <version>7.18.0</version>
  </dependency>
  <dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit</artifactId>
    <version>7.18.0</version>
  </dependency>
  <dependency>
    <groupId>io.github.bonigarcia</groupId>
    <artifactId>webdrivermanager</artifactId>
    <version>5.9.1</version>
  </dependency>
  <dependency>
    <groupId>com.aventstack</groupId>
    <artifactId>extentreports</artifactId>
    <version>5.1.1</version>
  </dependency>
  <dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.16.1</version>
  </dependency>
</dependencies>
\`\`\``,
        quiz: [
          {
            question: "Para que serve o WebDriverManager?",
            options: [
              "Gerenciar automaticamente o binário do driver do navegador",
              "Gerar relatórios HTML",
              "Executar cenários Gherkin",
              "Capturar screenshots",
            ],
            answer: 0,
            explanation: "O WebDriverManager baixa e configura o driver compatível com o navegador instalado.",
          },
        ],
        exercise: {
          prompt:
            "Escreva o bloco `<dependency>` do Selenium Java que será adicionado ao pom.xml do Central Automation.",
          starter: `<dependency>
  <groupId></groupId>
  <artifactId></artifactId>
  <version></version>
</dependency>`,
          required: ["org.seleniumhq.selenium", "selenium-java", "<version>"],
          hint: "groupId org.seleniumhq.selenium, artifactId selenium-java e uma versão 4.x.",
        },
      },
    ],
  },
  {
    id: "m2",
    month: 2,
    title: "Infraestrutura do framework",
    goal: "Construir a DriverFactory, isolar o driver com ThreadLocal e criar os métodos de ação.",
    lessons: [
      {
        id: "m2-a1",
        title: "Aula 04 · Infraestrutura e DriverFactory",
        duration: "50 min",
        deadlineWeek: 5,
        video: {
          title: "Infraestrutura: padrão Factory para o WebDriver",
          summary:
            "Como o comando Java percorre o WebDriver, o driver do navegador e o protocolo W3C até a página, e como a resposta volta.",
          checkpoints: ["Descrever o papel do driver executável", "Explicar o protocolo W3C WebDriver", "Encerrar sessões com quit()"],
        },
        diagram: "webdriver-flow",
        content: `## Ciclo de vida da sessão

\`\`\`java
WebDriverManager.chromedriver().setup();
WebDriver driver = new ChromeDriver();
driver.manage().window().maximize();
driver.get("https://estudosimuladorctfl.lovable.app/");
// ... interações
driver.quit();
\`\`\`

\`driver.close()\` fecha a aba atual; \`driver.quit()\` encerra a sessão e mata o processo do driver — sempre use \`quit()\` no fim da execução.`,
        quiz: [
          {
            question: "Diferença entre close() e quit():",
            options: [
              "São sinônimos",
              "close() fecha a janela atual; quit() encerra a sessão inteira",
              "quit() fecha a aba; close() encerra a sessão",
              "close() limpa cookies",
            ],
            answer: 1,
            explanation: "quit() finaliza o processo do driver e todas as janelas da sessão.",
          },
        ],
      },
      {
        id: "m2-a2",
        title: "Aula 05 · Infraestrutura resiliente (ThreadLocal)",
        duration: "55 min",
        deadlineWeek: 6,
        video: {
          title: "Infraestrutura resiliente",
          summary: "Estratégias de seletores resilientes e centralização dos By em uma única classe.",
          checkpoints: ["Escrever XPath por atributo", "Preferir id/data-testid", "Evitar XPath absoluto"],
        },
        diagram: "architecture",
        content: `## Elementos.java

\`\`\`java
public class Elementos {
    public static By campoEmail = By.id("email");
    public static By campoSenha = By.id("password");
    public static By botaoEntrar = By.xpath("//button[@type='submit']");
    public static By botaoEsqueciMinhaSenha = By.xpath("//a[@id='forget-pass']");
    public static By botaoVoltarLogin = By.xpath("//button[@id='back-to-login']");
    public static By linkPoliticaPrivacidade = By.xpath("//button[contains(.,'Política de Privacidade')]");
}
\`\`\`

**Ordem de preferência dos seletores:** id → data-testid → CSS estável → XPath relativo → (nunca) XPath absoluto.`,
        quiz: [
          {
            question: "Qual seletor é mais frágil?",
            options: ["By.id(\"email\")", "By.cssSelector(\"[data-testid='login']\")", "By.xpath(\"/html/body/div[2]/div/form/button\")", "By.xpath(\"//button[@id='entrar']\")"],
            answer: 2,
            explanation: "XPath absoluto quebra a qualquer mudança na hierarquia do DOM.",
          },
        ],
        exercise: {
          prompt:
            "Declare em Elementos.java os By do botão 'Esqueci minha senha' e do botão 'Voltar ao login' usando XPath por id.",
          starter: `public class Elementos {
    // declare os dois seletores aqui
}`,
          required: ["By.xpath", "forget-pass", "back-to-login"],
          hint: "Use public static By nome = By.xpath(\"//a[@id='forget-pass']\");",
        },
      },
      {
        id: "m2-a3",
        title: "Aula 06 · Elementos e métodos de ação (DSL)",
        duration: "50 min",
        deadlineWeek: 7,
        video: {
          title: "Métodos de ação: Metodos.java",
          summary: "Construção da camada de ações reutilizáveis que os steps consomem.",
          checkpoints: ["Encapsular clique com espera", "Rolar até o final da página", "Gerar dados dinâmicos"],
        },
        diagram: "architecture",
        content: `## Metodos.java

\`\`\`java
public class Metodos {
    public void clicar(By elemento) {
        new WebDriverWait(Hooks.getDriver(), Duration.ofSeconds(10))
            .until(ExpectedConditions.elementToBeClickable(elemento)).click();
    }

    public void pausa(int segundos) {
        try { Thread.sleep(segundos * 1000L); } catch (InterruptedException e) { }
    }

    public void rolarAteFinal() {
        ((JavascriptExecutor) Hooks.getDriver())
            .executeScript("window.scrollTo(0, document.body.scrollHeight)");
    }

    public void print(String nome) {
        ReportManager.capturarTela(Hooks.getDriver(), nome);
    }

    public String emailAleatorio() {
        return "qa" + System.currentTimeMillis() + "@teste.com";
    }
}
\`\`\``,
        quiz: [
          {
            question: "Por que preferir espera explícita a Thread.sleep?",
            options: [
              "Porque é mais curta no código",
              "Porque aguarda a condição real e reduz flakiness",
              "Porque não exige import",
              "Porque desliga o driver",
            ],
            answer: 1,
            explanation: "WebDriverWait aguarda a condição, evitando esperas fixas desnecessárias ou insuficientes.",
          },
        ],
      },
    ],
  },
  {
    id: "m3",
    month: 3,
    title: "Execução, relatórios e erros",
    goal: "Entender o ciclo de execução, gerar relatórios, rodar local e em pipeline e resolver erros comuns.",
    lessons: [
      {
        id: "m3-a1",
        title: "Aula 07 · Ciclo de execução e relatórios",
        duration: "45 min",
        deadlineWeek: 9,
        video: {
          title: "Ciclo e relatórios",
          summary: "Sintaxe Gherkin em português, boas práticas de escrita e organização das features.",
          checkpoints: ["Escrever um cenário completo", "Usar Contexto (Background)", "Evitar steps técnicos demais"],
        },
        diagram: "cucumber-flow",
        content: `## Central.feature

\`\`\`gherkin
# language: pt
Funcionalidade: Central - Login

  Cenário: Validar fluxo básico de navegação
    Dado que o usuário acessa a página inicial do simulador CTFL
    E clico no botão "Voltar ao login"
    E clico no botão "Entrar"
    Então clico no botão "Esqueci minha senha"
    E clico no botão "Cadastre-se"
    E clico no botão "Política de Privacidade"
    E rolo a página até o final
    E aciono o botão "Entendi"
\`\`\``,
        quiz: [
          {
            question: "Em Gherkin, o que representa o passo 'Dado'?",
            options: ["A ação principal", "O resultado esperado", "A pré-condição do cenário", "O relatório final"],
            answer: 2,
            explanation: "Dado (Given) estabelece o contexto/pré-condição do cenário.",
          },
        ],
      },
      {
        id: "m3-a2",
        title: "Aula 08 · Execução local e pipeline",
        duration: "50 min",
        deadlineWeek: 10,
        video: {
          title: "Execução local e pipeline",
          summary: "Inicialização e encerramento do driver, anexos de screenshot em falhas e integração com ExtentReports.",
          checkpoints: ["Instanciar o driver no @Before", "Encerrar no @After", "Capturar tela quando o cenário falha"],
        },
        diagram: "cucumber-flow",
        content: `## Hooks.java

\`\`\`java
public class Hooks {
    private static WebDriver driver;

    public static WebDriver getDriver() { return driver; }

    @Before
    public void iniciar(Scenario cenario) {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        ReportManager.iniciarTeste(cenario.getName());
    }

    @After
    public void finalizar(Scenario cenario) {
        if (cenario.isFailed()) {
            ReportManager.capturarTela(driver, "falha_" + cenario.getName());
        }
        ReportManager.finalizar();
        driver.quit();
    }
}
\`\`\``,
        quiz: [
          {
            question: "Qual hook do Cucumber roda antes de cada cenário?",
            options: ["@BeforeAll", "@Before", "@BeforeStep", "@Setup"],
            answer: 1,
            explanation: "@Before executa antes de cada cenário; @BeforeStep antes de cada passo.",
          },
        ],
      },
      {
        id: "m3-a3",
        title: "Aula 09 · Guia de erros",
        duration: "55 min",
        deadlineWeek: 11,
        video: {
          title: "Guia de erros e troubleshooting",
          summary: "Implementação dos steps com anotações em português e configuração da classe Runner.",
          checkpoints: ["Mapear step com @Dado/@Quando/@Então", "Configurar glue e features", "Executar pelo Runner"],
        },
        diagram: "cucumber-flow",
        content: `## Steps.java

\`\`\`java
public class Steps {
    Metodos metodos = new Metodos();

    @Dado("que o usuário acessa a página inicial do simulador CTFL")
    public void acessarPaginaInicial() {
        Hooks.getDriver().get("https://estudosimuladorctfl.lovable.app/dashboard");
        metodos.pausa(2);
        metodos.print("pagina_inicial");
    }

    @Então("clico no botão {string}")
    public void clicoNoBotao(String botao) {
        metodos.clicarPorTexto(botao);
        metodos.print("clique_" + botao);
    }
}
\`\`\`

## Runner.java

\`\`\`java
@RunWith(Cucumber.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = {"steps", "hooks"},
    plugin = {"pretty", "html:target/cucumber.html"},
    monochrome = true
)
public class Runner { }
\`\`\``,
        quiz: [
          {
            question: "O atributo `glue` do @CucumberOptions aponta para:",
            options: ["Os arquivos .feature", "Os pacotes com steps e hooks", "A pasta de relatórios", "O driver do navegador"],
            answer: 1,
            explanation: "glue indica onde o Cucumber procura as implementações dos passos.",
          },
        ],
        exercise: {
          prompt:
            "Implemente o step do cenário que acessa a página inicial do simulador CTFL, com pausa de 2 segundos e print da tela.",
          starter: `@Dado("que o usuário acessa a página inicial do simulador CTFL")
public void acessarPaginaInicial() {
    // seu código
}`,
          required: ["Hooks.getDriver()", ".get(", "metodos.pausa", "metodos.print"],
          hint: "Use Hooks.getDriver().get(url), metodos.pausa(2) e metodos.print(\"pagina_inicial\").",
        },
      },
    ],
  },
  {
    id: "m4",
    month: 4,
    title: "Arquitetura e Framework Completo",
    goal: "Visão passo a passo da arquitetura do Central Automation, com relatórios e evidências.",
    lessons: [
      {
        id: "m4-a1",
        title: "Aula 10 · Arquitetura passo a passo",
        duration: "50 min",
        deadlineWeek: 13,
        video: {
          title: "Arquitetura passo a passo",
          summary: "Configuração do ExtentSparkReporter, ciclo de vida do relatório e logs por passo.",
          checkpoints: ["Criar o ExtentReports", "Registrar passos com log()", "Gerar target/ExtentReport.html"],
        },
        diagram: "report-flow",
        content: `## ReportManager.java

\`\`\`java
public class ReportManager {
    private static ExtentReports extent;
    private static ExtentTest teste;

    public static void iniciarTeste(String nome) {
        if (extent == null) {
            ExtentSparkReporter spark = new ExtentSparkReporter("target/ExtentReport.html");
            extent = new ExtentReports();
            extent.attachReporter(spark);
        }
        teste = extent.createTest(nome);
    }

    public static void capturarTela(WebDriver driver, String nome) {
        File origem = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        File destino = new File("target/screenshots/" + nome + ".png");
        try {
            FileUtils.copyFile(origem, destino);
            teste.addScreenCaptureFromPath(destino.getAbsolutePath());
        } catch (IOException e) { }
    }

    public static void finalizar() { extent.flush(); }
}
\`\`\``,
        quiz: [
          {
            question: "O que acontece se `extent.flush()` não for chamado?",
            options: [
              "O relatório HTML não é escrito em disco",
              "O driver não fecha",
              "Os steps não executam",
              "As screenshots são apagadas",
            ],
            answer: 0,
            explanation: "flush() grava o conteúdo acumulado no arquivo do relatório.",
          },
        ],
      },
    ],
  },
];

export const allLessons: Lesson[] = modules.flatMap((m) => m.lessons);

export function lessonIndex(lessonId: string) {
  return allLessons.findIndex((l) => l.id === lessonId);
}
