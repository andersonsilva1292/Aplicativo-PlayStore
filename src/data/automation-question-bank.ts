// Banco de questões do Framework Central Automation v2.0 (extraído do documento enviado pelo instrutor).
export type BankLevel = "junior" | "pleno" | "senior";
export interface BankQuestion {
  n: number;
  level: BankLevel;
  type: "choice" | "open";
  question: string;
  options?: string[];
  answer?: number;
  explanation: string;
}
export const BANK_PASS_SCORE = 75;
export const LEVEL_LABEL: Record<BankLevel, string> = { junior: "Júnior", pleno: "Pleno", senior: "Sênior" };
export const questionBank: BankQuestion[] = [
 {
  "n": 1,
  "level": "junior",
  "question": "Qual é a versão do Java exigida e utilizada como padrão na construção do Framework Central Automation v2.0?",
  "explanation": "O projeto especifica a utilização da versão LTS do Java 17 (<maven.compiler.source>17</maven.compiler.source>).",
  "type": "choice",
  "options": [
   "Java 8",
   "Java 11",
   "Java 17",
   "Java 21"
  ],
  "answer": 2
 },
 {
  "n": 2,
  "level": "junior",
  "question": "No arquivo pom.xml, qual propriedade configura a versão de origem e de destino para compilação do código Java?",
  "explanation": "As tags <maven.compiler.source> e <maven.compiler.target> no pom.xml definem a compatibilidade de versão do compilador Java.",
  "type": "choice",
  "options": [
   "<java.version>",
   "<maven.compiler.source> e <maven.compiler.target>",
   "<jdk.build.version>",
   "<maven.target.jdk>"
  ],
  "answer": 1
 },
 {
  "n": 3,
  "level": "junior",
  "question": "Para que serve o arquivo config.properties localizado no diretório src/test/resources/?",
  "explanation": "O arquivo config.properties é utilizado para externalizar variáveis de ambiente (URL, navegador, timeout, headless), evitando dados *hardcoded*.",
  "type": "choice",
  "options": [
   "Para armazenar os elementos mapeados via XPath e CSS Selector.",
   "Para gerenciar e baixar automaticamente os drivers dos navegadores.",
   "Para evitar dados fixos (*hardcoded*) no código, armazenando parâmetros de URL, navegador, modo headless e timeout.",
   "Para gerar o relatório visual do ExtentReports após os testes."
  ],
  "answer": 2
 },
 {
  "n": 4,
  "level": "junior",
  "question": "Qual é a finalidade principal do plugin maven-surefire-plugin configurado no pom.xml?",
  "explanation": "O maven-surefire-plugin gerencia a execução dos testes durante a fase de test do build do Maven, invocando a classe Runner.java.",
  "type": "choice",
  "options": [
   "Gerar automaticamente o relatório HTML no ExtentReports.",
   "Executar os testes automatizados durante a fase de build do Maven, incluindo especificamente o arquivo /Runner.java.",
   "Instalar o Java 17 na máquina do desenvolvedor.",
   "Compilar os cenários descritos em sintaxe Gherkin para arquivos .exe."
  ],
  "answer": 1
 },
 {
  "n": 5,
  "level": "junior",
  "question": "Na linguagem Gherkin, qual palavra-chave é utilizada para definir ações executadas previamente a todos os cenários de um mesmo arquivo de funcionalidade?",
  "explanation": "A instrução Contexto: no Gherkin pré-executa uma sequência de passos para todos os cenários daquele arquivo .feature.",
  "type": "choice",
  "options": [
   "Funcionalidade",
   "Esquema do Cenário",
   "Contexto",
   "Regra"
  ],
  "answer": 2
 },
 {
  "n": 6,
  "level": "junior",
  "question": "Qual linguagem é utilizada para a escrita das especificações de cenários de teste na ferramenta Cucumber no projeto Central Automation?",
  "explanation": "A linguagem de negócios orientada a BDD utilizada pelo Cucumber é a sintaxe Gherkin.",
  "type": "choice",
  "options": [
   "Markdown",
   "YAML",
   "Gherkin (com tag # language: pt)",
   "JSON"
  ],
  "answer": 2
 },
 {
  "n": 7,
  "level": "junior",
  "question": "No arquivo Central.feature, qual tag/idioma é declarada na primeira linha para permitir o uso dos termos \"Dado\", \"Quando\", \"E\", \"Então\"?",
  "explanation": "O cabeçalho # language: pt instrui o Cucumber a interpretar as palavras-chave no idioma Português.",
  "type": "choice",
  "options": [
   "# language: en",
   "# language: pt",
   "# locale: BR",
   "# gherkin: pt-br"
  ],
  "answer": 1
 },
 {
  "n": 8,
  "level": "junior",
  "question": "Qual anotação do JUnit 4 é utilizada na classe Runner.java para indicar que a execução deve ser gerenciada pelo Cucumber?",
  "explanation": "A anotação @RunWith(Cucumber.class) vincula a classe de execução do JUnit 4 ao motor de execução do Cucumber.",
  "type": "choice",
  "options": [
   "@RunWith(Cucumber.class)",
   "@Test",
   "@CucumberTest",
   "@ExecuteWith(JUnit.class)"
  ],
  "answer": 0
 },
 {
  "n": 9,
  "level": "junior",
  "question": "Na classe Elementos.java, qual classe do Selenium é utilizada para representar as estratégias de localização de elementos na página?",
  "explanation": "A classe org.openqa.selenium.By do Selenium é utilizada para armazenar os seletores de mapeamento de elementos.",
  "type": "choice",
  "options": [
   "WebElement",
   "WebDriver",
   "By",
   "Locator"
  ],
  "answer": 2
 },
 {
  "n": 10,
  "level": "junior",
  "question": "Qual é a estratégia de localização utilizada para mapear o botão \"Esqueci minha senha\" na classe Elementos.java?",
  "explanation": "Conforme declarado na classe Elementos.java: public static By botaoEsqueciMinhaSenha = By.xpath(\"//button[contains(text(), 'Esqueci minha senha')]\");.",
  "type": "choice",
  "options": [
   "By.id(\"esqueci-senha\")",
   "By.name(\"esqueciSenha\")",
   "By.xpath(\"//button[contains(text(), 'Esqueci minha senha')]\")",
   "By.cssSelector(\"button.esqueci\")"
  ],
  "answer": 2
 },
 {
  "n": 11,
  "level": "junior",
  "question": "Na classe Elementos.java, os campos campoEmail, campoSenha e campoNome são mapeados utilizando qual estratégia de busca?",
  "explanation": "Na classe Elementos.java, os campos de input de formulário são mapeados através da estratégia por atributo name: By.name(\"email\"), By.name(\"senha\"), By.name(\"nome\").",
  "type": "choice",
  "options": [
   "By.xpath",
   "By.name",
   "By.id",
   "By.className"
  ],
  "answer": 1
 },
 {
  "n": 12,
  "level": "junior",
  "question": "Para que serve a biblioteca WebDriverManager incluída nas dependências do projeto?",
  "explanation": "O WebDriverManager (pacote io.github.bonigarcia) automatiza o download e configuração do binário do driver apropriado para a versão do navegador instalado.",
  "type": "choice",
  "options": [
   "Para tirar capturas de tela quando um teste falhar.",
   "Para automatizar o gerenciamento e o download dos executáveis dos drivers sem necessidade de baixá-los manualmente.",
   "Para ler as propriedades do arquivo config.properties.",
   "Para conectar o Selenium ao relatório do ExtentReports."
  ],
  "answer": 1
 },
 {
  "n": 13,
  "level": "junior",
  "question": "Qual é a versão da dependência do selenium-java especificada no arquivo pom.xml da documentação?",
  "explanation": "A dependência configurada no pom.xml para a biblioteca Selenium é a versão 4.27.0.",
  "type": "choice",
  "options": [
   "3.141.59",
   "4.10.0",
   "4.27.0",
   "5.0.0"
  ],
  "answer": 2
 },
 {
  "n": 14,
  "level": "junior",
  "question": "No Windows, qual variável de ambiente de sistema deve ser criada apontando para o diretório raiz do Java para permitir a execução via prompt de comando?",
  "explanation": "A variável de ambiente do sistema necessária para referenciar a instalação do Java na máquina é a JAVA_HOME.",
  "type": "choice",
  "options": [
   "MAVEN_HOME",
   "JAVA_HOME",
   "JDK_PATH",
   "CLASSPATH"
  ],
  "answer": 1
 },
 {
  "n": 15,
  "level": "junior",
  "question": "Qual comando do Maven é utilizado para limpar a pasta de compilação target/ e executar os testes automatizados do projeto?",
  "explanation": "O comando mvn clean test remove a pasta target/ e recompila/executa toda a suite de testes automatizados do projeto.",
  "type": "choice",
  "options": [
   "mvn compile test",
   "mvn clean test",
   "mvn run runner",
   "mvn build execute"
  ],
  "answer": 1
 },
 {
  "n": 16,
  "level": "junior",
  "question": "Como se passa um parâmetro via linha de comando para alterar o navegador padrão (por exemplo, para Firefox) na execução via Maven?",
  "explanation": "O parâmetro -D é utilizado no Maven para sobrescrever propriedades de sistema via linha de comando (-Dbrowser=firefox).",
  "type": "choice",
  "options": [
   "mvn test --browser=firefox",
   "mvn test -Dbrowser=firefox",
   "mvn test browser:firefox",
   "mvn test set.browser=firefox"
  ],
  "answer": 1
 },
 {
  "n": 17,
  "level": "junior",
  "question": "Qual exceção do Selenium ocorre quando um elemento não é encontrado na árvore DOM do HTML dentro do tempo limite estipulado?",
  "explanation": "NoSuchElementException é a exceção lançada pelo Selenium quando a busca por um seletor não retorna nenhum elemento localizado na árvore DOM.",
  "type": "choice",
  "options": [
   "StaleElementReferenceException",
   "ElementClickInterceptedException",
   "NoSuchElementException",
   "NullPointerException"
  ],
  "answer": 2
 },
 {
  "n": 18,
  "level": "junior",
  "question": "Qual método da classe Metodos.java é utilizado para apagar o conteúdo prévio e digitar um texto em um campo de formulário?",
  "explanation": "O método escrever(By elemento, String texto) na classe Metodos faz a chamada do .clear() seguido do .sendKeys(texto).",
  "type": "choice",
  "options": [
   "clicar()",
   "escrever()",
   "obterTexto()",
   "preencherCadastro()"
  ],
  "answer": 1
 },
 {
  "n": 19,
  "level": "junior",
  "question": "O método obterTexto(By elemento) da classe Metodos.java retorna qual tipo de dado?",
  "explanation": "O método obterTexto(By elemento) aplica a espera pela visibilidade e retorna o conteúdo textual do elemento como uma String (el.getText()).",
  "type": "choice",
  "options": [
   "void",
   "WebElement",
   "String",
   "boolean"
  ],
  "answer": 2
 },
 {
  "n": 20,
  "level": "junior",
  "question": "Na camada de cola (Steps.java), qual biblioteca/framework é responsável por efetuar as asserções de validação (ex: Assert.assertEquals)?",
  "explanation": "As asserções de validação (Assert.assertTrue, Assert.assertEquals) pertencem ao framework de testes JUnit (org.junit.Assert).",
  "type": "choice",
  "options": [
   "Selenium WebDriver",
   "ExtentReports",
   "JUnit",
   "WebDriverManager"
  ],
  "answer": 2
 },
 {
  "n": 21,
  "level": "junior",
  "question": "Qual anotação do Cucumber é utilizada no método queEstouNaPaginaInicial() para vinculá-lo ao passo \"Dado que estou na página inicial do simulador CTFL\"?",
  "explanation": "A anotação @Dado(\"que estou na página inicial do simulador CTFL\") mapeia a frase contida na especificação Gherkin para o método Java.",
  "type": "choice",
  "options": [
   "@Given",
   "@Dado(\"que estou na página inicial do simulador CTFL\")",
   "@Before",
   "@Step(\"pagina_inicial\")"
  ],
  "answer": 1
 },
 {
  "n": 22,
  "level": "junior",
  "question": "Em qual pasta são salvas as fotos/evidências de execução geradas pela classe Utils.java?",
  "explanation": "Os artefatos de imagem gerados pela classe Utils.java são salvos no caminho relativo target/screenshots/.",
  "type": "choice",
  "options": [
   "src/test/resources/screenshots/",
   "target/screenshots/",
   "c:/temp/screenshots/",
   ".github/workflows/screenshots/"
  ],
  "answer": 1
 },
 {
  "n": 23,
  "level": "junior",
  "question": "Qual formato de dados de data/hora é utilizado pela classe Utils.java para nomear os arquivos de screenshot salvos no disco?",
  "explanation": "A classe Utils.java aplica o padrão new SimpleDateFormat(\"yyyyMMdd_HHmmss\") para timestamp nas evidências.",
  "type": "choice",
  "options": [
   "dd-MM-yyyy",
   "yyyyMMdd_HHmmss",
   "HH-mm-ss",
   "yyyy/MM/dd"
  ],
  "answer": 1
 },
 {
  "n": 24,
  "level": "junior",
  "question": "No arquivo config.properties, qual é a URL padrão configurada para a aplicação sob teste?",
  "explanation": "Conforme o arquivo config.properties, a propriedade é url=[https://estudosimuladorctfl.lovable.app/](https://estudosimuladorctfl.lovable.app/).",
  "type": "choice",
  "options": [
   "[https://google.com](https://google.com)",
   "[https://estudosimuladorctfl.lovable.app/](https://estudosimuladorctfl.lovable.app/)",
   "http://localhost:8080",
   "[https://demoblaze.com](https://demoblaze.com)"
  ],
  "answer": 1
 },
 {
  "n": 25,
  "level": "junior",
  "question": "O que acontece se o valor do parâmetro headless no config.properties for definido como true?",
  "explanation": "O modo headless habilita a execução do navegador sem a renderização da interface gráfica na tela (segundo plano).",
  "type": "choice",
  "options": [
   "O navegador é aberto minimizado na barra de tarefas.",
   "O navegador é executado em segundo plano, sem abrir uma interface gráfica na tela.",
   "Os testes são ignorados e não executam.",
   "O Selenium utiliza o Internet Explorer automaticamente."
  ],
  "answer": 1
 },
 {
  "n": 26,
  "level": "junior",
  "question": "Qual é o escopo (<scope>) definido no pom.xml para as dependências do JUnit e cucumber-junit?",
  "explanation": "As dependências do JUnit possuem o escopo <scope>test</scope>, garantindo que não sejam empacotadas no artefato final de produção.",
  "type": "choice",
  "options": [
   "compile",
   "provided",
   "test",
   "runtime"
  ],
  "answer": 2
 },
 {
  "n": 27,
  "level": "junior",
  "question": "Qual é a função da classe ConfigReader.java no framework?",
  "explanation": "A classe ConfigReader é um utilitário responsável por ler o arquivo config.properties e expor suas chaves via o método estático getProperty.",
  "type": "choice",
  "options": [
   "Criar a instância do navegador Chrome ou Firefox.",
   "Carregar em memória o arquivo config.properties e fornecer o método getProperty(String key).",
   "Capturar telas quando houver falhas de teste.",
   "Definir as tags Gherkin do Cucumber."
  ],
  "answer": 1
 },
 {
  "n": 28,
  "level": "junior",
  "question": "No arquivo de pipeline do GitHub Actions (maven-test.yml), qual sistema operacional é configurado no runner da máquina virtual?",
  "explanation": "No workflow maven-test.yml, o sistema operacional do ambiente virtual é definido como runs-on: ubuntu-latest.",
  "type": "choice",
  "options": [
   "windows-latest",
   "ubuntu-latest",
   "macos-12",
   "debian-stable"
  ],
  "answer": 1
 },
 {
  "n": 29,
  "level": "junior",
  "question": "Qual ação do GitHub Actions (uses: ...) é empregada para realizar a cópia do código do repositório para o ambiente da esteira?",
  "explanation": "A action oficial do GitHub actions/checkout@v3 realiza o download do código-fonte do repositório para o runner.",
  "type": "choice",
  "options": [
   "actions/setup-java@v3",
   "actions/checkout@v3",
   "actions/upload-artifact@v3",
   "actions/cache@v3"
  ],
  "answer": 1
 },
 {
  "n": 30,
  "level": "junior",
  "question": "Qual das alternativas representa uma boa prática de escrita em Gherkin aplicada no arquivo Central.feature?",
  "explanation": "A boa prática do BDD exige a escrita declarativa focada no comportamento e intenção de negócio, sem detalhes técnicos ou seletores HTML nas features.",
  "type": "choice",
  "options": [
   "Inserir código de programação e locators XPath diretamente nas frases do Gherkin.",
   "Escrever cenários declarativos voltados ao comportamento do negócio e ao usuário.",
   "Escrever passos com mais de 500 palavras cada um.",
   "Usar a mesma descrição para cenários com objetivos completamente opostos."
  ],
  "answer": 1
 },
 {
  "n": 31,
  "level": "junior",
  "question": "Qual método da classe DriverFactory deve ser chamado ao final de cada teste para fechar o navegador e limpar a variável de thread?",
  "explanation": "O método estático DriverFactory.quitDriver() encerra o navegador via quit() e remove a instância armazenada no ThreadLocal.",
  "type": "choice",
  "options": [
   "DriverFactory.closeDriver()",
   "DriverFactory.stop()",
   "DriverFactory.quitDriver()",
   "DriverFactory.destroy()"
  ],
  "answer": 2
 },
 {
  "n": 32,
  "level": "junior",
  "question": "Qual é o método da classe Metodos.java que utiliza JavascriptExecutor para rolar a página até o final?",
  "explanation": "O método rolarPaginaFinal() executa o script JavaScript \"window.scrollTo(0, document.body.scrollHeight);\" via JavascriptExecutor.",
  "type": "choice",
  "options": [
   "rolarPaginaFinal()",
   "scrollDown()",
   "irParaOAviso()",
   "moverMouseAbaixo()"
  ],
  "answer": 0
 },
 {
  "n": 33,
  "level": "junior",
  "question": "O que o trecho de código nomeCenario.replaceAll(\"[^a-zA-Z0-9]\", \"_\") na classe Utils.java faz?",
  "explanation": "A expressão regular [^a-zA-Z0-9] substitui qualquer caractere que não seja letra ou número por underline, evitando falhas de salvamento com caminhos inválidos no Sistema Operacional.",
  "type": "choice",
  "options": [
   "Criptografa o nome do cenário para não ser lido.",
   "Substitui qualquer caractere especial ou espaço do nome do cenário por underline (_) para gerar um nome de arquivo seguro.",
   "Apaga o nome do cenário se ele contiver números.",
   "Converte todas as letras para maiúsculas."
  ],
  "answer": 1
 },
 {
  "n": 34,
  "level": "junior",
  "question": "Qual tag do Cucumber no Runner.java define o formato dos trechos de código (snippets) que serão sugeridos quando um passo não for encontrado?",
  "explanation": "No Runner.java, a configuração snippets = CucumberOptions.SnippetType.CAMELCASE gera as assinaturas das funções do Java no formato padrão camelCase.",
  "type": "choice",
  "options": [
   "snippets = CucumberOptions.SnippetType.CAMELCASE",
   "snippets = SnippetType.SNAKE_CASE",
   "snippets = SnippetType.PASCALCASE",
   "snippets = SnippetType.UPPERCASE"
  ],
  "answer": 0
 },
 {
  "n": 35,
  "level": "junior",
  "question": "Qual parâmetro no Runner.java limpa os caracteres de formatação de cor do console para facilitar a leitura em terminais simples?",
  "explanation": "O parâmetro monochrome = true remove a formatação de cores do console para garantir logs legíveis em executores de texto puro.",
  "type": "choice",
  "options": [
   "pretty = true",
   "monochrome = true",
   "clean = true",
   "dryRun = true"
  ],
  "answer": 1
 },
 {
  "n": 36,
  "level": "junior",
  "question": "Qual exceção ocorre quando um modal ou banner invisível/sobreposto fica na frente de um botão no momento exato em que o Selenium tenta clicá-lo?",
  "explanation": "ElementClickInterceptedException é lançada quando o ponto de clique desejado está fisicamente coberto por outro elemento na camada visual.",
  "type": "choice",
  "options": [
   "NoSuchElementException",
   "ElementClickInterceptedException",
   "NullPointerException",
   "SessionNotFoundException"
  ],
  "answer": 1
 },
 {
  "n": 37,
  "level": "junior",
  "question": "Na classe Hooks.java, qual anotação indica o método que deve ser executado antes da inicialização de cada cenário de teste?",
  "explanation": "A anotação @Before importada do pacote io.cucumber.java executa o pré-requisito antes de cada cenário de teste do Cucumber.",
  "type": "choice",
  "options": [
   "@BeforeClass",
   "@Before (do pacote io.cucumber.java)",
   "@SetUp",
   "@Test"
  ],
  "answer": 1
 },
 {
  "n": 38,
  "level": "junior",
  "question": "No arquivo pom.xml, qual encoding de arquivos de build do projeto é configurado?",
  "explanation": "O encoding do projeto configurado no pom.xml é <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>.",
  "type": "choice",
  "options": [
   "ISO-8859-1",
   "UTF-8",
   "ASCII",
   "UTF-16"
  ],
  "answer": 1
 },
 {
  "n": 39,
  "level": "junior",
  "question": "Onde fica localizado o arquivo de relatório final do ExtentReports após a execução dos testes?",
  "explanation": "O relatório gerado pelo ExtentReports é configurado para gravação no arquivo target/ExtentReport.html.",
  "type": "choice",
  "options": [
   "src/test/resources/ExtentReport.html",
   "target/ExtentReport.html",
   "reports/index.html",
   "build/reports/Extent.html"
  ],
  "answer": 1
 },
 {
  "n": 40,
  "level": "junior",
  "question": "Em qual classe e pacote do projeto é declarada a massa de dados estática senhaDinamica = \"Senha123@\"?",
  "explanation": "A constante com a massa estática é declarada no pacote metodos, dentro da classe Metodos.java (public static String senhaDinamica = \"Senha123@\";).",
  "type": "choice",
  "options": [
   "Na classe Elementos do pacote elementos.",
   "Na classe Metodos do pacote metodos.",
   "Na classe Steps do pacote steps.",
   "Na classe ConfigReader do pacote utils."
  ],
  "answer": 1
 },
 {
  "n": 41,
  "level": "pleno",
  "question": "Por que a classe DriverFactory utiliza uma estrutura de dados ThreadLocal<WebDriver> em vez de uma variável estática simples private static WebDriver driver?",
  "explanation": "utilização de ThreadLocal<WebDriver> garante que cada thread de execução do Java possua sua própria cópia isolada da instância do WebDriver. Em um ambiente com múltiplos testes executando em paralelo, o uso de uma variável estática simples faria com que uma thread sobrescrevesse ou fechasse o navegador utilizado por outra thread simultaneamente, gerando erros como SessionNotFoundException e comportamento imprevisível. O ThreadLocal garante o isolamento total da sessão por thread (*thread-safety*).",
  "type": "open"
 },
 {
  "n": 42,
  "level": "pleno",
  "question": "No método initDriver da classe DriverFactory, quais argumentos específicos do ChromeOptions são adicionados quando a variável headless for igual a true?",
  "explanation": "No método initDriver, o bloco das opções do Chrome especifica exatamente: --headless=new, --disable-gpu, --window-size=1920,1080 e --remote-allow-origins=*.",
  "type": "choice",
  "options": [
   "--start-maximized, --incognito",
   "--headless=new, --disable-gpu, --window-size=1920,1080, --remote-allow-origins=",
   "--no-sandbox, --disable-dev-shm-usage, --ignore-certificate-errors",
   "--headless, --mute-audio, --disable-extensions"
  ],
  "answer": 1
 },
 {
  "n": 43,
  "level": "pleno",
  "question": "Como o método Metodos.escrever garante que o campo está pronto para receber texto antes de interagir com ele?",
  "explanation": "O método escrever faz a chamada da espera explícita wait.until(ExpectedConditions.visibilityOfElementLocated(elemento)), parando o fluxo até que o campo esteja visível no DOM.",
  "type": "choice",
  "options": [
   "Utilizando Thread.sleep(5000).",
   "Utilizando a espera explícita wait.until(ExpectedConditions.visibilityOfElementLocated(elemento)).",
   "Utilizando um bloco try-catch que tenta digitar até dar certo.",
   "Verificando se driver.findElement().isEnabled() através de um loop while."
  ],
  "answer": 1
 },
 {
  "n": 44,
  "level": "pleno",
  "question": "No gerenciador de relatórios ReportManager.java, qual padrão de projeto (*Design Pattern*) é empregado para garantir que exista apenas uma instância global do ExtentReports?",
  "explanation": "A classe ReportManager aplica o padrão Singleton através do método getInstance(), garantindo que exista apenas uma instância global do objeto ExtentReports aberta para inserção de dados.",
  "type": "choice",
  "options": [
   "Factory Method",
   "Singleton",
   "Strategy",
   "Decorator"
  ],
  "answer": 1
 },
 {
  "n": 45,
  "level": "pleno",
  "question": "Como a classe Hooks.java obtém o nome do cenário em execução para vinculá-lo ao relatório do ExtentReports e salvar o screenshot com o nome correto?",
  "explanation": "O Cucumber injeta o objeto Scenario nos métodos @Before e @After anotados no Hooks.java. Chamando scenario.getName(), extrai-se a descrição do cenário.",
  "type": "choice",
  "options": [
   "Lendo a propriedade do arquivo config.properties.",
   "Recebendo o objeto Scenario scenario do Cucumber injetado nos métodos @Before e @After e chamando scenario.getName().",
   "Invocando Thread.currentThread().getName().",
   "Capturando a URL atual da aplicação via driver.getCurrentUrl()."
  ],
  "answer": 1
 },
 {
  "n": 46,
  "level": "pleno",
  "question": "O que faz o método extent.flush() chamado no @After da classe Hooks.java?",
  "explanation": "O método extent.flush() descarrega o buffer em memória e compila todas as informações de execução e imagens gravando-as no arquivo final ExtentReport.html.",
  "type": "choice",
  "options": [
   "Limpa a memória RAM apagando todas as instâncias do navegador.",
   "Grava de forma efetiva todas as informações, logs e relatórios pendentes no arquivo físico HTML (ExtentReport.html).",
   "Reseta as configurações do config.properties.",
   "Reinicia o banco de dados da aplicação."
  ],
  "answer": 1
 },
 {
  "n": 47,
  "level": "pleno",
  "question": "O que acontece se a chamada DriverFactory.quitDriver() não remover a instância da thread via driverThread.remove() em testes executados em paralelo ou em grande volume?",
  "explanation": "A falta do driverThread.remove() faz com que a variável de thread retenha referências a instâncias mortas do driver na memória RAM, ocasionando vazamentos de memória e reuso indesejado de instâncias corrompidas entre testes futuros na mesma thread.",
  "type": "choice",
  "options": [
   "Ocorrerá erro de compilação no Maven.",
   "Pode ocorrer vazamento de memória (*memory leak*) e contaminação de sessões entre threads reusadas.",
   "O relatório do ExtentReports será apagado.",
   "O Selenium mudará automaticamente para o navegador Firefox."
  ],
  "answer": 1
 },
 {
  "n": 48,
  "level": "pleno",
  "question": "Na classe Metodos.java, como são gerados os dados dinâmicos para e-mail e nome nos cadastros de teste?",
  "explanation": "A classe Metodos utiliza new Random().nextInt(...) concatenado a pré-fixos de texto para gerar strings dinâmicas e imprevisíveis como qa_aluno_84920@gmail.com a cada rodada.",
  "type": "choice",
  "options": [
   "Lendo dados de um banco de dados MySQL externo.",
   "Utilizando instâncias da classe java.util.Random para concatenar inteiros aleatórios às strings base (qa_aluno_ e Estudante QA).",
   "Chamando uma API externa de geração de pessoas.",
   "Lendo um arquivo CSV na pasta resources."
  ],
  "answer": 1
 },
 {
  "n": 49,
  "level": "pleno",
  "question": "Qual é o valor retornado pelo método Utils.capturaTela(String nomeCenario) caso ocorra uma IOException durante o salvamento da imagem no disco?",
  "explanation": "Em caso de erro na manipulação de arquivos no método capturaTela, o bloco catch (IOException e) imprime o erro no terminal de exceções (System.err) e retorna o valor null.",
  "type": "choice",
  "options": [
   "Uma string vazia \"\".",
   "O caminho da imagem padrão do sistema.",
   "O valor null, com a gravação de uma mensagem de erro no System.err.",
   "Dispara uma RuntimeException encerrando a JVM."
  ],
  "answer": 2
 },
 {
  "n": 50,
  "level": "pleno",
  "question": "Analise os plugins declarados na classe Runner.java. Quais formatos de relatório nativos do Cucumber são configurados para serem gerados na pasta target/cucumber-reports/?",
  "explanation": "Os plugins declarados no @CucumberOptions do Runner.java incluem \"pretty\", \"html:target/cucumber-reports/cucumber.html\" e \"json:target/cucumber-reports/cucumber.json\".",
  "type": "choice",
  "options": [
   "Apenas PDF.",
   "pretty, html:target/cucumber-reports/cucumber.html e json:target/cucumber-reports/cucumber.json.",
   "XML do JUnit e CSV.",
   "Somente mensagens de log via Console."
  ],
  "answer": 1
 },
 {
  "n": 51,
  "level": "pleno",
  "question": "Qual é a utilidade prática do arquivo cucumber.json gerado na pasta target/cucumber-reports/?",
  "explanation": "O arquivo cucumber.json contém os dados estruturados de toda a execução (passos, status, tempo e falhas), permitindo a leitura por plugins gráficos externos de integração contínua (CI/CD).",
  "type": "choice",
  "options": [
   "Servir de entrada de dados para plugins de integração contínua (como Jenkins, Azure DevOps ou GitHub Actions) criarem gráficos de relatórios.",
   "Substituir o arquivo config.properties.",
   "Mapear os seletores XPath da página.",
   "Armazenar os logs de erro de compilação do Maven."
  ],
  "answer": 0
 },
 {
  "n": 52,
  "level": "pleno",
  "question": "No arquivo do GitHub Actions (maven-test.yml), qual é a finalidade do parâmetro -Dheadless=true no comando run: mvn clean test -Dheadless=true?",
  "explanation": "Passar -Dheadless=true via linha de comando sobrescreve o valor do config.properties, garantindo a execução do navegador sem interface gráfica dentro dos servidores sem tela do GitHub Actions.",
  "type": "choice",
  "options": [
   "Forçar os testes a executarem no Firefox.",
   "Sobrescrever a propriedade headless para garantir que o navegador execute sem interface gráfica na máquina virtual sem monitor do GitHub Actions.",
   "Desativar a gravação de screenshots.",
   "Cancelar a execução se um teste falhar."
  ],
  "answer": 1
 },
 {
  "n": 53,
  "level": "pleno",
  "question": "No GitHub Actions, o que a condição if: always() faz na etapa de upload do relatório como artefato (actions/upload-artifact@v3)?",
  "explanation": "A instrução if: always() no pipeline do GitHub Actions instrui o runner a executar a ação de salvar o relatório HTML mesmo se etapas anteriores (como a execução de testes) falharem com erro.",
  "type": "choice",
  "options": [
   "Garante que a etapa seja executada apenas se todos os testes passarem.",
   "Garante que a etapa de salvar o relatório seja executada independentemente de os testes terem passado ou falhado.",
   "Executa o upload a cada 5 minutos em loop infinito.",
   "Força a esteira a passar mesmo se o build quebrar."
  ],
  "answer": 1
 },
 {
  "n": 54,
  "level": "pleno",
  "question": "No método Hooks.tearDown, o que a condição if (scenario.isFailed()) faz com a instância do ExtentTest?",
  "explanation": "Quando scenario.isFailed() retorna true, o @After executa test.fail(...) e anexa o arquivo contendo a foto da falha via addScreenCaptureFromPath(screenshotPath).",
  "type": "choice",
  "options": [
   "Chama o método test.fail(\"O cenário falhou.\") e anexa a captura de tela capturada ao relatório ExtentReports.",
   "Lança uma exceção do tipo AssertionError cancelando os testes futuros.",
   "Reexecuta o cenário falhado três vezes automaticamente.",
   "Fecha o computador."
  ],
  "answer": 0
 },
 {
  "n": 55,
  "level": "pleno",
  "question": "Qual é a causa raiz da exceção StaleElementReferenceException no Selenium WebDriver e como ela é tratada no ecossistema do framework?",
  "explanation": "A StaleElementReferenceException ocorre quando um elemento anteriormente localizado não está mais anexado ao DOM do navegador. No framework, reduz-se esse problema ao interagir via seletores By acoplados a esperas explícitas em tempo real, em vez de armazenar objetos WebElement pré-instanciados.",
  "type": "choice",
  "options": [
   "O elemento é incompatível com o navegador Chrome.",
   "A referência do elemento no DOM mudou ou foi destruída após uma re-renderização da página (ex: chamada AJAX/React). Deve-se reidentificar o elemento antes da ação.",
   "O elemento possui um XPath incorreto.",
   "A variável WebDriver está igual a null."
  ],
  "answer": 1
 },
 {
  "n": 56,
  "level": "pleno",
  "question": "Qual método da biblioteca commons-io (FileUtils) é utilizado na classe Utils.java para copiar o arquivo de captura de tela temporário para o destino final?",
  "explanation": "A chamada utilizada no utilitário é FileUtils.copyFile(arquivoOrigem, arquivoDestino) da biblioteca Apache Commons IO.",
  "type": "choice",
  "options": [
   "FileUtils.moveFile(origem, destino)",
   "FileUtils.copyFile(arquivoOrigem, arquivoDestino)",
   "FileUtils.writeStringToFile(origem, destino)",
   "FileUtils.saveImage(origem, destino)"
  ],
  "answer": 1
 },
 {
  "n": 57,
  "level": "pleno",
  "question": "Na classe Steps.java, no passo @Então(\"devo retornar à página inicial de login\"), como é feita a validação de sucesso?",
  "explanation": "O passo recupera o elemento visual através do isDisplayed() do driver no botão botaoSair e valida com o Assert.assertTrue(\"Falha: Deveria estar na página inicial\", visivel).",
  "type": "choice",
  "options": [
   "Verificando se a URL do navegador é igual a \"login.html\".",
   "Verificando se o elemento botaoEntrar está visível na tela via isDisplayed() e aplicando Assert.assertTrue.",
   "Checando o status HTTP 200 da requisição.",
   "Lendo uma mensagem de alerta na tela."
  ],
  "answer": 1
 },
 {
  "n": 58,
  "level": "pleno",
  "question": "No arquivo Central.feature, qual é a frase exata do alerta validado no cenário de tentativa de login sem credenciais?",
  "explanation": "A validação do alerta no arquivo .feature compara exatamente o texto: \"Campos obrigatórios. Preencha todos os campos para continuar\".",
  "type": "choice",
  "options": [
   "\"Erro de Login\"",
   "\"Campos obrigatórios. Preencha todos os campos para continuar\"",
   "\"Usuário ou senha inválidos\"",
   "\"Preencha seus dados\""
  ],
  "answer": 1
 },
 {
  "n": 59,
  "level": "pleno",
  "question": "Qual a diferença entre as esperas do tipo Implicit Wait e Explicit Wait no Selenium WebDriver, e qual foi adotada na classe Metodos.java?",
  "explanation": "O Implicit Wait define um tempo limite global de espera por qualquer elemento; o Explicit Wait (WebDriverWait) aguarda por condições específicas de um elemento (clicável, visível). O framework utiliza exclusivamente o Explicit Wait na classe Metodos.java.",
  "type": "choice",
  "options": [
   "Implicit Wait aguarda por elementos globais; no framework adotou-se Explicit Wait (WebDriverWait) combinada com ExpectedConditions.",
   "Implicit Wait pausa o código em milissegundos fixos; o framework adota Thread.sleep().",
   "Nenhuma diferença, ambas são gerenciadas pelo Cucumber.",
   "O framework adota exclusivamente FluentWait com retentativas a cada 10ms."
  ],
  "answer": 0
 },
 {
  "n": 60,
  "level": "pleno",
  "question": "Como o tempo de timeout do WebDriverWait é configurado dinamicamente na classe Metodos.java?",
  "explanation": "O tempo de espera é recuperado dinamicamente no construtor da classe Metodos via Integer.parseInt(ConfigReader.getProperty(\"timeout\")).",
  "type": "choice",
  "options": [
   "Ele é fixado diretamente no código com o valor Duration.ofSeconds(30).",
   "É lido do arquivo config.properties através da chamada ConfigReader.getProperty(\"timeout\") e convertido para inteiro.",
   "É calculado dinamicamente com base na velocidade da internet do usuário.",
   "É passado via anotação no arquivo Runner.java."
  ],
  "answer": 1
 },
 {
  "n": 61,
  "level": "pleno",
  "question": "Na classe Metodos.java, qual é a função da instrução el.clear() dentro do método escrever(By elemento, String texto)?",
  "explanation": "O método el.clear() limpa o valor presente no campo de input antes de injetar os novos caracteres, evitando que o texto enviado seja concatenado a dados padrão antigos.",
  "type": "choice",
  "options": [
   "Apagar os cookies do navegador.",
   "Limpar qualquer conteúdo textual pré-existente no campo antes de enviar a nova sequência de caracteres via sendKeys.",
   "Fechar pop-ups abertos na página.",
   "Resetar as variáveis de ambiente Java."
  ],
  "answer": 1
 },
 {
  "n": 62,
  "level": "pleno",
  "question": "No arquivo maven-test.yml, qual distribuição do OpenJDK é configurada no passo actions/setup-java@v3?",
  "explanation": "O passo do GitHub Actions configura a distribuição Eclipse Temurin com a instrução distribution: 'temurin'.",
  "type": "choice",
  "options": [
   "zulu",
   "adopt",
   "temurin",
   "corretto"
  ],
  "answer": 2
 },
 {
  "n": 63,
  "level": "pleno",
  "question": "No ecossistema do Selenium WebDriver, para que serve a propriedade de argumento --remote-allow-origins=* no ChromeOptions?",
  "explanation": "O argumento --remote-allow-origins=* permite ao Chrome Driver estabelecer comunicação direta com a instância do Chrome através de WebSockets em qualquer origem, contornando bloqueios de segurança do navegador.",
  "type": "choice",
  "options": [
   "Para permitir que o navegador seja controlado remotamente através de conexões WebSocket, prevenindo bloqueios do Chrome Driver em versões mais recentes (CORS/WebSockets).",
   "Para permitir acesso a sites sem certificado SSL válido.",
   "Para ignorar pop-ups de geolocalização.",
   "Para habilitar a execução do Chrome no modo anônimo."
  ],
  "answer": 0
 },
 {
  "n": 64,
  "level": "pleno",
  "question": "Qual método estático do DriverFactory é chamado caso driverThread.get() retorne null ao invocar DriverFactory.getDriver()?",
  "explanation": "Se a thread atual estiver sem uma instância de driver atrelada, getDriver() chama dinamicamente o método initDriver(...) passando as configurações lidas do ConfigReader.",
  "type": "choice",
  "options": [
   "quitDriver()",
   "initDriver(ConfigReader.getProperty(\"browser\"), Boolean.parseBoolean(ConfigReader.getProperty(\"headless\")))",
   "DriverFactory.reset()",
   "WebDriverManager.chromedriver().setup()"
  ],
  "answer": 1
 },
 {
  "n": 65,
  "level": "pleno",
  "question": "Por que a classe Elementos.java possui apenas atributos do tipo public static By em vez de utilizar a anotação @FindBy do PageFactory?",
  "explanation": "Mapear seletores simples como public static By permite repassá-los para a classe Metodos, que aplica esperas explícitas diretamente antes de consultar o elemento no DOM real. Isso evita o armazenamento de referências obsoletas do PageFactory (@FindBy), prevenindo exceções de elemento obsoleto.",
  "type": "choice",
  "options": [
   "Porque a anotação @FindBy não funciona com Java 17.",
   "Para manter o mapeamento desacoplado do ciclo de vida da instância do WebDriver, permitindo que o Metodos aplique esperas explícitas diretamente no seletor By no momento da ação, evitando StaleElementReferenceException.",
   "Porque o Cucumber proíbe o uso do PageFactory.",
   "Foi um erro de digitação dos desenvolvedores."
  ],
  "answer": 1
 },
 {
  "n": 66,
  "level": "pleno",
  "question": "Qual das alternativas abaixo representa uma asserção do JUnit que valida a igualdade entre duas Strings na camada de passos (Steps.java)?",
  "explanation": "A asserção padrão para comparar duas variáveis do tipo String no JUnit é o Assert.assertEquals(esperado, obtido).",
  "type": "choice",
  "options": [
   "Assert.assertSame(mensagemEsperada, msgObtida);",
   "Assert.assertEquals(mensagemEsperada, msgObtida);",
   "Assert.verifyEquals(mensagemEsperada, msgObtida);",
   "Assert.assertThat(mensagemEsperada).contains(msgObtida);"
  ],
  "answer": 1
 },
 {
  "n": 67,
  "level": "pleno",
  "question": "Na classe ConfigReader.java, o que acontece dentro do bloco inicializador estático (static { ... })?",
  "explanation": "O bloco static executa no momento em que a classe é carregada pela JVM, abrindo o FileInputStream no arquivo config.properties e carregando-o no objeto Properties.",
  "type": "choice",
  "options": [
   "O navegador Chrome é aberto.",
   "O arquivo config.properties é lido do caminho de disco através de um FileInputStream e carregado no objeto Properties.",
   "É gerado o arquivo de log de execução.",
   "A esteira do GitHub Actions é iniciada."
  ],
  "answer": 1
 },
 {
  "n": 68,
  "level": "pleno",
  "question": "Qual exceção é lançada pela classe ConfigReader caso o arquivo src/test/resources/config.properties não seja encontrado?",
  "explanation": "A exceção de IO capturada no bloco é relançada envelopada em uma exceção de tempo de execução: throw new RuntimeException(\"Erro: Não foi possível carregar o arquivo config.properties\").",
  "type": "choice",
  "options": [
   "FileNotFoundException capturada e relançada como RuntimeException(\"Erro: Não foi possível carregar o arquivo config.properties\").",
   "NullPointerException.",
   "NoSuchElementException.",
   "Nenhuma, o sistema define valores padrão e continua."
  ],
  "answer": 0
 },
 {
  "n": 69,
  "level": "pleno",
  "question": "Como a classe ReportManager configura o tema visual do relatório ExtentReports HTML?",
  "explanation": "A estilização é configurada no ReportManager através do comando htmlReporter.config().setTheme(Theme.DARK);.",
  "type": "choice",
  "options": [
   "htmlReporter.config().setTheme(Theme.STANDARD);",
   "htmlReporter.config().setTheme(Theme.DARK);",
   "htmlReporter.config().setTheme(Theme.LIGHT);",
   "htmlReporter.config().setTheme(Theme.CUSTOM);"
  ],
  "answer": 1
 },
 {
  "n": 70,
  "level": "pleno",
  "question": "Na classe ReportManager, quais informações do sistema operacional e do Java são anexadas dinamicamente ao relatório ExtentReports?",
  "explanation": "O ReportManager lê informações do ambiente de execução do sistema chamando as propriedades nativas do Java: System.getProperty(\"os.name\") e System.getProperty(\"java.version\").",
  "type": "choice",
  "options": [
   "System.getProperty(\"os.name\") e System.getProperty(\"java.version\").",
   "System.getenv(\"USER\") e System.getenv(\"JAVA_HOME\").",
   "Nenhuma, essas informações são fixas.",
   "O número do IP e endereço MAC da placa de rede."
  ],
  "answer": 0
 },
 {
  "n": 71,
  "level": "pleno",
  "question": "No arquivo Central.feature, qual é a última instrução (passo) do cenário \"Cadastro e login com novo usuário dinâmico\"?",
  "explanation": "O último passo do cenário de cadastro do Gherkin é: Então devo visualizar a área logada do aluno com sucesso.",
  "type": "choice",
  "options": [
   "E fecho o navegador",
   "Então devo visualizar a área logada do aluno com sucesso",
   "Então retorno ao login",
   "E recebo o e-mail de confirmação"
  ],
  "answer": 1
 },
 {
  "n": 72,
  "level": "pleno",
  "question": "O que o parâmetro glue = {\"steps\", \"hooks\"} no Runner.java faz no Cucumber?",
  "explanation": "O atributo glue no @CucumberOptions direciona o motor do Cucumber para os pacotes Java onde residem as classes que implementam os ganchos e as instruções dos passos.",
  "type": "choice",
  "options": [
   "Une dois arquivos de feature em um só.",
   "Mapeia os pacotes onde o Cucumber deve procurar as classes que contêm as definições dos passos (Steps) e os ganchos do ciclo de vida (Hooks).",
   "Conecta o Selenium ao banco de dados.",
   "Anexa os screenshots ao arquivo em formato JSON."
  ],
  "answer": 1
 },
 {
  "n": 73,
  "level": "pleno",
  "question": "O que acontece se o parâmetro browser no config.properties for definido como \"edge\"?",
  "explanation": "A classe DriverFactory redireciona a chave \"edge\" no switch, baixando o driver do Edge via WebDriverManager e retornando a instância EdgeDriver().",
  "type": "choice",
  "options": [
   "O DriverFactory cai no bloco switch (browser.toLowerCase()), executa WebDriverManager.edgedriver().setup() e instancia o EdgeDriver().",
   "O Selenium lança IllegalArgumentException.",
   "O Chrome abre por padrão ignorando a opção.",
   "O teste roda apenas no Linux."
  ],
  "answer": 0
 },
 {
  "n": 74,
  "level": "pleno",
  "question": "Na classe Metodos.java, qual condição de espera explícita é utilizada antes de executar o comando .click()?",
  "explanation": "Antes da instrução de clique, a classe Metodos exige que o elemento atinja a condição clicável: ExpectedConditions.elementToBeClickable(elemento).",
  "type": "choice",
  "options": [
   "ExpectedConditions.visibilityOfElementLocated(elemento)",
   "ExpectedConditions.elementToBeClickable(elemento)",
   "ExpectedConditions.presenceOfElementLocated(elemento)",
   "ExpectedConditions.textToBePresentInElement(elemento)"
  ],
  "answer": 1
 },
 {
  "n": 75,
  "level": "pleno",
  "question": "O que a opção path: target/ExtentReport.html faz no workflow do GitHub Actions?",
  "explanation": "A chave path na action de upload do GitHub especifica o caminho do arquivo no runner que deve ser empacotado para o download do usuário.",
  "type": "choice",
  "options": [
   "Apaga o relatório do disco para poupar espaço.",
   "Especifica qual arquivo físico será empacotado e disponibilizado para download como artefato da execução da esteira.",
   "Envia o arquivo via e-mail para os desenvolvedores.",
   "Converte o relatório HTML em PDF."
  ],
  "answer": 1
 },
 {
  "n": 76,
  "level": "pleno",
  "question": "Por que o método getInstance() na classe ReportManager possui o modificador synchronized em sua assinatura?",
  "explanation": "O modificador synchronized introduz um bloqueio de monitor na função estática, garantindo que mesmo com execuções paralelas concorrentes, apenas uma thread possa instanciar a classe ReportManager por vez (padrão Thread-Safe Singleton).",
  "type": "choice",
  "options": [
   "Para impedir que o método seja chamado por classes fora do pacote.",
   "Para garantir a thread-safety durante a execução paralela de testes, impedindo que duas threads criem duas instâncias concorrentes do relatório.",
   "Para acelerar a velocidade de compilação do código Java.",
   "Para evitar que o relatório seja sobrescrito no final."
  ],
  "answer": 1
 },
 {
  "n": 77,
  "level": "pleno",
  "question": "Qual método do WebDriver.Timeouts é configurado no método @Before da classe Hooks.java?",
  "explanation": "No método @Before do Hooks.java, o tempo de carregamento da página é configurado com DriverFactory.getDriver().manage().timeouts().pageLoadTimeout(...).",
  "type": "choice",
  "options": [
   "implicitlyWait",
   "pageLoadTimeout alimentado pela configuração de timeout do config.properties.",
   "scriptTimeout",
   "setScriptTimeout"
  ],
  "answer": 1
 },
 {
  "n": 78,
  "level": "pleno",
  "question": "Na classe Steps.java, por que o método metodos.preencherCadastro() preenche os campos com e-mail e nome sem receber strings de parâmetros nos passos?",
  "explanation": "O método preencherCadastro() engloba a geração da massa dinâmica invocando gerarNomeAleatorio() e gerarEmailAleatorio(), armazenando os resultados em campos públicos da classe Metodos.",
  "type": "choice",
  "options": [
   "Porque utiliza os métodos internos gerarNomeAleatorio() e gerarEmailAleatorio() armazenando os valores nas variáveis estáticas de classe Metodos.emailDinamico e Metodos.nomeDinamico.",
   "Porque o formulário já vem pré-preenchido do servidor.",
   "Porque os dados são fixos no config.properties.",
   "Porque o Selenium digita caracteres aleatórios por padrão."
  ],
  "answer": 0
 },
 {
  "n": 79,
  "level": "pleno",
  "question": "Qual biblioteca de asserções do Java permite verificar se um valor booleano é verdadeiro no JUnit 4, exibindo uma mensagem personalizada caso falhe?",
  "explanation": "O JUnit 4 provê o método Assert.assertTrue(String message, boolean condition), exibindo a mensagem em caso da condição booleana avaliar para false.",
  "type": "choice",
  "options": [
   "Assert.assertTrue(String message, boolean condition)",
   "Assert.checkTrue(boolean condition)",
   "Assert.isTrue(condition, String message)",
   "Assert.assertEquals(boolean condition, String message)"
  ],
  "answer": 0
 },
 {
  "n": 80,
  "level": "pleno",
  "question": "Em um cenário de troubleshooting, se os testes passarem localmente com a interface gráfica, mas falharem na pipeline do GitHub Actions com o erro WebDriverException: unknown error: cannot find Chrome binary, qual é a causa provável?",
  "explanation": "Execuções em ambientes contêineres/CI (Ubuntu) sem interface gráfica falham se as opções do headless e o sinalizador --no-sandbox não estiverem configurados ou se o pacote do navegador não estiver instalado no runner.",
  "type": "choice",
  "options": [
   "O Java não está instalado localmente.",
   "A imagem do runner Linux não possui o navegador Chrome instalado ou as opções do ChromeOptions (como --headless=new e --no-sandbox) não foram passadas corretamente na inicialização.",
   "O arquivo pom.xml está com a tag <packaging> errada.",
   "A variável emailDinamico é nula."
  ],
  "answer": 1
 },
 {
  "n": 81,
  "level": "senior",
  "question": "Analise o design da arquitetura do Framework Central Automation v2.0. Discorra sobre como o desacoplamento entre as camadas Elementos, Metodos, DriverFactory, Steps e Hooks cumpre os princípios de código limpo (SOLID), em especial o SRP (Single Responsibility Principle) e a facilidade de manutenção.",
  "explanation": "arquitetura atende ao Single Responsibility Principle (SRP):\n- Elementos.java: Mapeamento exclusivo de seletores (By).\n- Metodos.java: DSL centralizando ações e esperas explícitas.\n- DriverFactory.java: Gerenciamento e instanciação do WebDriver via Factory e ThreadLocal.\n- Steps.java: Conexão entre o Gherkin e o Java.\n- Hooks.java: Controle isolado de inicialização e encerramento dos cenários.",
  "type": "open"
 },
 {
  "n": 82,
  "level": "senior",
  "question": "Se ativarmos a execução paralela do Cucumber via JUnit no pom.xml (ex: dataproviderthreadcount ou surefire com múltiplas threads), avalie como o DriverFactory com ThreadLocal<WebDriver> e o ReportManager lidam com o isolamento de sessões e concorrência de relatórios. Há algum risco de *race condition*? Como corrigi-lo se necessário?",
  "explanation": "O DriverFactory utiliza ThreadLocal para isolamento de sessão. Contudo, o ReportManager grava em um único arquivo (target/ExtentReport.html). Em execuções paralelas concorrentes, múltiplas threads gravando simultaneamente no mesmo arquivo de saída podem gerar *race conditions*. A solução exige o uso de ThreadLocal<ExtentTest> dentro do gerenciador de relatórios para isolar os contextos de escrita por thread.",
  "type": "open"
 },
 {
  "n": 83,
  "level": "senior",
  "question": "Na classe DriverFactory.java, o método quitDriver() possui a seguinte implementação:\nJava\npublic static void quitDriver() {\nif (driverThread.get() != null) {\ndriverThread.get().quit();\ndriverThread.remove();\n}\n}\nO que aconteceria se a chamada driverThread.remove() fosse omitida? Qual o impacto exato sobre a JVM e sobre as próximas instâncias de testes em um ambiente de *Thread Pooling*?",
  "explanation": "Omitir driverThread.remove() mantém a referência da thread atrelada a uma instância descartada do driver no ThreadLocal. Se o JUnit reutilizar a thread para outro teste, a tentativa de acesso gerará exceção NoSuchSessionException ou acoplamento e vazamento de memória RAM.",
  "type": "open"
 },
 {
  "n": 84,
  "level": "senior",
  "question": "Em termos de performance de automação de testes e estabilidade em navegadores modernos (Chromium v110+), por que o argumento --headless=new do ChromeOptions é superior ao antigo modo --headless legacy?",
  "explanation": "O --headless=new utiliza o novo motor nativo de renderização do Chromium, oferecendo paridade com o modo gráfico e reduzindo falhas de layout/DOM.",
  "type": "choice",
  "options": [
   "Porque o modo --headless=new utiliza o novo motor de renderização nativo do Chrome, comportando-se com 100% de paridade com o modo gráfico (suportando extensões, downloads e melhor cálculo de layout/DOM), reduzindo falsos positivos por falhas de renderização.",
   "Porque o modo antigo não suportava execução no Linux.",
   "Porque o modo --headless=new desativa completamente o consumo de memória RAM.",
   "Porque o modo antigo não aceitava esperas explícitas do Selenium."
  ],
  "answer": 0
 },
 {
  "n": 85,
  "level": "senior",
  "question": "Suponha que uma nova versão do sistema sob teste introduza componentes construídos sobre Shadow DOM (Closed) ou Iframes Aninhados. Como a DSL genérica da classe Metodos.java deveria ser refatorada para suportar interações nesses cenários mantendo o padrão de esperas explícitas?",
  "explanation": "Para Iframes Aninhados, incluir na DSL o método wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(locator)). Para Shadow DOM, utilizar JavascriptExecutor recuperando o elemento via element.shadowRoot.querySelector(...) ou utilizar o suporte nativo a SearchContext do Selenium 4.",
  "type": "open"
 },
 {
  "n": 86,
  "level": "senior",
  "question": "Analise a classe Metodos.java. A inicialização do objeto WebDriverWait ocorre no construtor da classe:\nJava\npublic Metodos() {\nthis.driver = DriverFactory.getDriver();\nint timeOut = Integer.parseInt(ConfigReader.getProperty(\"timeout\"));\nthis.wait = new WebDriverWait(driver, Duration.ofSeconds(timeOut));\n}\nQual é o impacto de instanciar a classe Metodos como um atributo de classe na Steps.java (private Metodos metodos = new Metodos();) antes da execução do método @Before do Hooks.java? Pode haver um NullPointerException? Por quê?",
  "explanation": "Instanciar Metodos como atributo de classe faz seu construtor rodar na carga da classe Steps. Se o driver ainda não tiver sido inicializado no @Before do Hooks, a chamada DriverFactory.getDriver() pode gerar concorrência ou falhas de ciclo de vida.",
  "type": "open"
 },
 {
  "n": 87,
  "level": "senior",
  "question": "No GitHub Actions, o passo de cache para dependências do Maven foi configurado como cache: maven dentro de actions/setup-java@v3. Qual é o impacto dessa configuração no tempo de execução do pipeline CI/CD?",
  "explanation": "A instrução armazena a pasta ~/.m2/repository no cache do GitHub Actions, evitando downloads repetidos de dependências em novos builds e reduzindo o tempo de execução.",
  "type": "choice",
  "options": [
   "Nenhum impacto visual.",
   "Reduz drasticamente o tempo de build em execuções subsequentes, pois evita o download repetido de todas as dependências do .m2/repository do Maven a cada novo commit.",
   "Faz os testes rodarem 10 vezes mais rápido no Selenium.",
   "Impede a execução de testes falhados."
  ],
  "answer": 1
 },
 {
  "n": 88,
  "level": "senior",
  "question": "Como a arquitetura do framework lida com a captura e anexo de evidências em relatórios quando um teste falha durante a execução de uma pipeline CI/CD sem interface gráfica?",
  "explanation": "O @After lê scenario.isFailed(), aciona Utils.capturaTela() e insere a imagem PNG gerada no relatório HTML via test.addScreenCaptureFromPath(...).",
  "type": "choice",
  "options": [
   "O Selenium automaticamente tira um print de toda a área de trabalho do servidor Linux.",
   "O método @After na classe Hooks intercepta o estado do cenário via scenario.isFailed(), chama Utils.capturaTela(), grava o arquivo PNG headless no disco e o insere no HTML via test.addScreenCaptureFromPath(screenshotPath).",
   "O GitHub Actions grava um vídeo da tela do terminal.",
   "O ExtentReports reexecuta o teste em modo gráfico automaticamente."
  ],
  "answer": 1
 },
 {
  "n": 89,
  "level": "senior",
  "question": "Avalie o impacto de definir um valor muito alto de timeout no config.properties (ex: timeout=120) em um projeto de integração contínua com 500 cenários de teste regressivos.",
  "explanation": "Um timeout excessivo (ex: 120s) faz com que cada elemento ausente em testes falhos atrase a esteira significativamente. Em 50 testes com falha, o tempo perdido em esperas passivas pode ultrapassar 1 hora de build na pipeline.",
  "type": "open"
 },
 {
  "n": 90,
  "level": "senior",
  "question": "Qual é a principal vantagem de declarar as propriedades de compilação <maven.compiler.source>17</maven.compiler.source> e <maven.compiler.target>17</maven.compiler.target> explicitamente no pom.xml?",
  "explanation": "A declaração força a compilação no padrão Java 17, garantindo o uso de novos recursos da linguagem e impedindo incompatibilidade de bytecode.",
  "type": "choice",
  "options": [
   "Garantir que o projeto utilize recursos modernos da linguagem Java 17 (como Records, Text Blocks, Pattern Matching) e proibir a compilação por versões legadas e incompatíveis do JDK na esteira.",
   "Acelerar o download do Selenium WebDriver.",
   "Habilitar o uso da linguagem Gherkin em português.",
   "Conectar o Cucumber ao Selenium automaticamente."
  ],
  "answer": 0
 },
 {
  "n": 91,
  "level": "senior",
  "question": "Em caso de atualizações de versão de navegação corporativa que bloqueiem a atualização automática de binaries via WebDriverManager devido a restrições de proxy ou firewall de rede, como a classe DriverFactory.java poderia ser adaptada para suportar caminhos fixos de executáveis drivers localmente?",
  "explanation": "Refatorar a DriverFactory para verificar se existe uma propriedade com o caminho do binário local (ex: driver.path) e, caso configurada, desativar o WebDriverManager utilizando System.setProperty(\"webdriver.chrome.driver\", caminhoLocal).",
  "type": "open"
 },
 {
  "n": 92,
  "level": "senior",
  "question": "Analise a instrução de captura de tela na classe Utils.java:\nJava\nTakesScreenshot screenshot = (TakesScreenshot) DriverFactory.getDriver();\nFile arquivoOrigem = screenshot.getScreenshotAs(OutputType.FILE);\nEm quais cenários a coerção de tipo (TakesScreenshot) DriverFactory.getDriver() lançaria uma exceção ClassCastException?",
  "explanation": "A exceção ClassCastException ocorre se o objeto retornado por DriverFactory.getDriver() for um mock ou implementação que não estenda a interface TakesScreenshot.",
  "type": "choice",
  "options": [
   "Quando o driver estivesse operando em modo headless.",
   "Se a instância do driver armazenada no ThreadLocal não implementasse a interface TakesScreenshot (por exemplo, se um *MockDriver* sem suporte a captura gráfica fosse utilizado).",
   "Quando a resolução da tela fosse menor que 1024x768.",
   "Quando o parâmetro headless estivesse definido como false."
  ],
  "answer": 1
 },
 {
  "n": 93,
  "level": "senior",
  "question": "Como deve ser feita a gestão do ciclo de vida dos relatórios ExtentReports quando executamos múltiplos arquivos de Runner em suites de testes divididas por módulos em um ambiente CI/CD?",
  "explanation": "onfigurar os executores para salvar saídas intermediárias em formato JSON. Após a finalização dos testes, executar uma etapa pós-build na pipeline para ler e mesclar todos os arquivos JSON em um único relatório consolidado.",
  "type": "open"
 },
 {
  "n": 94,
  "level": "senior",
  "question": "Na classe Metodos.java, qual é o efeito prático da chamada el.sendKeys(texto) caso o elemento seja um input do tipo file (<input type=\"file\">) em vez de um campo de texto convencional?",
  "explanation": "O Selenium envia o caminho absoluto do arquivo diretamente para o input de arquivo, realizando o upload sem acionar janelas do sistema operacional.",
  "type": "choice",
  "options": [
   "O Selenium lança a exceção ElementNotInteractableException.",
   "O Selenium faz o upload direto do arquivo cujo caminho absoluto é passado na variável texto, contornando a necessidade de interagir com a janela modal nativa do Sistema Operacional.",
   "O navegador abre a caixa de diálogo de seleção do Windows.",
   "A página é atualizada automaticamente."
  ],
  "answer": 1
 },
 {
  "n": 95,
  "level": "senior",
  "question": "Como garantir que as senhas e credenciais sensíveis dos testes não sejam expostas em texto plano (*hardcoded*) no repositório de código (como no arquivo config.properties ou na classe Metodos), mantendo o pipeline do GitHub Actions seguro?",
  "explanation": "adastrar dados sensíveis nos *Encrypted Secrets* do repositório (ex: GitHub Secrets) e injetá-los no momento da execução da esteira via parâmetros de sistema Maven (-Dsenha=\\${{ secrets.SENHA }}).",
  "type": "open"
 },
 {
  "n": 96,
  "level": "senior",
  "question": "Na classe Elementos.java, por que a busca por texto contido em botões via XPath utiliza o operador contains(text(), '...') em vez da igualdade estrita text() = '...'?",
  "explanation": "O operador contains ignora espaços extras ou quebras de linha em volta do texto no HTML do elemento.",
  "type": "choice",
  "options": [
   "Porque a busca estrita falha caso existam espaços em branco (*whitespaces*), quebras de linha ou caracteres não visíveis em volta do texto no HTML do elemento.",
   "Porque o Selenium não suporta a função text() = '...' no Java 17.",
   "Porque o operador contains roda 50% mais rápido.",
   "Para permitir que o XPath encontre elementos em outras páginas."
  ],
  "answer": 0
 },
 {
  "n": 97,
  "level": "senior",
  "question": "Discorra sobre como resolver a falha de consistência de testes flutuantes (*flaky tests*) causados por animações CSS3 e transições assíncronas em aplicações Single Page Applications (SPA - React/Angular) sem utilizar Thread.sleep().",
  "explanation": "Utilizar esperas explícitas personalizadas aguardando o fim de requisições assíncronas (ex: jQuery.active == 0), ausência de componentes de carregamento (*spinners*) ou usar a classe FluentWait.",
  "type": "open"
 },
 {
  "n": 98,
  "level": "senior",
  "question": "No arquivo Central.feature, se um desenvolvedor adicionar um novo cenário utilizando Esquema do Cenário e a tabela Exemplos, qual anotação no Runner.java garante que a nomenclatura dos cenários com parâmetros seja formatada adequadamente?",
  "explanation": "O Cucumber desmembra automaticamente as linhas da tabela Exemplos e formata o nome de cada cenário gerado nos relatórios.",
  "type": "choice",
  "options": [
   "snippets = CucumberOptions.SnippetType.CAMELCASE",
   "O plugin nativo do Cucumber converte e expande automaticamente os exemplos no log de execução e relatórios sem necessidade de novas tags no Runner.",
   "monochrome = false",
   "@RunWith(Parameterized.class)"
  ],
  "answer": 1
 },
 {
  "n": 99,
  "level": "senior",
  "question": "O que acontece na classe Hooks.java se uma exceção não tratada for disparada dentro do bloco @Before?",
  "explanation": "Exceções não tratadas no @Before interrompem a execução do cenário imediatamente, marcando os passos como não executados e invocando o @After para teardown.",
  "type": "choice",
  "options": [
   "O Cucumber ignora o erro e tenta executar os passos do cenário normalmente.",
   "A execução do cenário corrente é interrompida imediatamente, o cenário é marcado como SKIPPED/FAILED, os passos do Gherkin não são executados e o bloco @After é invocado para limpeza.",
   "O repositório no GitHub é excluído.",
   "O relatório ExtentReports não é gerado."
  ],
  "answer": 1
 },
 {
  "n": 100,
  "level": "senior",
  "question": "Discorra sobre como o design do framework permite implementar um mecanismo de Retry Analyzer (reexecução automática de testes falhos) no JUnit 4 / Cucumber.",
  "explanation": "Pode-se configurar a propriedade do maven-surefire-plugin <rerunFailingTestsCount> ou implementar uma regra customizada do JUnit (TestRule) que intercepta exceções e reexecuta o teste uma quantidade definida de vezes.",
  "type": "open"
 },
 {
  "n": 101,
  "level": "senior",
  "question": "Qual das alternativas abaixo apresenta o código Java correto para realizar uma rolagem suave até um elemento específico via JavascriptExecutor na classe Metodos.java?",
  "explanation": "A sintaxe correta via JavaScript é ((JavascriptExecutor) driver).executeScript(\"arguments[0].scrollIntoView(true);\", elemento);.",
  "type": "choice",
  "options": [
   "((JavascriptExecutor) driver).executeScript(\"arguments[0].scrollIntoView(true);\", wait.until(ExpectedConditions.presenceOfElementLocated(elemento)));",
   "driver.scrollTo(elemento);",
   "driver.manage().window().scroll(elemento);",
   "((JavascriptExecutor) driver).executeScript(\"window.scrollTo(0, 0);\");"
  ],
  "answer": 0
 },
 {
  "n": 102,
  "level": "senior",
  "question": "Caso ocorra o erro NullPointerException especificamente na linha DriverFactory.getDriver().manage().window().maximize(); no @Before do Hooks.java, qual foi a falha no fluxo de execução?",
  "explanation": "O erro ocorre se DriverFactory.getDriver() retornar null devido a falha na inicialização da sessão do navegador antes do acesso à janela.",
  "type": "choice",
  "options": [
   "A variável url no config.properties estava vazia.",
   "O método DriverFactory.getDriver() retornou null porque o método initDriver não foi invocado ou lançou uma exceção não tratada ao carregar o driver do navegador.",
   "O navegador não suporta o modo maximizado.",
   "O arquivo ExtentReport.html estava bloqueado para escrita."
  ],
  "answer": 1
 },
 {
  "n": 103,
  "level": "senior",
  "question": "Por que a dependência commons-io foi incluída explicitamente no pom.xml versão 2.16.1?",
  "explanation": "A biblioteca provê utilitários como FileUtils.copyFile(...) para manipular arquivos e imagens de evidência no disco.",
  "type": "choice",
  "options": [
   "Para manipular a leitura do arquivo config.properties.",
   "Para fornecer métodos utilitários de alta performance de manipulação de arquivos no sistema de arquivos do SO, como o FileUtils.copyFile utilizado no salvamento de imagens na classe Utils.java.",
   "Para conectar o Selenium com o GitHub Actions.",
   "Para enviar requisições HTTP REST durante os testes."
  ],
  "answer": 1
 },
 {
  "n": 104,
  "level": "senior",
  "question": "Qual é a ordem EXATA do ciclo de vida de execução de um único cenário no framework Central Automation?",
  "explanation": "O ciclo de vida do Cucumber executa os ganchos do @Before, em seguida os passos do cenário no Steps e finaliza no @After.",
  "type": "choice",
  "options": [
   "Steps -> @Before (Hooks) -> @After (Hooks) -> Runner",
   "@Before (Hooks) -> Passos do Cenário (Steps) -> @After (Hooks)",
   "@After (Hooks) -> Passos do Cenário (Steps) -> @Before (Hooks)"
  ],
  "answer": 1
 },
 {
  "n": 105,
  "level": "senior",
  "question": "Explique a relevância técnica da tag <modelVersion>4.0.0</modelVersion> na estrutura de um arquivo pom.xml.",
  "explanation": "A tag especifica a versão da estrutura declarativa do Project Object Model (POM) utilizada pelo Maven.",
  "type": "choice",
  "options": [
   "Define a versão do Java instalada na máquina.",
   "Define a versão da estrutura declarativa do modelo do POM do Maven, garantindo a interoperabilidade da ferramenta de build entre diferentes versões do Maven.",
   "Define a versão do Selenium.",
   "Indica que o projeto roda apenas em arquiteturas 64 bits."
  ],
  "answer": 1
 },
 {
  "n": 106,
  "level": "senior",
  "question": "No arquivo Central.feature, como os parâmetros declarados entre aspas no passo Então o sistema deve exibir o alerta \"Campos obrigatórios. Preencha todos os campos para continuar\" são capturados pelo Java?",
  "explanation": "O Cucumber captura o texto entre aspas utilizando a expressão {string} e repassa o valor obtido para o parâmetro do método anotado.",
  "type": "choice",
  "options": [
   "São lidos através de expressões regulares ou parâmetro do tipo {string} anotado no método @Então na classe Steps.java, sendo repassados como argumento String mensagemEsperada.",
   "São lidos do arquivo config.properties.",
   "Não são capturados, a frase é apenas decorativa no Gherkin.",
   "O Cucumber converte o texto para um número inteiro."
  ],
  "answer": 0
 },
 {
  "n": 107,
  "level": "senior",
  "question": "Qual o impacto de se omitir o fechamento de fluxos de entrada (input.close()) na classe ConfigReader.java após ler as propriedades do arquivo?",
  "explanation": "Omitir o encerramento da stream com input.close() retém a trava de arquivo na JVM até a atuação do Garbage Collector.",
  "type": "choice",
  "options": [
   "Vazamento de recursos (*resource leak*) na JVM, mantendo o arquivo preso pelo processo até que o Garbage Collector faça a coleta do objeto.",
   "Erro de compilação imediato no Maven.",
   "O arquivo config.properties é apagado.",
   "Os testes rodam mais rápido."
  ],
  "answer": 0
 },
 {
  "n": 108,
  "level": "senior",
  "question": "Discorra sobre como implementar o padrão Page Object Standard completo sobre a estrutura atual sem quebrar a compatibilidade com a camada de Steps existente.",
  "explanation": "riar classes dedicadas por página (ex: LoginPage.java), transferindo os seletores e interações para elas. Na camada de Steps, substituir as chamadas genéricas por chamadas aos métodos encapsulados destas páginas sem alterar a especificação Gherkin.",
  "type": "open"
 },
 {
  "n": 109,
  "level": "senior",
  "question": "No arquivo maven-test.yml, qual é a ação desempenhada pela chave distribution: 'temurin'?",
  "explanation": "A chave especifica que a distribuição do JDK utilizada no ambiente do runner do GitHub Actions será a Eclipse Temurin.",
  "type": "choice",
  "options": [
   "Define o sistema operacional da máquina virtual.",
   "Seleciona a distribuição OpenJDK mantida pela Eclipse Adoptium (Temurin) para ser baixada e configurada como JDK oficial do ambiente de execução na esteira do GitHub Actions.",
   "Define a marca do navegador headless.",
   "Formata os relatórios ExtentReports."
  ],
  "answer": 1
 },
 {
  "n": 110,
  "level": "senior",
  "question": "Como a classe DriverFactory lida com nomes de navegadores passados com letras maiúsculas ou minúsculas (ex: \"CHROME\", \"Chrome\", \"chrome\")?",
  "explanation": "A string passa pelo método .toLowerCase(), padronizando o texto em minúsculo antes de avaliar no switch.",
  "type": "choice",
  "options": [
   "Lança IllegalArgumentException.",
   "Aplica o método .toLowerCase() na string do parâmetro antes de avaliar as opções dentro da estrutura de decisão switch.",
   "Ignora o texto e abre o Firefox.",
   "O parâmetro é convertido para número inteiro."
  ],
  "answer": 1
 },
 {
  "n": 111,
  "level": "senior",
  "question": "Qual a diferença entre driver.close() e driver.quit() no Selenium WebDriver, e por que a classe DriverFactory utiliza o quit()?",
  "explanation": "close() encerra apenas a aba focada; quit() fecha todas as janelas e mata o processo do driver no sistema operacional.",
  "type": "choice",
  "options": [
   "close() fecha apenas a janela/aba atualmente ativa do navegador; quit() encerra toda a sessão do WebDriver, fecha todas as janelas abertas e mata o processo do driver no sistema operacional.",
   "close() encerra o processo do driver; quit() apenas minimiza a janela.",
   "Nenhuma diferença, ambos fazem a mesma coisa.",
   "quit() limpa apenas os cookies do navegador."
  ],
  "answer": 0
 },
 {
  "n": 112,
  "level": "senior",
  "question": "Se precisarmos adicionar suporte ao teste de uma aplicação móvel utilizando Appium mantendo a arquitetura atual do framework, quais classes precisariam sofrer alterações estruturais?",
  "explanation": "Exigiria alterações no pom.xml (inclusão do java-client Appium), no DriverFactory (gerenciamento de instâncias do AppiumDriver/AndroidDriver) e na DSL Metodos (suporte a gestos móbiles e contextos nativos/webview).",
  "type": "open"
 },
 {
  "n": 113,
  "level": "senior",
  "question": "Na classe Steps.java, a instância da classe Metodos é privada (private Metodos metodos = new Metodos();). Qual é a vantagem de manter o escopo dessa variável como privado na classe de passos?",
  "explanation": "O escopo privado preserva o encapsulamento da classe, impedindo a manipulação indevida do atributo por outras classes de steps.",
  "type": "choice",
  "options": [
   "Impedir que outras classes de steps acessem diretamente os métodos de ação daquela instância, garantindo o encapsulamento e evitando contaminação de estado entre os arquivos de cola.",
   "Permitir que o Cucumber leia as variáveis de forma mais rápida.",
   "Atender a uma exigência da anotação @RunWith.",
   "Evitar o download de drivers repetidos."
  ],
  "answer": 0
 },
 {
  "n": 114,
  "level": "senior",
  "question": "O que acontece se a expressão regular no XPath do seletor botaoEsqueciMinhaSenha na classe Elementos:\n//button[contains(text(), 'Esqueci minha senha')]\nencontrar dois ou mais botões idênticos com o mesmo texto na página HTML?",
  "explanation": "O Selenium retorna a primeira ocorrência compatível com o XPath encontrada na estrutura do DOM.",
  "type": "choice",
  "options": [
   "O Selenium clica em todos os botões simultaneamente.",
   "O Selenium retorna o primeiro elemento encontrado no DOM que satisfaz a condição da consulta XPath.",
   "O Selenium lança TooManyElementsFoundException.",
   "O teste é cancelado e entra em loop infinito."
  ],
  "answer": 1
 },
 {
  "n": 115,
  "level": "senior",
  "question": "Discorra sobre como tratar de forma elegante e resiliente cenários em que alertas nativos do JavaScript (alert(), confirm(), prompt()) aparecem de forma não determinística na tela durante a navegação.",
  "explanation": "riar métodos na DSL utilizando wait.until(ExpectedConditions.alertIsPresent()) antes de manipular a caixa de diálogo com .accept() ou .dismiss(), ou configurar a política de tratamento de alertas no ChromeOptions.",
  "type": "open"
 },
 {
  "n": 116,
  "level": "senior",
  "question": "Qual o objetivo prático de adicionar a flag monochrome = true no Runner.java quando os testes são executados dentro do ambiente da esteira CI/CD do GitHub Actions?",
  "explanation": "O parâmetro remove os códigos ANSI de cor, gerando um log de terminal sem caracteres de formatação incompatíveis no GitHub Actions.",
  "type": "choice",
  "options": [
   "Acelerar a execução dos cenários em 20%.",
   "Remover sequências de escape ANSI de cor do output do console, garantindo que o log do terminal do GitHub Actions fique limpo e sem caracteres de formatação estranhos (ex: [32m).",
   "Ocultar as falhas dos testes no log final.",
   "Converter os relatórios de saída para o idioma inglês."
  ],
  "answer": 1
 },
 {
  "n": 117,
  "level": "senior",
  "question": "Por que a constante senhaDinamica na classe Metodos.java foi definida como public static String enquanto outros atributos como driver e wait são privados de instância?",
  "explanation": "A variável é declarada como public static para permitir seu compartilhamento direto como massa de dados estática entre os passos da automação.",
  "type": "choice",
  "options": [
   "Foi um descuido dos desenvolvedores.",
   "Porque a senhaDinamica precisa ser reaproveitada globalmente pela camada de passos (Steps.java) no momento do login (metodos.escrever(Elementos.campoSenha, Metodos.senhaDinamica)), agindo como uma massa de dados compartilhada do cenário.",
   "Para permitir que o ConfigReader altere a senha em tempo de execução.",
   "Porque senhas não podem ser atributos privados em Java."
  ],
  "answer": 1
 },
 {
  "n": 118,
  "level": "senior",
  "question": "O que ocorre quando executamos o comando mvn clean test -Dbrowser=safari na máquina local rodando SO Windows?",
  "explanation": "Na ausência do tratamento da opção \"safari\" no switch, a execução cai no bloco default:, que inicializa o Chrome.",
  "type": "choice",
  "options": [
   "O Selenium baixa o Safari para Windows automaticamente e executa os testes.",
   "A estrutura switch da classe DriverFactory cai no bloco default:, e o teste inicia o navegador Google Chrome com as opções padrão.",
   "O projeto lança UnsupportedOperationException e cancela a compilação.",
   "O Windows abre o Microsoft Edge."
  ],
  "answer": 1
 },
 {
  "n": 119,
  "level": "senior",
  "question": "Analise a instrução de acoplamento da biblioteca de relatórios no ReportManager.java:\nExtentSparkReporter htmlReporter = new ExtentSparkReporter(\"target/ExtentReport.html\");\nQual é o papel específico do componente ExtentSparkReporter na arquitetura da biblioteca ExtentReports v5.x?",
  "explanation": "O ExtentSparkReporter é a classe visual da biblioteca ExtentReports encarregada de estruturar e estilizar o relatório HTML final.",
  "type": "choice",
  "options": [
   "Ele é o gerador físico do layout gráfico HTML responsivo em estilo \"Spark\", responsável por definir as configurações estéticas, arquivo de saída, codificação e tema do relatório.",
   "Ele é o banco de dados interno que salva os prints de tela.",
   "Ele é o driver que conecta o Java ao navegador.",
   "Ele é a classe que substitui os Hooks do Cucumber."
  ],
  "answer": 0
 },
 {
  "n": 120,
  "level": "senior",
  "question": "Apresente um plano completo de arquitetura para migrar este framework da versão do JUnit 4 para a versão moderna do JUnit 5 (Jupiter/Engine) e Cucumber 7+, citando quais dependências e anotações precisariam ser substituídas no pom.xml e na classe Runner.java.",
  "explanation": "1.  pom.xml: Substituir junit:junit por org.junit.jupiter:junit-jupiter e utilizar o plugin cucumber-junit-platform-engine.\n2.  Runner.java: Remover @RunWith(Cucumber.class) e utilizar as anotações do JUnit 5 @Suite e @SelectClasspathResource(\"features\") ou configurar o arquivo junit-platform.properties.",
  "type": "open"
 }
];
