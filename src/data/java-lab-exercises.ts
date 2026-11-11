/** 15 exercícios sequenciais do Laboratório Java (um por aula do curso). */
export interface LabTest {
  name: string;
  /** Expressão regular aplicada ao código do aluno */
  pattern?: string;
  /** Trecho que deve aparecer na saída do console */
  output?: string;
  hint: string;
}

export interface LabExercise {
  id: string; // mesmo id da aula
  module: string;
  title: string;
  statement: string;
  input: string;
  output: string;
  template: string;
  tests: LabTest[];
}

const header = `import org.junit.*;
import org.openqa.selenium.*;
import metodos.Metodos;
import elementos.Elementos;
import factory.DriverFactory;
`;

const cls = (name: string, body: string) => `${header}
public class ${name} {

${body}
}
`;

export const LAB_EXERCISES: LabExercise[] = [
  {
    id: "m1-a1", module: "Módulo 1", title: "Primeiro teste: olá automação",
    statement: "Crie um método de teste JUnit que imprima \"Automação iniciada\" no console.",
    input: "Nenhuma entrada.", output: "A linha \"Automação iniciada\" no console.",
    template: cls("PrimeiroTeste", `    @Test\n    public void deveIniciar() {\n        // escreva aqui\n    }\n`),
    tests: [
      { name: "usa a anotação @Test", pattern: "@Test", hint: "Anote o método com @Test." },
      { name: "imprime a mensagem", output: "Automação iniciada", hint: "Use System.out.println(\"Automação iniciada\");" },
    ],
  },
  {
    id: "m1-a2", module: "Módulo 1", title: "Verificando o Java 17",
    statement: "Imprima \"Java 17 pronto\" e valide com assertTrue que a versão (17) é maior ou igual a 17.",
    input: "int versao = 17;", output: "\"Java 17 pronto\" e assert verdadeiro.",
    template: cls("AmbienteTeste", `    @Test\n    public void deveValidarJdk() {\n        int versao = 17;\n        // escreva aqui\n    }\n`),
    tests: [
      { name: "usa Assert.assertTrue", pattern: "assertTrue\\s*\\(\\s*versao\\s*>=\\s*17", hint: "Assert.assertTrue(versao >= 17);" },
      { name: "imprime a mensagem", output: "Java 17 pronto", hint: "System.out.println(\"Java 17 pronto\");" },
    ],
  },
  {
    id: "m1-a3", module: "Módulo 1", title: "Dependências Maven",
    statement: "Declare a String selenium = \"4.27.0\" e valide com assertEquals que é a versão do projeto. Imprima \"Selenium 4.27.0\".",
    input: "Versão do pom.xml.", output: "\"Selenium 4.27.0\".",
    template: cls("DependenciasTeste", `    @Test\n    public void deveConferirVersao() {\n        // escreva aqui\n    }\n`),
    tests: [
      { name: "declara a versão", pattern: "String\\s+selenium\\s*=\\s*\"4\\.27\\.0\"", hint: "String selenium = \"4.27.0\";" },
      { name: "usa assertEquals", pattern: "assertEquals\\s*\\(\\s*\"4\\.27\\.0\"\\s*,\\s*selenium", hint: "Assert.assertEquals(\"4.27.0\", selenium);" },
      { name: "imprime a versão", output: "Selenium 4.27.0", hint: "System.out.println(\"Selenium 4.27.0\");" },
    ],
  },
  {
    id: "m2-a1", module: "Módulo 2", title: "Abrindo o navegador",
    statement: "Obtenha o driver com DriverFactory.getDriver() e navegue para https://central.automation/login.",
    input: "URL da aplicação.", output: "Log de navegação.",
    template: cls("NavegacaoTeste", `    @Test\n    public void deveAbrirLogin() {\n        WebDriver driver = null; // corrija\n    }\n`),
    tests: [
      { name: "usa DriverFactory.getDriver()", pattern: "DriverFactory\\.getDriver\\(\\)", hint: "WebDriver driver = DriverFactory.getDriver();" },
      { name: "navega para a URL", pattern: "driver\\.get\\(\\s*\"https://central\\.automation/login\"\\s*\\)", hint: "driver.get(\"https://central.automation/login\");" },
    ],
  },
  {
    id: "m2-a2", module: "Módulo 2", title: "Mapeando em Elementos",
    statement: "Use Elementos.campoUsuario e Elementos.campoSenha com Metodos.escrever para preencher \"qa\" e \"123\".",
    input: "Usuário e senha.", output: "Logs de digitação.",
    template: cls("ElementosTeste", `    @Test\n    public void devePreencherLogin() {\n        // escreva aqui\n    }\n`),
    tests: [
      { name: "escreve no usuário", pattern: "Metodos\\.escrever\\(\\s*Elementos\\.campoUsuario\\s*,\\s*\"qa\"", hint: "Metodos.escrever(Elementos.campoUsuario, \"qa\");" },
      { name: "escreve na senha", pattern: "Metodos\\.escrever\\(\\s*Elementos\\.campoSenha\\s*,\\s*\"123\"", hint: "Metodos.escrever(Elementos.campoSenha, \"123\");" },
      { name: "não usa By direto", pattern: "^(?![\\s\\S]*By\\.(id|xpath|cssSelector))", hint: "Centralize os seletores em Elementos, não use By no teste." },
    ],
  },
  {
    id: "m2-a3", module: "Módulo 2", title: "DSL de Metodos",
    statement: "Clique em Elementos.botaoEntrar com Metodos.clicar e tire evidência com Metodos.screenshot(\"login\").",
    input: "Botão de entrar.", output: "Logs de clique e screenshot.",
    template: cls("MetodosTeste", `    @Test\n    public void deveClicarEntrar() {\n        // escreva aqui\n    }\n`),
    tests: [
      { name: "clica no botão", pattern: "Metodos\\.clicar\\(\\s*Elementos\\.botaoEntrar\\s*\\)", hint: "Metodos.clicar(Elementos.botaoEntrar);" },
      { name: "tira screenshot", pattern: "Metodos\\.screenshot\\(\\s*\"login\"\\s*\\)", hint: "Metodos.screenshot(\"login\");" },
    ],
  },
  {
    id: "m3-a1", module: "Módulo 3", title: "Step Dado",
    statement: "Crie um método anotado com @Dado(\"que estou na tela de login\") que imprima \"tela de login\".",
    input: "Frase Gherkin.", output: "\"tela de login\".",
    template: cls("LoginSteps", `    // crie o step aqui\n`),
    tests: [
      { name: "anotação @Dado", pattern: "@Dado\\(\\s*\"que estou na tela de login\"\\s*\\)", hint: "@Dado(\"que estou na tela de login\")" },
      { name: "método público void", pattern: "public\\s+void\\s+\\w+\\s*\\(", hint: "public void queEstouNaTelaDeLogin() { ... }" },
      { name: "imprime a mensagem", output: "tela de login", hint: "System.out.println(\"tela de login\");" },
    ],
  },
  {
    id: "m3-a2", module: "Módulo 3", title: "Hooks @Before e @After",
    statement: "Crie @Before que chama DriverFactory.getDriver() e @After que chama DriverFactory.killDriver().",
    input: "Ciclo de vida.", output: "Logs de abertura e encerramento do driver.",
    template: cls("Hooks", `    // crie setUp e tearDown\n`),
    tests: [
      { name: "@Before com getDriver", pattern: "@Before[\\s\\S]*DriverFactory\\.getDriver\\(\\)", hint: "@Before public void setUp() { DriverFactory.getDriver(); }" },
      { name: "@After com killDriver", pattern: "@After[\\s\\S]*DriverFactory\\.killDriver\\(\\)", hint: "@After public void tearDown() { DriverFactory.killDriver(); }" },
    ],
  },
  {
    id: "m3-a3", module: "Módulo 3", title: "Runner JUnit",
    statement: "Anote a classe com @RunWith(Cucumber.class) e imprima \"runner pronto\" em um @Test.",
    input: "Features.", output: "\"runner pronto\".",
    template: `${header}
@RunWith(Cucumber.class)
public class Runner {

    @Test
    public void verificar() {
        // escreva aqui
    }
}
`,
    tests: [
      { name: "@RunWith(Cucumber.class)", pattern: "@RunWith\\(\\s*Cucumber\\.class\\s*\\)", hint: "Mantenha @RunWith(Cucumber.class)." },
      { name: "imprime runner pronto", output: "runner pronto", hint: "System.out.println(\"runner pronto\");" },
    ],
  },
  {
    id: "m4-a1", module: "Módulo 4", title: "Registrando no relatório",
    statement: "Registre o passo com ReportManager.log(\"Login executado\") e imprima \"relatório ok\".",
    input: "Passo executado.", output: "\"relatório ok\".",
    template: cls("RelatorioTeste", `    @Test\n    public void deveRegistrar() {\n        // escreva aqui\n    }\n`),
    tests: [
      { name: "usa ReportManager.log", pattern: "ReportManager\\.log\\(\\s*\"Login executado\"\\s*\\)", hint: "ReportManager.log(\"Login executado\");" },
      { name: "imprime relatório ok", output: "relatório ok", hint: "System.out.println(\"relatório ok\");" },
    ],
  },
  {
    id: "m4-a2", module: "Módulo 4", title: "Screenshot na falha",
    statement: "Num bloco try/catch, capture Exception e chame Metodos.screenshot(\"falha\") dentro do catch.",
    input: "Erro inesperado.", output: "Evidência gerada.",
    template: cls("EvidenciaTeste", `    @Test\n    public void deveGerarEvidencia() {\n        // escreva aqui\n    }\n`),
    tests: [
      { name: "usa try/catch", pattern: "try\\s*\\{[\\s\\S]*\\}\\s*catch\\s*\\(\\s*Exception\\s+\\w+\\s*\\)", hint: "try { ... } catch (Exception e) { ... }" },
      { name: "screenshot no catch", pattern: "catch\\s*\\([^)]*\\)\\s*\\{[^}]*Metodos\\.screenshot\\(\\s*\"falha\"", hint: "Dentro do catch: Metodos.screenshot(\"falha\");" },
    ],
  },
  {
    id: "m5-a1", module: "Módulo 5", title: "Espera explícita",
    statement: "Antes de clicar, use Metodos.esperarElemento(Elementos.botaoEntrar, 10). Nunca use Thread.sleep.",
    input: "Elemento lento.", output: "Logs de espera e clique.",
    template: cls("EsperaTeste", `    @Test\n    public void deveEsperar() {\n        Thread.sleep(5000);\n        Metodos.clicar(Elementos.botaoEntrar);\n    }\n`),
    tests: [
      { name: "usa espera explícita", pattern: "Metodos\\.esperarElemento\\(\\s*Elementos\\.botaoEntrar\\s*,\\s*10\\s*\\)", hint: "Metodos.esperarElemento(Elementos.botaoEntrar, 10);" },
      { name: "não usa Thread.sleep", pattern: "^(?![\\s\\S]*Thread\\.sleep)", hint: "Remova Thread.sleep — causa testes instáveis." },
      { name: "clica depois de esperar", pattern: "esperarElemento[\\s\\S]*Metodos\\.clicar", hint: "A espera deve vir antes do clique." },
    ],
  },
  {
    id: "m5-a2", module: "Módulo 5", title: "Configuração do pipeline",
    statement: "Leia o modo headless com String headless = System.getProperty(\"headless\", \"true\"); e imprima \"headless=\" + headless.",
    input: "Propriedade do pipeline.", output: "\"headless=true\".",
    template: cls("PipelineTeste", `    @Test\n    public void deveLerConfig() {\n        // escreva aqui\n    }\n`),
    tests: [
      { name: "lê a propriedade", pattern: "System\\.getProperty\\(\\s*\"headless\"\\s*,\\s*\"true\"\\s*\\)", hint: "System.getProperty(\"headless\", \"true\")" },
      { name: "imprime o modo", output: "headless=true", hint: "System.out.println(\"headless=\" + headless);" },
    ],
  },
  {
    id: "m6-a1", module: "Módulo 6", title: "Login inválido",
    statement: "Preencha senha \"errada\", clique em entrar e valide com assertEquals(\"Senha inválida\", Metodos.texto(Elementos.mensagemErro)).",
    input: "Credenciais inválidas.", output: "Assert de mensagem de erro.",
    template: cls("LoginInvalidoTeste", `    @Test\n    public void deveRecusarSenha() {\n        // escreva aqui\n    }\n`),
    tests: [
      { name: "senha errada", pattern: "Metodos\\.escrever\\(\\s*Elementos\\.campoSenha\\s*,\\s*\"errada\"", hint: "Metodos.escrever(Elementos.campoSenha, \"errada\");" },
      { name: "clica em entrar", pattern: "Metodos\\.clicar\\(\\s*Elementos\\.botaoEntrar\\s*\\)", hint: "Metodos.clicar(Elementos.botaoEntrar);" },
      { name: "valida a mensagem", pattern: "assertEquals\\(\\s*\"Senha inválida\"\\s*,\\s*Metodos\\.texto\\(\\s*Elementos\\.mensagemErro\\s*\\)", hint: "Assert.assertEquals(\"Senha inválida\", Metodos.texto(Elementos.mensagemErro));" },
    ],
  },
  {
    id: "m6-a2", module: "Módulo 6", title: "Suíte completa",
    statement: "Monte uma classe com @Before (getDriver), dois @Test e @After (killDriver). Imprima \"suíte concluída\" no @After.",
    input: "Suíte final.", output: "\"suíte concluída\".",
    template: cls("SuiteFinal", `    // monte a suíte completa\n`),
    tests: [
      { name: "@Before com getDriver", pattern: "@Before[\\s\\S]*DriverFactory\\.getDriver\\(\\)", hint: "Inclua o setUp com DriverFactory.getDriver()." },
      { name: "dois testes", pattern: "@Test[\\s\\S]*@Test", hint: "Crie dois métodos @Test." },
      { name: "@After com killDriver", pattern: "@After[\\s\\S]*DriverFactory\\.killDriver\\(\\)", hint: "Inclua o tearDown com DriverFactory.killDriver()." },
      { name: "imprime suíte concluída", output: "suíte concluída", hint: "System.out.println(\"suíte concluída\");" },
    ],
  },
];

export const TROUBLESHOOTING = [
  { ex: "NoSuchElementException", cause: "O seletor não foi encontrado no DOM no tempo limite.", action: "Verifique o atributo mapeado em Elementos.java." },
  { ex: "ElementClickInterceptedException", cause: "Um elemento visual (overlay/modal) bloqueou o clique.", action: "Utilize esperas explícitas de Metodos.java." },
  { ex: "TimeoutException", cause: "O tempo limite do WebDriverWait expirou.", action: "Ajuste o timeout no arquivo config.properties." },
  { ex: "NullPointerException", cause: "O Driver ou a classe DSL foi chamada sem inicializar.", action: "Verifique o setup no @Before do Hooks.java." },
];
