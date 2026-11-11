/**
 * Validação automática de exercícios de código por casos de teste.
 *
 * O código Java do aluno não é executado no navegador (por segurança), então a
 * validação é feita por uma bateria de casos de teste estáticos: estrutura do
 * arquivo (chaves/parênteses balanceados, ausência de TODO) + asserções de
 * conteúdo derivadas dos requisitos do exercício. Cada caso devolve o resultado
 * detalhado (esperado, encontrado, linha e como corrigir).
 */

export type CodeTestKind = "contains" | "regex" | "absent" | "structure";

export interface CodeTestCase {
  /** Nome exibido no relatório, ex: "deve localizar o link forget-pass" */
  name: string;
  kind: CodeTestKind;
  /** Trecho literal (contains/absent) ou expressão regular (regex) */
  pattern: string;
  /** Descrição do comportamento esperado */
  expected: string;
  /** Orientação de correção exibida quando o caso falha */
  message: string;
  /** Casos opcionais contam como "recomendados" e não bloqueiam o envio */
  optional?: boolean;
}

export interface CodeTestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  message: string;
  optional: boolean;
  /** Linha onde a evidência foi encontrada (1-based), quando aplicável */
  line?: number;
}

export interface CodeTestReport {
  results: CodeTestResult[];
  passed: number;
  failed: number;
  total: number;
  score: number;
  /** true quando todos os casos obrigatórios passaram */
  approved: boolean;
  durationMs: number;
}

function findLine(code: string, needle: string): number | undefined {
  const lines = code.split("\n");
  const i = lines.findIndex((l) => l.includes(needle));
  return i >= 0 ? i + 1 : undefined;
}

function balanced(code: string, open: string, close: string) {
  let depth = 0;
  for (const ch of code) {
    if (ch === open) depth++;
    else if (ch === close) depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

/** Casos de teste estruturais aplicados a qualquer exercício. */
export function structuralTests(): CodeTestCase[] {
  return [
    {
      name: "estrutura: código não está vazio",
      kind: "structure",
      pattern: "not-empty",
      expected: "ao menos 2 linhas de código escritas",
      message: "Escreva a implementação no editor antes de executar os testes.",
    },
    {
      name: "estrutura: chaves { } balanceadas",
      kind: "structure",
      pattern: "braces",
      expected: "todo bloco aberto com { deve ser fechado com }",
      message: "Há um bloco aberto sem fechamento — revise as chaves do arquivo.",
    },
    {
      name: "estrutura: parênteses ( ) balanceados",
      kind: "structure",
      pattern: "parens",
      expected: "chamadas de método com parênteses fechados",
      message: "Faltou fechar um parêntese em alguma chamada de método.",
    },
    {
      name: "estrutura: nenhum marcador TODO pendente",
      kind: "structure",
      pattern: "no-todo",
      expected: "nenhum // TODO restante no arquivo",
      message: "Remova os comentários // TODO substituindo-os pela implementação real.",
      optional: true,
    },
  ];
}

/** Deriva casos de teste de conteúdo a partir das palavras-chave obrigatórias. */
export function testsFromRequired(required: string[]): CodeTestCase[] {
  return required.map((token) => ({
    name: `implementação: usa \`${token}\``,
    kind: "contains" as const,
    pattern: token,
    expected: `o código deve conter ${token}`,
    message: `Inclua ${token} na sua solução — é parte do contrato do exercício.`,
  }));
}

function evalStructure(code: string, pattern: string) {
  const trimmed = code.trim();
  switch (pattern) {
    case "not-empty":
      return {
        passed: trimmed.split("\n").filter((l) => l.trim()).length >= 2,
        actual: `${trimmed.split("\n").filter((l) => l.trim()).length} linha(s) úteis`,
      };
    case "braces":
      return { passed: balanced(code, "{", "}"), actual: balanced(code, "{", "}") ? "balanceadas" : "desbalanceadas" };
    case "parens":
      return { passed: balanced(code, "(", ")"), actual: balanced(code, "(", ")") ? "balanceados" : "desbalanceados" };
    case "no-todo": {
      const has = /TODO/i.test(code);
      return { passed: !has, actual: has ? "TODO encontrado" : "nenhum TODO" };
    }
    default:
      return { passed: true, actual: "n/a" };
  }
}

export function runCodeTests(code: string, tests: CodeTestCase[]): CodeTestReport {
  const started = performance.now();
  const results: CodeTestResult[] = tests.map((t) => {
    let passed = false;
    let actual = "não encontrado";
    let line: number | undefined;

    if (t.kind === "structure") {
      const r = evalStructure(code, t.pattern);
      passed = r.passed;
      actual = r.actual;
    } else if (t.kind === "contains") {
      passed = code.includes(t.pattern);
      if (passed) {
        actual = `encontrado: ${t.pattern}`;
        line = findLine(code, t.pattern);
      }
    } else if (t.kind === "absent") {
      passed = !code.includes(t.pattern);
      actual = passed ? "ausente (correto)" : `presente: ${t.pattern}`;
      if (!passed) line = findLine(code, t.pattern);
    } else {
      try {
        const re = new RegExp(t.pattern, "m");
        const match = re.exec(code);
        passed = !!match;
        if (match) {
          actual = `casou com: ${match[0].slice(0, 60)}`;
          line = findLine(code, match[0].split("\n")[0]);
        }
      } catch {
        passed = false;
        actual = "padrão de teste inválido";
      }
    }

    return { name: t.name, passed, expected: t.expected, actual, message: t.message, optional: !!t.optional, line };
  });

  const passed = results.filter((r) => r.passed).length;
  const requiredResults = results.filter((r) => !r.optional);
  return {
    results,
    passed,
    failed: results.length - passed,
    total: results.length,
    score: results.length ? Math.round((passed / results.length) * 100) : 0,
    approved: requiredResults.every((r) => r.passed),
    durationMs: Math.max(1, Math.round(performance.now() - started)),
  };
}
