import type { QuizQuestion } from "@/data/automation-course";

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface LessonExtras {
  /** Resumo rápido em 2-3 frases para revisão antes da prova. */
  summary: string;
  /** Pontos-chave que o aluno deve saber explicar. */
  keyPoints: string[];
  /** Erros comuns observados em turmas anteriores. */
  commonMistakes: string[];
  /** Boas práticas do projeto Central Automation. */
  bestPractices: string[];
  glossary: GlossaryTerm[];
  /** Prova final da aula — aprovação mínima de 65%. */
  exam: QuizQuestion[];
}

/** Nota mínima (%) para aprovação na prova final da aula. */
export const EXAM_PASS_SCORE = 75;

export const lessonExtras: Record<string, LessonExtras> = {
  "m1-a1": {
    summary:
      "Automação existe para devolver tempo ao time, não para substituir o teste exploratório. Ela rende em cenários repetitivos, estáveis e de alto risco de negócio; o maior custo é a manutenção dos scripts ao longo do tempo.",
    keyPoints: [
      "A pirâmide de automação concentra volume em testes unitários e reserva a interface para os fluxos críticos.",
      "Critérios de seleção: frequência de execução, estabilidade da tela, risco do fluxo e variação de massa de dados.",
      "ROI de automação aparece a partir da repetição: um script executado uma única vez raramente se paga.",
    ],
    commonMistakes: [
      "Automatizar telas em redesenho constante e criar uma suíte que quebra a cada sprint.",
      "Medir sucesso pela quantidade de scripts, e não pela redução de regressão manual.",
      "Tratar automação como projeto pontual, sem tempo reservado para manutenção.",
    ],
    bestPractices: [
      "Comece pelos fluxos que o time repete manualmente a cada release.",
      "Documente o objetivo de cada cenário automatizado no próprio nome do teste.",
      "Reserve capacidade fixa da sprint para manutenção da suíte.",
    ],
    glossary: [
      { term: "Pirâmide de automação", definition: "Modelo que distribui esforço entre testes unitários, de serviço e de interface." },
      { term: "Teste de regressão", definition: "Reexecução de cenários já validados para garantir que mudanças não quebraram o que funcionava." },
      { term: "Suíte frágil (flaky)", definition: "Conjunto de testes que falha de forma intermitente sem defeito real na aplicação." },
    ],
    exam: [
      {
        question: "Qual métrica indica melhor o retorno de uma suíte automatizada?",
        options: [
          "Quantidade total de scripts criados",
          "Redução do tempo de regressão manual por release",
          "Número de linhas de código do framework",
          "Quantidade de navegadores instalados",
        ],
        answer: 1,
        explanation: "O ganho real de automação é a redução de esforço repetitivo de regressão a cada entrega.",
      },
      {
        question: "Um fluxo que muda de layout toda sprint deve ser:",
        options: ["Automatizado primeiro", "Mantido em teste manual/exploratório até estabilizar", "Removido da suíte de testes", "Automatizado apenas em API"],
        answer: 1,
        explanation: "Telas instáveis geram alto custo de manutenção; automatize depois da estabilização.",
      },
      {
        question: "Na pirâmide de automação, os testes de interface devem ser:",
        options: ["A maior parte da suíte", "Poucos e focados nos fluxos críticos", "Substitutos dos testes unitários", "Executados apenas manualmente"],
        answer: 1,
        explanation: "A interface é a camada mais lenta e frágil; use-a com parcimônia nos fluxos de maior risco.",
      },
      {
        question: "O maior custo de longo prazo de um framework de automação é:",
        options: ["Licenciamento", "Manutenção dos scripts", "Infraestrutura de rede", "Treinamento de usuários finais"],
        answer: 1,
        explanation: "Scripts acompanham a evolução do produto e exigem manutenção contínua.",
      },
    ],
  },

  "m1-a2": {
    summary:
      "O ambiente local precisa de JDK instalado, JAVA_HOME apontando para a pasta do JDK e %JAVA_HOME%\\bin no PATH. Sem isso, Maven e Eclipse não localizam o compilador.",
    keyPoints: [
      "JAVA_HOME aponta para a raiz do JDK, nunca para a pasta bin.",
      "A validação do ambiente é feita com java -version, javac -version e mvn -v.",
      "O Eclipse usa o JDK configurado no workspace, que pode divergir do JDK do terminal.",
    ],
    commonMistakes: [
      "Configurar JAVA_HOME apontando para o JRE em vez do JDK (javac não é encontrado).",
      "Editar variáveis de usuário quando o time precisa de variáveis de máquina (setx /M).",
      "Não reabrir o terminal após alterar variáveis e concluir que a configuração falhou.",
    ],
    bestPractices: [
      "Padronize a mesma versão de JDK para todo o time e registre no README.",
      "Use setx /M em prompt de administrador para configuração permanente.",
      "Confirme o JDK do Eclipse em Window > Preferences > Java > Installed JREs.",
    ],
    glossary: [
      { term: "JDK", definition: "Kit de desenvolvimento Java, inclui compilador (javac) e a JVM." },
      { term: "JAVA_HOME", definition: "Variável de ambiente que ferramentas usam para localizar o JDK." },
      { term: "PATH", definition: "Lista de diretórios onde o sistema procura executáveis." },
    ],
    exam: [
      {
        question: "JAVA_HOME deve apontar para:",
        options: ["A pasta bin do JDK", "A raiz da instalação do JDK", "A pasta do Eclipse", "O diretório do repositório Maven"],
        answer: 1,
        explanation: "As ferramentas concatenam /bin internamente; JAVA_HOME é a raiz do JDK.",
      },
      {
        question: "Qual comando confirma que o compilador Java está disponível?",
        options: ["java -version", "javac -version", "mvn -v", "echo %PATH%"],
        answer: 1,
        explanation: "javac é o compilador e existe somente no JDK, não no JRE.",
      },
      {
        question: "Após rodar setx /M, o passo obrigatório é:",
        options: ["Reinstalar o JDK", "Abrir um novo terminal", "Limpar o repositório Maven", "Reiniciar o roteador"],
        answer: 1,
        explanation: "Variáveis novas só são lidas por processos iniciados após a alteração.",
      },
      {
        question: "O Eclipse compila com um JDK diferente do terminal. Onde ajustar?",
        options: ["No pom.xml apenas", "Em Installed JREs / Java Compiler do workspace", "No PATH do usuário", "No arquivo settings.xml"],
        answer: 1,
        explanation: "O Eclipse mantém sua própria configuração de JRE/compilador por workspace.",
      },
    ],
  },

  "m1-a3": {
    summary:
      "O pom.xml declara identidade do projeto (groupId, artifactId, version), a versão de compilação e as dependências de teste. Maven baixa tudo para o repositório local e disponibiliza no classpath.",
    keyPoints: [
      "Dependência traz bibliotecas; plugin executa etapas do build.",
      "As versões de Selenium, Cucumber e JUnit precisam ser compatíveis entre si.",
      "mvn clean test limpa o target e executa a suíte de testes.",
    ],
    commonMistakes: [
      "Misturar JUnit 4 (cucumber-junit) com JUnit 5 no mesmo runner.",
      "Declarar a dependência dentro do bloco de outra dependência (XML inválido).",
      "Esquecer maven.compiler.source/target e receber erro de versão de classe.",
    ],
    bestPractices: [
      "Centralize versões em <properties> para atualizar em um só lugar.",
      "Use scope test nas dependências que só existem na suíte.",
      "Rode mvn dependency:tree ao investigar conflitos de versão.",
    ],
    glossary: [
      { term: "groupId", definition: "Identificador da organização, no padrão de pacote invertido." },
      { term: "artifactId", definition: "Nome do artefato gerado pelo projeto." },
      { term: "Repositório local", definition: "Pasta ~/.m2 onde o Maven guarda as dependências baixadas." },
    ],
    exam: [
      {
        question: "A diferença entre dependency e plugin no Maven é:",
        options: [
          "Nenhuma, são sinônimos",
          "Dependency é biblioteca no classpath; plugin executa tarefas do build",
          "Plugin só funciona em produção",
          "Dependency é apenas para testes",
        ],
        answer: 1,
        explanation: "Dependências alimentam o classpath, plugins estendem o ciclo de vida do build.",
      },
      {
        question: "Qual comando limpa o build e executa os testes?",
        options: ["mvn install -DskipTests", "mvn clean test", "mvn validate", "mvn archetype:generate"],
        answer: 1,
        explanation: "clean apaga o target e test executa a fase de testes.",
      },
      {
        question: "Onde o Maven armazena as dependências baixadas?",
        options: ["Na pasta target", "No repositório local ~/.m2", "No diretório src", "No PATH do sistema"],
        answer: 1,
        explanation: "O cache local fica em ~/.m2/repository.",
      },
      {
        question: "Erro 'class file has wrong version' normalmente indica:",
        options: [
          "Falta de internet",
          "Divergência entre a versão do JDK e maven.compiler.source/target",
          "Falta de driver do navegador",
          "Feature file inválido",
        ],
        answer: 1,
        explanation: "A versão de bytecode configurada não corresponde ao JDK em uso.",
      },
    ],
  },

  "m2-a1": {
    summary:
      "O WebDriver traduz comandos do teste em requisições para o driver do navegador. O ciclo é abrir sessão, localizar elemento, agir, validar e encerrar a sessão liberando o processo.",
    keyPoints: [
      "WebDriverManager resolve o binário do driver compatível com o navegador instalado.",
      "driver.quit() encerra a sessão inteira; driver.close() fecha apenas a janela atual.",
      "Espera explícita (WebDriverWait) é preferível a Thread.sleep.",
    ],
    commonMistakes: [
      "Deixar processos de driver abertos por não chamar quit() no encerramento.",
      "Usar Thread.sleep fixo e tornar a suíte lenta e instável.",
      "Instanciar um novo driver por step em vez de reaproveitar o do hook.",
    ],
    bestPractices: [
      "Centralize a criação do driver em uma única classe de setup.",
      "Configure espera explícita por condição (visibilidade, clicabilidade).",
      "Maximize a janela para garantir a mesma resolução entre execuções.",
    ],
    glossary: [
      { term: "WebDriver", definition: "API que controla o navegador por meio de um driver nativo." },
      { term: "Espera explícita", definition: "Aguardo por uma condição específica com tempo limite." },
      { term: "Sessão", definition: "Instância do navegador controlada por um driver durante o teste." },
    ],
    exam: [
      {
        question: "Qual método encerra a sessão e todos os processos do driver?",
        options: ["driver.close()", "driver.quit()", "driver.stop()", "driver.dispose()"],
        answer: 1,
        explanation: "quit() finaliza a sessão completa; close() fecha somente a janela em foco.",
      },
      {
        question: "A vantagem da espera explícita sobre Thread.sleep é:",
        options: [
          "Sempre esperar o tempo máximo",
          "Prosseguir assim que a condição é satisfeita",
          "Não precisar de tempo limite",
          "Dispensar o localizador",
        ],
        answer: 1,
        explanation: "A espera explícita libera a execução tão logo a condição ocorra, reduzindo tempo total.",
      },
      {
        question: "Qual o papel do WebDriverManager?",
        options: [
          "Escrever os cenários em Gherkin",
          "Baixar e configurar o driver compatível com o navegador",
          "Gerar o relatório HTML",
          "Executar a suíte no pipeline",
        ],
        answer: 1,
        explanation: "Ele elimina a gestão manual dos binários de driver.",
      },
      {
        question: "Instanciar um driver por step causa:",
        options: ["Testes mais rápidos", "Perda de contexto e vazamento de processos", "Relatórios melhores", "Menos código"],
        answer: 1,
        explanation: "Cada instância abre um navegador novo, perdendo estado e consumindo recursos.",
      },
    ],
  },

  "m2-a2": {
    summary:
      "Localizadores mudam com frequência, por isso ficam centralizados na classe Elementos. Prefira id, depois seletores CSS estáveis, e use XPath relativo apenas quando necessário.",
    keyPoints: [
      "Ordem de preferência: id > name > CSS estável > XPath relativo.",
      "XPath absoluto quebra a qualquer mudança na árvore da página.",
      "Centralizar localizadores reduz o esforço de manutenção a um único arquivo.",
    ],
    commonMistakes: [
      "Copiar XPath absoluto do DevTools.",
      "Espalhar seletores dentro dos steps, duplicando manutenção.",
      "Depender de classes de estilo geradas dinamicamente.",
    ],
    bestPractices: [
      "Negocie com o time de desenvolvimento atributos data-testid estáveis.",
      "Nomeie a constante pela intenção do elemento, não pela aparência.",
      "Agrupe os localizadores por tela dentro de Elementos.",
    ],
    glossary: [
      { term: "Localizador", definition: "Estratégia usada para encontrar um elemento no DOM." },
      { term: "XPath relativo", definition: "Expressão que parte de um nó âncora, tolerante a mudanças de estrutura." },
      { term: "data-testid", definition: "Atributo dedicado a testes, imune a mudanças visuais." },
    ],
    exam: [
      {
        question: "Qual localizador é mais estável?",
        options: ["XPath absoluto", "id único do elemento", "Classe de estilo gerada pelo framework", "Posição do elemento na tela"],
        answer: 1,
        explanation: "O id costuma ser único e independente da estrutura visual.",
      },
      {
        question: "Centralizar localizadores em Elementos serve para:",
        options: ["Acelerar o navegador", "Reduzir o custo de manutenção quando a tela muda", "Substituir os steps", "Gerar relatórios"],
        answer: 1,
        explanation: "A mudança passa a ser feita em um único ponto.",
      },
      {
        question: "Por que evitar XPath absoluto?",
        options: [
          "É mais lento de escrever",
          "Depende de toda a hierarquia e quebra facilmente",
          "Não funciona no Chrome",
          "Não aceita atributos",
        ],
        answer: 1,
        explanation: "Qualquer nó inserido no caminho invalida a expressão.",
      },
      {
        question: "O time usa classes CSS geradas dinamicamente. A melhor ação é:",
        options: [
          "Usar índice de posição",
          "Solicitar atributos data-testid estáveis",
          "Usar XPath absoluto",
          "Aumentar o tempo de espera",
        ],
        answer: 1,
        explanation: "Atributos dedicados a teste tornam os localizadores previsíveis.",
      },
    ],
  },

  "m2-a3": {
    summary:
      "A classe Metodos concentra ações utilitárias (clicar, escrever, validar texto, esperar) para que os steps fiquem legíveis e o tratamento de espera e erro seja padronizado.",
    keyPoints: [
      "Cada método utilitário deve fazer uma ação e ter nome de intenção.",
      "Espera e tratamento de exceção ficam dentro do utilitário, não no step.",
      "Reuso de utilitários reduz duplicação entre cenários.",
    ],
    commonMistakes: [
      "Colocar asserção de negócio dentro do utilitário genérico.",
      "Criar métodos com muitos parâmetros e responsabilidades misturadas.",
      "Repetir findElement em cada step em vez de usar o utilitário.",
    ],
    bestPractices: [
      "Padronize retorno e mensagens de erro dos utilitários.",
      "Use nomes como clicar, escrever, validarTexto, aguardarVisivel.",
      "Cubra os utilitários com um cenário de fumaça antes de escalar a suíte.",
    ],
    glossary: [
      { term: "Método utilitário", definition: "Função reutilizável que encapsula uma interação com a página." },
      { term: "Asserção", definition: "Verificação que determina se o teste passa ou falha." },
      { term: "Page Object", definition: "Padrão que representa uma tela como classe com seus elementos e ações." },
    ],
    exam: [
      {
        question: "A responsabilidade da classe Metodos é:",
        options: [
          "Descrever o cenário de negócio",
          "Encapsular ações reutilizáveis na página com espera padronizada",
          "Gerar o relatório final",
          "Configurar o pipeline",
        ],
        answer: 1,
        explanation: "Ela isola a mecânica de interação para os steps ficarem declarativos.",
      },
      {
        question: "Onde a asserção de regra de negócio deve ficar?",
        options: ["No utilitário genérico", "No step do cenário", "No hook", "No pom.xml"],
        answer: 1,
        explanation: "O utilitário é genérico; a regra pertence ao step que representa o negócio.",
      },
      {
        question: "Um método utilitário ideal tem:",
        options: ["Muitas responsabilidades", "Uma responsabilidade e nome de intenção", "Nome curto e genérico", "Somente parâmetros opcionais"],
        answer: 1,
        explanation: "Responsabilidade única facilita reuso e manutenção.",
      },
      {
        question: "Repetir findElement em todos os steps causa:",
        options: ["Melhor performance", "Duplicação e manutenção espalhada", "Relatórios mais claros", "Menos flakiness"],
        answer: 1,
        explanation: "Toda mudança precisaria ser replicada em vários pontos.",
      },
    ],
  },

  "m3-a1": {
    summary:
      "Gherkin descreve comportamento em linguagem de negócio: Dado (contexto), Quando (ação) e Então (resultado esperado). O arquivo .feature vive em src/test/resources/features.",
    keyPoints: [
      "Um cenário deve validar um comportamento, não um roteiro inteiro de cliques.",
      "Esquema do Cenário (Scenario Outline) com Exemplos evita cenários duplicados.",
      "Tags organizam a execução (@smoke, @regressao).",
    ],
    commonMistakes: [
      "Escrever passos técnicos com seletores dentro do Gherkin.",
      "Criar cenários longos que testam vários comportamentos ao mesmo tempo.",
      "Duplicar cenários que só variam a massa de dados.",
    ],
    bestPractices: [
      "Escreva os passos na linguagem do usuário do sistema.",
      "Use Contexto (Background) para pré-condições comuns.",
      "Mantenha o feature file revisado junto com o time de negócio.",
    ],
    glossary: [
      { term: "Gherkin", definition: "Linguagem estruturada para descrever comportamento em cenários." },
      { term: "Scenario Outline", definition: "Cenário parametrizado executado para cada linha de exemplos." },
      { term: "Tag", definition: "Marcador usado para filtrar quais cenários executar." },
    ],
    exam: [
      {
        question: "O passo 'Quando' representa:",
        options: ["A pré-condição", "A ação executada pelo usuário", "O resultado esperado", "A configuração do driver"],
        answer: 1,
        explanation: "Dado é contexto, Quando é ação e Então é resultado.",
      },
      {
        question: "Para testar o mesmo fluxo com várias massas de dados use:",
        options: ["Vários cenários copiados", "Esquema do Cenário com Exemplos", "Um hook adicional", "Um novo runner"],
        answer: 1,
        explanation: "O Scenario Outline parametriza a execução por linha de exemplo.",
      },
      {
        question: "Seletores CSS dentro do arquivo .feature são:",
        options: ["Recomendados para clareza", "Um erro: detalhe técnico não pertence ao Gherkin", "Obrigatórios no Cucumber", "Necessários para tags"],
        answer: 1,
        explanation: "O Gherkin descreve comportamento em linguagem de negócio.",
      },
      {
        question: "Tags no Cucumber servem para:",
        options: ["Documentar autores", "Filtrar quais cenários serão executados", "Definir esperas", "Gerar screenshots"],
        answer: 1,
        explanation: "O runner seleciona cenários por tag, como @smoke.",
      },
    ],
  },

  "m3-a2": {
    summary:
      "Hooks controlam o ciclo de vida do cenário: @Before abre o driver e prepara o relatório, @After encerra a sessão e registra evidência da falha.",
    keyPoints: [
      "@Before e @After executam por cenário, não por suíte.",
      "O objeto Scenario informa se o cenário falhou, permitindo anexar evidência.",
      "Encerrar o driver no @After evita processos órfãos.",
    ],
    commonMistakes: [
      "Abrir o navegador dentro dos steps e perder controle do ciclo de vida.",
      "Não tratar exceção no @After, mascarando a falha real do cenário.",
      "Compartilhar estado estático entre cenários e gerar interferência.",
    ],
    bestPractices: [
      "Use hooks com ordem definida quando houver dependências.",
      "Anexe screenshot ao relatório apenas em cenários falhos.",
      "Isole o estado por cenário para permitir execução paralela futura.",
    ],
    glossary: [
      { term: "Hook", definition: "Método executado antes ou depois de cada cenário." },
      { term: "Scenario", definition: "Objeto do Cucumber com metadados e status do cenário em execução." },
      { term: "Processo órfão", definition: "Driver que continua ativo após o teste por falta de encerramento." },
    ],
    exam: [
      {
        question: "@Before no Cucumber executa:",
        options: ["Uma vez por suíte", "Antes de cada cenário", "Antes de cada step", "Somente em falha"],
        answer: 1,
        explanation: "Os hooks do Cucumber têm escopo de cenário.",
      },
      {
        question: "Para capturar evidência somente em falha, verifique:",
        options: ["scenario.getName()", "scenario.isFailed()", "driver.getTitle()", "scenario.getId()"],
        answer: 1,
        explanation: "isFailed() indica que o cenário terminou com falha.",
      },
      {
        question: "Não encerrar o driver no @After resulta em:",
        options: ["Relatório incompleto", "Processos de navegador acumulados na máquina", "Erro de compilação", "Perda das tags"],
        answer: 1,
        explanation: "Sem quit(), cada execução deixa um processo ativo.",
      },
      {
        question: "Estado estático compartilhado entre cenários provoca:",
        options: ["Execução mais rápida e segura", "Interferência entre cenários e falhas intermitentes", "Melhor isolamento", "Relatórios detalhados"],
        answer: 1,
        explanation: "Cenários passam a depender da ordem de execução.",
      },
    ],
  },

  "m3-a3": {
    summary:
      "Steps ligam cada passo do Gherkin a um método Java; o Runner JUnit aponta features, glue e plugins e é o ponto de entrada da execução por Maven.",
    keyPoints: [
      "A expressão do step deve corresponder exatamente ao texto do Gherkin.",
      "glue indica o pacote onde o Cucumber procura steps e hooks.",
      "O Runner permite filtrar por tags e definir plugins de relatório.",
    ],
    commonMistakes: [
      "Step duplicado (DuplicateStepDefinitionException) por expressões equivalentes.",
      "Configurar glue apontando para pacote errado e receber step undefined.",
      "Colocar lógica de negócio complexa dentro do step em vez de delegar.",
    ],
    bestPractices: [
      "Use Cucumber Expressions com parâmetros tipados ({string}, {int}).",
      "Mantenha steps curtos, delegando ações para Metodos.",
      "Separe runners por objetivo (smoke, regressão) quando a suíte crescer.",
    ],
    glossary: [
      { term: "Glue", definition: "Pacote onde ficam as definições de step e hooks." },
      { term: "Step undefined", definition: "Passo do Gherkin sem método correspondente encontrado." },
      { term: "Runner", definition: "Classe JUnit que dispara a execução dos cenários Cucumber." },
    ],
    exam: [
      {
        question: "Step 'undefined' normalmente indica:",
        options: ["Driver desatualizado", "glue apontando para o pacote errado ou expressão divergente", "Falta de internet", "Relatório não gerado"],
        answer: 1,
        explanation: "O Cucumber não encontrou o método correspondente no pacote configurado.",
      },
      {
        question: "A propriedade glue do Runner define:",
        options: ["A pasta dos features", "O pacote das definições de step e hooks", "O formato do relatório", "O navegador utilizado"],
        answer: 1,
        explanation: "features aponta os .feature; glue aponta o código Java.",
      },
      {
        question: "Duas expressões equivalentes para o mesmo passo geram:",
        options: ["Execução duplicada silenciosa", "DuplicateStepDefinitionException", "Step pendente", "Erro de rede"],
        answer: 1,
        explanation: "O Cucumber recusa ambiguidade entre definições de step.",
      },
      {
        question: "A melhor prática dentro do step é:",
        options: ["Concentrar todas as interações e esperas", "Delegar as ações para utilitários e manter o step declarativo", "Instanciar o driver", "Gerar o relatório"],
        answer: 1,
        explanation: "O step traduz o negócio; a mecânica fica nos utilitários.",
      },
    ],
  },

  "m4-a1": {
    summary:
      "ExtentReports transforma a execução em relatório navegável. O ReportManager centraliza a criação do relatório, dos testes e a gravação do arquivo final.",
    keyPoints: [
      "O relatório é escrito em disco na finalização (flush).",
      "Cada cenário deve gerar uma entrada com status e evidência.",
      "Relatório versionado por data/hora evita sobrescrita entre execuções.",
    ],
    commonMistakes: [
      "Esquecer o flush e obter um relatório vazio.",
      "Criar uma instância de relatório por cenário.",
      "Gravar sempre no mesmo arquivo e perder o histórico.",
    ],
    bestPractices: [
      "Use singleton para o ExtentReports e um ExtentTest por cenário.",
      "Inclua ambiente, navegador e versão no cabeçalho do relatório.",
      "Publique o relatório como artefato no pipeline.",
    ],
    glossary: [
      { term: "ExtentReports", definition: "Biblioteca de relatórios HTML para suítes de teste Java." },
      { term: "flush", definition: "Operação que grava em disco o conteúdo acumulado do relatório." },
      { term: "Artefato", definition: "Arquivo resultante do build publicado pelo pipeline." },
    ],
    exam: [
      {
        question: "Relatório do ExtentReports vazio geralmente significa:",
        options: ["Cenários sem tag", "Falta da chamada de flush", "Driver desatualizado", "glue incorreto"],
        answer: 1,
        explanation: "Sem flush o conteúdo não é gravado no arquivo HTML.",
      },
      {
        question: "O padrão recomendado para o ExtentReports é:",
        options: ["Uma instância por step", "Uma instância única (singleton) com um teste por cenário", "Uma instância por navegador", "Nenhuma instância explícita"],
        answer: 1,
        explanation: "Isso mantém o relatório consolidado e organizado por cenário.",
      },
      {
        question: "Gravar o relatório sempre com o mesmo nome causa:",
        options: ["Melhor performance", "Perda do histórico de execuções", "Erro de compilação", "Falha no driver"],
        answer: 1,
        explanation: "Cada execução sobrescreve a anterior.",
      },
      {
        question: "Informação útil no cabeçalho do relatório:",
        options: ["Senha do ambiente", "Navegador, ambiente e versão da aplicação", "Caminho absoluto do JDK", "Token de acesso"],
        answer: 1,
        explanation: "Contexto de execução ajuda a interpretar as falhas — nunca inclua credenciais.",
      },
    ],
  },

  "m4-a2": {
    summary:
      "Screenshots automáticos em falha transformam o relatório em evidência real. A captura é feita no @After quando o cenário falha e o arquivo é anexado ao relatório.",
    keyPoints: [
      "TakesScreenshot captura a tela do driver em bytes ou arquivo.",
      "Commons-IO ajuda a copiar o arquivo para a pasta de evidências.",
      "Nome do arquivo deve conter cenário e timestamp.",
    ],
    commonMistakes: [
      "Capturar screenshot após encerrar o driver.",
      "Salvar evidência em caminho absoluto que só existe na máquina local.",
      "Capturar em todos os cenários e inflar o repositório.",
    ],
    bestPractices: [
      "Capture apenas em falha e anexe ao relatório.",
      "Use caminho relativo dentro de target/evidencias.",
      "Limpe evidências antigas no clean do build.",
    ],
    glossary: [
      { term: "TakesScreenshot", definition: "Interface do Selenium que captura a imagem da página." },
      { term: "Evidência", definition: "Artefato que comprova o resultado observado no teste." },
      { term: "Timestamp", definition: "Marcação de data e hora usada para nomear arquivos." },
    ],
    exam: [
      {
        question: "A captura de tela em falha deve ocorrer:",
        options: ["Depois de driver.quit()", "No @After, antes de encerrar o driver", "No pom.xml", "No feature file"],
        answer: 1,
        explanation: "Sem sessão ativa não é possível capturar a tela.",
      },
      {
        question: "Qual interface do Selenium captura a tela?",
        options: ["ScreenRecorder", "TakesScreenshot", "ReportManager", "WebDriverWait"],
        answer: 1,
        explanation: "TakesScreenshot expõe getScreenshotAs().",
      },
      {
        question: "Salvar evidência com caminho absoluto local prejudica:",
        options: ["A leitura do relatório", "A execução em outra máquina ou no pipeline", "O tempo de execução", "O uso de tags"],
        answer: 1,
        explanation: "Caminhos absolutos não existem no agente de CI.",
      },
      {
        question: "Boa prática de nomenclatura de evidência:",
        options: ["Sempre screenshot.png", "Nome do cenário + timestamp", "Número aleatório", "Nome do desenvolvedor"],
        answer: 1,
        explanation: "Garante rastreabilidade e evita sobrescrita.",
      },
    ],
  },

  "m5-a1": {
    summary:
      "Flaky test é o teste que falha de forma intermitente sem defeito real. As causas mais comuns são sincronização, dados compartilhados e dependência de ordem de execução.",
    keyPoints: [
      "Troque esperas fixas por esperas explícitas por condição.",
      "Cada cenário deve criar e limpar sua própria massa de dados.",
      "Retry mascara o problema: use como medida temporária e investigue a causa.",
    ],
    commonMistakes: [
      "Aumentar Thread.sleep até o teste passar.",
      "Reaproveitar o mesmo usuário de teste em cenários concorrentes.",
      "Ignorar falha intermitente por 'ser da máquina'.",
    ],
    bestPractices: [
      "Meça a taxa de falha por cenário e ataque os mais instáveis primeiro.",
      "Isole dados por execução (e-mail/CPF gerados dinamicamente).",
      "Registre no relatório o motivo da instabilidade encontrada.",
    ],
    glossary: [
      { term: "Flaky test", definition: "Teste com resultado inconsistente entre execuções idênticas." },
      { term: "Condição de corrida", definition: "Falha causada por ordem inesperada entre eventos assíncronos." },
      { term: "Retry", definition: "Reexecução automática de um teste que falhou." },
    ],
    exam: [
      {
        question: "A causa mais comum de flakiness em testes web é:",
        options: ["Versão do JDK", "Sincronização inadequada com a página", "Nome do cenário", "Tamanho do relatório"],
        answer: 1,
        explanation: "Elementos que ainda não estão prontos geram falhas intermitentes.",
      },
      {
        question: "Aumentar Thread.sleep para estabilizar um teste:",
        options: ["Resolve a causa raiz", "Esconde o problema e aumenta o tempo da suíte", "Melhora o relatório", "Isola os dados"],
        answer: 1,
        explanation: "É paliativo; a solução é espera explícita por condição.",
      },
      {
        question: "Cenários que dependem do mesmo registro no banco devem:",
        options: ["Rodar sempre em ordem fixa", "Gerar massa própria e limpar ao final", "Compartilhar o usuário admin", "Ser removidos da suíte"],
        answer: 1,
        explanation: "Isolamento de dados elimina interferência entre cenários.",
      },
      {
        question: "Retry automático deve ser usado:",
        options: [
          "Como solução definitiva",
          "Como medida temporária enquanto a causa é investigada",
          "Em todos os cenários por padrão",
          "Somente em produção",
        ],
        answer: 1,
        explanation: "Retry esconde sintomas; a instabilidade precisa ser corrigida.",
      },
    ],
  },

  "m5-a2": {
    summary:
      "No pipeline a suíte roda sem interface gráfica, em modo headless, disparada por mvn clean test. Relatórios e evidências são publicados como artefatos do build.",
    keyPoints: [
      "Headless reduz consumo e viabiliza execução em agentes sem display.",
      "Configurações sensíveis vêm de variáveis de ambiente/segredos do CI.",
      "O build deve falhar quando a suíte falha, sinalizando o time.",
    ],
    commonMistakes: [
      "Fixar URL e credenciais no código.",
      "Depender de resolução de tela da máquina local.",
      "Ignorar o resultado da suíte e liberar o deploy mesmo com falha.",
    ],
    bestPractices: [
      "Parametrize ambiente com -Dparametro no Maven.",
      "Defina window-size explícito no modo headless.",
      "Publique relatório e evidências como artefato de cada execução.",
    ],
    glossary: [
      { term: "Headless", definition: "Execução do navegador sem renderizar interface gráfica." },
      { term: "Pipeline", definition: "Esteira automatizada de build, teste e entrega." },
      { term: "Segredo de CI", definition: "Credencial armazenada de forma protegida no servidor de integração." },
    ],
    exam: [
      {
        question: "Modo headless é indicado no pipeline porque:",
        options: ["Deixa o teste mais lento", "Executa sem display, consumindo menos recursos", "Elimina a necessidade de espera", "Gera relatórios automáticos"],
        answer: 1,
        explanation: "Agentes de CI normalmente não têm interface gráfica.",
      },
      {
        question: "Credenciais de ambiente devem ficar:",
        options: ["No código-fonte", "Em variáveis de ambiente ou segredos do CI", "No feature file", "No nome do cenário"],
        answer: 1,
        explanation: "Segredos não podem ser versionados no repositório.",
      },
      {
        question: "No headless é importante definir window-size porque:",
        options: ["Reduz o log", "Elementos responsivos podem não ficar visíveis na resolução padrão", "Acelera o Maven", "Evita flush do relatório"],
        answer: 1,
        explanation: "Sem tamanho definido o layout pode esconder elementos.",
      },
      {
        question: "Se a suíte falha, o build deve:",
        options: ["Continuar e liberar o deploy", "Falhar e bloquear a promoção da versão", "Ignorar os cenários falhos", "Reexecutar indefinidamente"],
        answer: 1,
        explanation: "O pipeline precisa refletir o risco encontrado pelos testes.",
      },
    ],
  },

  "m6-a1": {
    summary:
      "Cenários negativos protegem regras de negócio. No login inválido, valida-se a mensagem de erro, a permanência na tela e a ausência de sessão criada.",
    keyPoints: [
      "Valide a mensagem exibida e o estado da aplicação, não apenas a ausência de redirecionamento.",
      "Massa inválida deve ser explícita nos exemplos do cenário.",
      "Cenários negativos também precisam de evidência em falha.",
    ],
    commonMistakes: [
      "Considerar sucesso apenas porque a URL não mudou.",
      "Usar credenciais reais de produção no cenário negativo.",
      "Aceitar qualquer mensagem de erro sem verificar o texto esperado.",
    ],
    bestPractices: [
      "Parametrize combinações inválidas com Esquema do Cenário.",
      "Verifique também que nenhum token/sessão foi criado.",
      "Descreva o resultado esperado na linguagem do usuário.",
    ],
    glossary: [
      { term: "Cenário negativo", definition: "Teste que valida o comportamento diante de entrada inválida." },
      { term: "Massa de teste", definition: "Conjunto de dados usado para executar o cenário." },
      { term: "Estado da aplicação", definition: "Situação observável do sistema após a ação executada." },
    ],
    exam: [
      {
        question: "No cenário de login inválido, a validação mais completa inclui:",
        options: [
          "Apenas a URL inalterada",
          "Mensagem de erro esperada e ausência de sessão autenticada",
          "Somente o tempo de resposta",
          "Somente o screenshot",
        ],
        answer: 1,
        explanation: "É preciso validar mensagem e estado, provando que o acesso foi negado.",
      },
      {
        question: "Combinações inválidas de credenciais devem ser cobertas com:",
        options: ["Vários cenários copiados", "Esquema do Cenário com Exemplos", "Novo runner por combinação", "Hooks adicionais"],
        answer: 1,
        explanation: "A parametrização evita duplicação e facilita manutenção.",
      },
      {
        question: "Usar credenciais reais de produção no teste é:",
        options: ["Recomendado por realismo", "Risco de segurança — use massa dedicada de teste", "Necessário para o relatório", "Exigido pelo Cucumber"],
        answer: 1,
        explanation: "Testes usam ambientes e dados dedicados, nunca segredos de produção.",
      },
      {
        question: "Aceitar qualquer mensagem de erro no assert:",
        options: ["Aumenta a cobertura", "Enfraquece o teste, que passa mesmo com mensagem errada", "Reduz flakiness", "Melhora a evidência"],
        answer: 1,
        explanation: "A asserção precisa comparar com o texto esperado.",
      },
    ],
  },

  "m6-a2": {
    summary:
      "A entrega final valida a suíte completa: execução verde por mvn clean test, relatório com evidências, README de execução e código organizado em camadas.",
    keyPoints: [
      "A suíte deve rodar em máquina limpa apenas com JDK e Maven.",
      "README explica como executar, parametrizar ambiente e ler o relatório.",
      "Organização em camadas (elementos, metodos, hooks, steps, runner, utils).",
    ],
    commonMistakes: [
      "Entregar com testes ignorados ou comentados.",
      "Deixar caminhos e credenciais locais no código.",
      "Não versionar o feature file junto com os steps correspondentes.",
    ],
    bestPractices: [
      "Rode a suíte do zero antes de entregar (clean + test).",
      "Inclua no README a versão de JDK, Maven e navegador usada.",
      "Anexe o relatório da última execução verde como evidência de entrega.",
    ],
    glossary: [
      { term: "Suíte", definition: "Conjunto de cenários executados em uma mesma rodada." },
      { term: "README", definition: "Documento com instruções de instalação e execução do projeto." },
      { term: "Execução verde", definition: "Rodada em que todos os cenários passaram." },
    ],
    exam: [
      {
        question: "Critério essencial de entrega da suíte:",
        options: [
          "Ter mais de 100 cenários",
          "Executar do zero com mvn clean test em máquina limpa",
          "Usar somente XPath",
          "Ter relatório em PDF",
        ],
        answer: 1,
        explanation: "Reprodutibilidade é o critério central da entrega.",
      },
      {
        question: "Testes comentados na entrega indicam:",
        options: ["Boa organização", "Cobertura não comprovada e risco escondido", "Otimização de tempo", "Isolamento de dados"],
        answer: 1,
        explanation: "Cenário desativado não valida nada e mascara falhas.",
      },
      {
        question: "O README do projeto deve conter:",
        options: ["Senhas do ambiente", "Versões de JDK/Maven/navegador e passos de execução", "Somente o nome do autor", "Lista de defeitos abertos"],
        answer: 1,
        explanation: "Instruções e versões garantem que outra pessoa reproduza a execução.",
      },
      {
        question: "A separação em camadas do Central Automation serve para:",
        options: ["Aumentar o número de arquivos", "Isolar responsabilidades e facilitar manutenção", "Acelerar o navegador", "Dispensar hooks"],
        answer: 1,
        explanation: "Cada camada tem um motivo único para mudar.",
      },
    ],
  },
};

export function getLessonExtras(lessonId: string): LessonExtras | undefined {
  return lessonExtras[lessonId];
}
