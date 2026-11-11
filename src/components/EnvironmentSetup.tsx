import { useState } from "react";
import { Check, Copy, Download, ExternalLink, Terminal, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import jdkAsset from "@/assets/jdk.asset.json";
import eclipseAsset from "@/assets/eclipse.asset.json";
import mavenAsset from "@/assets/maven.asset.json";

const TOOLS = [
  {
    name: "Java JDK 26",
    hint: "Instalador Windows x64 (.msi)",
    url: "https://www.oracle.com/br/java/technologies/downloads/",
    file: jdkAsset.url,
    fileName: "jdk-26_windows-x64_bin.msi",
  },
  {
    name: "Eclipse IDE (JRE win64)",
    hint: "Instalador Eclipse para Windows 64 bits (.exe)",
    url: "https://eclipseide.org/",
    file: eclipseAsset.url,
    fileName: "eclipse-inst-jre-win64.exe",
  },
  {
    name: "Apache Maven 4.0.0-rc-6",
    hint: "Binário do Apache Maven (.tar.gz)",
    url: "https://maven.apache.org/download.cgi",
    file: mavenAsset.url,
    fileName: "apache-maven-4.0.0-rc-6-bin.tar.gz",
  },
];


const CMD_STEPS = `:: 1) Defina a variável JAVA_HOME (ajuste o caminho para a sua versão do JDK)
setx /M JAVA_HOME "C:\\Program Files\\Java\\jdk-21"

:: 2) Adicione a pasta bin ao PATH do sistema
setx /M PATH "%PATH%;%JAVA_HOME%\\bin"

:: 3) Feche o CMD, abra uma nova janela e verifique
java -version
echo %JAVA_HOME%`;

const POM = `<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.automation</groupId>
    <artifactId>central-automation</artifactId>
    <version>1.0.0</version>
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <!-- Selenium Java -->
        <dependency>
            <groupId>org.seleniumhq.selenium</groupId>
            <artifactId>selenium-java</artifactId>
            <version>4.27.0</version>
        </dependency>
        <!-- Cucumber Java -->
        <dependency>
            <groupId>io.cucumber</groupId>
            <artifactId>cucumber-java</artifactId>
            <version>7.20.0</version>
        </dependency>
        <!-- Cucumber JUnit Platform Engine -->
        <dependency>
            <groupId>io.cucumber</groupId>
            <artifactId>cucumber-junit-platform-engine</artifactId>
            <version>7.20.0</version>
            <scope>test</scope>
        </dependency>
        <!-- JUnit 5 Platform Suite -->
        <dependency>
            <groupId>org.junit.platform</groupId>
            <artifactId>junit-platform-suite</artifactId>
            <version>1.11.3</version>
            <scope>test</scope>
        </dependency>
        <!-- ExtentReports -->
        <dependency>
            <groupId>com.aventstack</groupId>
            <artifactId>extentreports</artifactId>
            <version>5.1.2</version>
        </dependency>
        <!-- Commons IO -->
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.18.0</version>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.5.2</version>
            </plugin>
        </plugins>
    </build>
</project>`;

function CodeBlock({ label, code, fileName }: { label: string; code: string; fileName: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const save = () => {
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm font-medium text-foreground flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" /> {label}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Button size="sm" variant="secondary" onClick={save}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> {fileName}
          </Button>
        </div>
      </div>
      <pre className="rounded-xl bg-black/50 border border-white/10 p-3.5 overflow-x-auto text-[11.5px] leading-relaxed text-foreground/85">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Downloads oficiais e configuração do ambiente local do Central Automation. */
export default function EnvironmentSetup() {
  const { t } = useLanguage();
  return (
    <section className="glass-card card-modern rounded-2xl p-4 sm:p-5 space-y-5">
      <header className="space-y-1">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Wrench className="h-4.5 w-4.5 text-primary shrink-0" /> {t("env.title")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("env.subtitle")}
        </p>
      </header>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <li key={tool.name} className="rounded-xl border border-border/40 p-3 flex flex-col gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{tool.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{tool.hint}</p>
            </div>
            <Button asChild size="sm" className="mt-auto">
              <a href={tool.file} download={tool.fileName}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> {t("env.download")}
              </a>
            </Button>
            <Button asChild size="sm" variant="ghost" className="text-[11px] h-7">
              <a href={tool.url} target="_blank" rel="noopener noreferrer">
                {t("env.official")}
                <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
              </a>
            </Button>
          </li>
        ))}
      </ul>


      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("env.method")}</p>
        <p className="text-xs text-muted-foreground">
          Abra o <strong>CMD como Administrador</strong> e execute os comandos abaixo. A opção <code>/M</code> aplica a
          alteração no nível de Sistema, afetando todos os usuários.
        </p>
        <CodeBlock label="Variáveis de ambiente (CMD)" code={CMD_STEPS} fileName="configurar-java.cmd" />
      </div>

      <CodeBlock label="Dependências Maven do Central Automation" code={POM} fileName="pom.xml" />
    </section>
  );
}
