/**
 * Simulador de compilação/execução Java no navegador.
 * Não compila Java de verdade: faz checagens sintáticas no estilo javac,
 * simula a saída de System.out.println e as chamadas do framework do curso.
 */
import type { LabExercise } from "@/data/java-lab-exercises";

export interface CompileError { line: number; message: string }
export interface RunResult { ok: boolean; lines: string[]; errors: CompileError[]; output: string[]; timeout: boolean; ms: number }

const KNOWN_IMPORTS = [
  /^org\.junit(\.[\w*]+)*$/, /^org\.openqa\.selenium(\.[\w*]+)*$/, /^metodos(\.[\w*]+)*$/,
  /^elementos(\.[\w*]+)*$/, /^factory(\.[\w*]+)*$/, /^io\.cucumber(\.[\w*]+)*$/, /^java\.[\w.*]+$/, /^report(\.[\w*]+)*$/,
];

export const FRAMEWORK_SYMBOLS = [
  "Metodos.clicar", "Metodos.escrever", "Metodos.screenshot", "Metodos.esperarElemento", "Metodos.texto",
  "Elementos.campoUsuario", "Elementos.campoSenha", "Elementos.botaoEntrar", "Elementos.mensagemErro",
  "DriverFactory.getDriver", "DriverFactory.killDriver", "ReportManager.log", "Assert.assertEquals",
  "Assert.assertTrue", "System.out.println", "System.getProperty",
];

function stripComments(code: string) {
  return code.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/\/\/.*$/gm, "");
}

function stripStrings(line: string) {
  return line.replace(/"(?:\\.|[^"\\])*"/g, '""');
}

