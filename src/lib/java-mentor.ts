/** Mentor técnico: análise estática (regex) de boas práticas de automação Java/Selenium. */
export type MentorSeverity = "critico" | "atencao" | "dica";
export interface MentorTip {
  id: string;
  severity: MentorSeverity;
  line: number;
  title: string;
  why: string;
  fix: string;
}
export interface MentorReport {
  tips: MentorTip[];
  score: number;
  level: "Júnior" | "Pleno" | "Sênior";
  strengths: string[];
}

type Rule = { id: string; severity: MentorSeverity; re: RegExp; title: string; why: string; fix: string };

const RULES: Rule[] = [
  { id: "sleep", severity: "critico", re: /Thread\.sleep\s*\(/, title: "Espera fixa com Thread.sleep", why: "Deixa o teste lento e instável (flaky): às vezes espera demais, às vezes de menos.", fix: "new WebDriverWait(driver, Duration.ofSeconds(10)).until(ExpectedConditions.visibilityOfElementLocated(locator));" },
  { id: "xpath-abs", severity: "critico", re: /By\.xpath\(\s*"\/html/, title: "XPath absoluto", why: "Quebra com qualquer mudança no layout da página.", fix: "Prefira By.id, By.cssSelector ou XPath relativo: //button[@data-test='login']" },
  { id: "implicit", severity: "atencao", re: /implicitlyWait\s*\(/, title: "Espera implícita global", why: "Misturar espera implícita com explícita causa tempos imprevisíveis.", fix: "Use apenas WebDriverWait (espera explícita) nos pontos necessários." },
  { id: "catch-empty", severity: "critico", re: /catch\s*\([^)]*\)\s*\{\s*\}/, title: "Exceção engolida", why: "O erro some e o teste passa mesmo com falha real.", fix: "Registre ou relance: catch (Exception e) { throw new AssertionError(\"...\", e); }" },
  { id: "print", severity: "dica", re: /System\.out\.println/, title: "Log com System.out", why: "Não aparece no relatório ExtentReports nem tem nível de log.", fix: "Use test.log(Status.INFO, \"...\") ou um Logger." },
  { id: "hard-url", severity: "atencao", re: /driver\.get\(\s*"https?:\/\//, title: "URL fixa no teste", why: "Impede rodar em outros ambientes (homologação, produção).", fix: "Leia de config: driver.get(Config.get(\"base.url\"));" },
  { id: "driver-in-test", severity: "atencao", re: /new\s+(Chrome|Firefox|Edge)Driver\s*\(/, title: "Driver criado dentro do teste", why: "Duplica código e dificulta paralelismo.", fix: "Centralize em uma DriverFactory/Hooks com @Before/@After." },
  { id: "assert-true-eq", severity: "dica", re: /assertTrue\([^)]*\.equals\(/, title: "assertTrue com equals", why: "A mensagem de falha não mostra o valor esperado nem o obtido.", fix: "Use assertEquals(esperado, obtido);" },
  { id: "findelements-get0", severity: "dica", re: /findElements\([^)]*\)\.get\(0\)/, title: "findElements().get(0)", why: "Lança IndexOutOfBounds confuso quando não acha nada.", fix: "Use findElement(...) ou valide a lista antes." },
];

export function analyzeJava(code: string): MentorReport {
  const lines = code.split("\n");
  const tips: MentorTip[] = [];
  lines.forEach((text, i) => {
    if (/^\s*\/\//.test(text)) return;
    for (const r of RULES) {
      if (r.re.test(text)) tips.push({ id: `${r.id}-${i}`, severity: r.severity, line: i + 1, title: r.title, why: r.why, fix: r.fix });
    }
  });
  const hasTest = /@Test|@(Given|When|Then|Dado|Quando|Então)/.test(code);
  const hasAssert = /assert\w*\s*\(|assertThat/.test(code);
  if (hasTest && !hasAssert) {
    tips.push({ id: "no-assert", severity: "critico", line: 1, title: "Teste sem verificação", why: "Um teste sem assert só prova que o código não quebrou, não que está certo.", fix: "Adicione assertEquals / assertTrue validando o resultado esperado." });
  }
  if (/driver\s*=/.test(code) && !/\.quit\(\)/.test(code)) {
    tips.push({ id: "no-quit", severity: "atencao", line: 1, title: "Navegador nunca é fechado", why: "Processos do navegador ficam abertos e consomem memória no CI.", fix: "@AfterEach void tearDown() { if (driver != null) driver.quit(); }" });
  }

  const strengths: string[] = [];
  if (/WebDriverWait/.test(code)) strengths.push("Usa espera explícita");
  if (/@FindBy|PageFactory|class\s+\w+Page\b/.test(code)) strengths.push("Aplica Page Object");
  if (hasAssert) strengths.push("Possui verificações (asserts)");
  if (/\.quit\(\)/.test(code)) strengths.push("Fecha o navegador corretamente");
  if (/By\.(id|cssSelector)/.test(code)) strengths.push("Localizadores estáveis");

  const penalty = tips.reduce((s, t) => s + (t.severity === "critico" ? 20 : t.severity === "atencao" ? 10 : 4), 0);
  const empty = code.trim().length === 0;
  const score = empty ? 0 : Math.max(0, Math.min(100, 100 - penalty + strengths.length * 3));
  const level = score >= 85 ? "Sênior" : score >= 60 ? "Pleno" : "Júnior";
  const order = { critico: 0, atencao: 1, dica: 2 };
  tips.sort((a, b) => order[a.severity] - order[b.severity] || a.line - b.line);
  return { tips, score, level, strengths };
}
