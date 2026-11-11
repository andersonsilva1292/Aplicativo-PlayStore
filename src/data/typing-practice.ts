/** Códigos-modelo para o simulador de digitação (Modo Acompanhamento de Aula). */
export interface TypingSnippet { id: string; topic: string; title: string; code: string }

export const TYPING_TOPICS = ["Sintaxe Básica", "Laços de Repetição", "Classes e Objetos", "Automação/Selenium"] as const;

export const TYPING_SNIPPETS: TypingSnippet[] = [
  {
    id: "ola-mundo", topic: "Sintaxe Básica", title: "Olá, mundo",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Olá, mundo!");
    }
}`,
  },
  {
    id: "variaveis", topic: "Sintaxe Básica", title: "Variáveis e tipos",
    code: `public class Main {
    public static void main(String[] args) {
        int idade = 30;
        double nota = 8.5;
        String nome = "Ana";
        boolean aprovado = nota >= 7;
        System.out.println(nome + " tem " + idade + " anos");
        System.out.println("Aprovado: " + aprovado);
    }
}`,
  },
  {
    id: "for", topic: "Laços de Repetição", title: "Laço for",
    code: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            System.out.println("Linha " + i);
        }
    }
}`,
  },
  {
    id: "while", topic: "Laços de Repetição", title: "Laço while com array",
    code: `public class Main {
    public static void main(String[] args) {
        String[] frutas = {"maçã", "uva", "pera"};
        int i = 0;
        while (i < frutas.length) {
            System.out.println(frutas[i]);
            i++;
        }
    }
}`,
  },
  {
    id: "classe", topic: "Classes e Objetos", title: "Classe com construtor",
    code: `public class Aluno {
    private String nome;
    private double nota;

    public Aluno(String nome, double nota) {
        this.nome = nome;
        this.nota = nota;
    }

    public String getNome() {
        return nome;
    }

    public boolean isAprovado() {
        return nota >= 7;
    }
}`,
  },
  {
    id: "selenium-login", topic: "Automação/Selenium", title: "Teste de login com Selenium",
    code: `import org.junit.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;

public class LoginTest {
    private WebDriver driver;

    @Before
    public void setUp() {
        driver = new ChromeDriver();
        driver.get("https://central.automation/login");
    }

    @Test
    public void deveFazerLogin() {
        driver.findElement(By.id("usuario")).sendKeys("qa");
        driver.findElement(By.id("senha")).sendKeys("123");
        driver.findElement(By.id("entrar")).click();
        Assert.assertTrue(driver.getTitle().contains("Painel"));
    }

    @After
    public void tearDown() {
        driver.quit();
    }
}`,
  },
  {
    id: "runner-junit5", topic: "Automação/Selenium", title: "Runner Cucumber 7.20 + JUnit 5",
    code: `import org.junit.platform.suite.api.*;
import static io.cucumber.junit.platform.engine.Constants.*;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "steps")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty")
public class RunnerTest {
}`,
  },
];