export function compile(code: string, file = "Main.java"): CompileError[] {
  const errors: CompileError[] = [];
  const clean = stripComments(code).split("\n");
  const stack: { ch: string; line: number }[] = [];
  const pairs: Record<string, string> = { "}": "{", ")": "(" };

  clean.forEach((raw, i) => {
    const ln = i + 1;
    if ((raw.match(/"/g) || []).length % 2 === 1) errors.push({ line: ln, message: `${file}:${ln}: error: unclosed string literal` });
    const line = stripStrings(raw);
    for (const ch of line) {
      if (ch === "{" || ch === "(") stack.push({ ch, line: ln });
      else if (ch === "}" || ch === ")") {
        const top = stack.pop();
        if (!top || top.ch !== pairs[ch]) errors.push({ line: ln, message: `${file}:${ln}: error: illegal start of expression ('${ch}' inesperado)` });
      }
    }
    const t = line.trim();
    const imp = t.match(/^import\s+(?:static\s+)?([\w.*]+)\s*;?$/);
    if (imp) {
      if (!t.endsWith(";")) errors.push({ line: ln, message: `${file}:${ln}: error: ';' expected` });
      const pkg = imp[1];
      if (!KNOWN_IMPORTS.some((r) => r.test(pkg))) errors.push({ line: ln, message: `${file}:${ln}: error: package ${pkg.replace(/\.[^.]+$/, "")} does not exist` });
      return;
    }
    if (!t || t.startsWith("@") || t.startsWith("*") || /[{};,]$/.test(t) || /^(}|\{)/.test(t)) return;
    if (/^(public|private|protected|class|if|else|for|while|try|catch|finally|switch|do)\b/.test(t) && !/=/.test(t)) return;
    if (/[)\w"\]+]$/.test(t) && !/[(+,&|]$/.test(t)) {
      const nextNonEmpty = clean.slice(i + 1).find((l) => l.trim());
      if (nextNonEmpty && /^\s*[.+)]/.test(nextNonEmpty)) return;
      errors.push({ line: ln, message: `${file}:${ln}: error: ';' expected` });
    }
  });
  stack.forEach((s) => errors.push({ line: s.line, message: `${file}:${s.line}: error: reached end of file while parsing ('${s.ch}' não fechado)` }));
  if (!/\bclass\s+\w+/.test(code)) errors.push({ line: 1, message: `${file}:1: error: class, interface, enum, or record expected` });
  return errors.sort((a, b) => a.line - b.line);
}

/** Avalia literais e concatenações simples com variáveis String/int declaradas. */
function evalExpr(expr: string, vars: Record<string, string>): string {
  return expr.split(/\s*\+\s*(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((p) => {
    p = p.trim();
    const s = p.match(/^"((?:\\.|[^"\\])*)"$/);
    if (s) return s[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    if (p in vars) return vars[p];
    return p;
  }).join("");
}

export function execute(code: string, file = "Main.java"): RunResult {
  const started = performance.now();
  const lines: string[] = [];
  const output: string[] = [];
  const errors = compile(code, file);
  lines.push(`$ javac --release 17 -cp framework.jar ${file}`);
  if (errors.length) {
    errors.forEach((e) => lines.push(e.message));
    lines.push(`${errors.length} error${errors.length > 1 ? "s" : ""}`);
    return { ok: false, lines, errors, output, timeout: false, ms: Math.round(performance.now() - started) };
  }
  lines.push(`$ java -Xmx512m -cp .:framework.jar org.junit.runner.JUnitCore ${file.replace(".java", "")}`);
  const src = stripComments(code);
  if (/while\s*\(\s*true\s*\)/.test(src) && !/break\s*;/.test(src)) {
    lines.push("[sandbox] Timeout: execução excedeu 10s — processo interrompido (SIGKILL).");
    return { ok: false, lines, errors, output, timeout: true, ms: 10000 };
  }
  if (/DriverFactory\.getDriver/.test(src)) lines.push("[WebDriverManager] Resolved chromedriver 127 (cache)", "[DriverFactory] ChromeDriver headless iniciado");
  const vars: Record<string, string> = {};
  let driverReady = /DriverFactory\.getDriver/.test(src);
  const stmt = /(String|int)\s+(\w+)\s*=\s*([^;]+);|System\.getProperty\(\s*"(\w+)"\s*,\s*"([^"]*)"\s*\)|System\.out\.println\(([\s\S]*?)\);|driver\.get\(\s*"([^"]+)"\s*\)|Metodos\.(\w+)\(([^;]*)\);|DriverFactory\.killDriver\(\)|ReportManager\.log\(\s*"([^"]*)"\s*\)|Thread\.sleep\((\d+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = stmt.exec(src))) {
    if (m[1]) {
      const prop = m[3].match(/System\.getProperty\(\s*"\w+"\s*,\s*"([^"]*)"\s*\)/);
      vars[m[2]] = prop ? prop[1] : evalExpr(m[3], vars);
    } else if (m[6] !== undefined) {
      const out = evalExpr(m[6], vars);
      output.push(out);
      lines.push(out);
    } else if (m[7]) lines.push(`[WebDriver] GET ${m[7]} → 200`);
    else if (m[8]) {
      if (!driverReady) {
        lines.push(`java.lang.NullPointerException: Cannot invoke "WebDriver.findElement" because "driver" is null`, `    at metodos.Metodos.${m[8]}(Metodos.java:42)`);
        return { ok: false, lines, errors, output, timeout: false, ms: Math.round(performance.now() - started) };
      }
      lines.push(`[Metodos] ${m[8]}(${m[9].trim()})`);
    } else if (m[0].startsWith("DriverFactory.killDriver")) { lines.push("[DriverFactory] driver encerrado"); driverReady = false; }
    else if (m[10] !== undefined) lines.push(`[ReportManager] ${m[10]}`);
    else if (m[11]) lines.push(`[aviso] Thread.sleep(${m[11]}) — prefira esperas explícitas`);
  }
  const testCount = (src.match(/@Test/g) || []).length;
  lines.push("", `OK (${testCount} test${testCount === 1 ? "" : "s"})`);
  return { ok: true, lines, errors, output, timeout: false, ms: Math.max(1, Math.round(performance.now() - started)) };
}

export interface ValidationResult { name: string; passed: boolean; hint: string }

export function validate(code: string, ex: LabExercise) {
  const run = execute(code, `${ex.template.match(/class\s+(\w+)/)?.[1] ?? "Main"}.java`);
  const src = stripComments(code);
  const results: ValidationResult[] = [
    { name: "compila sem erros", passed: run.errors.length === 0, hint: "Corrija os erros de compilação mostrados no terminal." },
    { name: "executa sem exceção ou timeout", passed: run.ok, hint: "Veja o erro no terminal e a tabela de diagnóstico." },
    ...ex.tests.map((t) => ({
      name: t.name,
      hint: t.hint,
      passed: t.pattern ? new RegExp(t.pattern, "m").test(src) : run.output.some((o) => o.includes(t.output!)),
    })),
  ];
  const passed = results.filter((r) => r.passed).length;
  return { run, results, passed, total: results.length, success: passed === results.length };
}
