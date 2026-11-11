/** Compara o código digitado pelo aluno com o modelo do instrutor, linha por linha. */
export interface TypingIssue { line: number; message: string }
export interface TypingReport { accuracy: number; correctLines: number; totalLines: number; issues: TypingIssue[] }

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const count = (s: string, ch: string) => s.split(ch).length - 1;

export function compareTyping(typed: string, model: string): TypingReport {
  const m = model.split("\n").map(norm).filter(Boolean);
  const t = typed.split("\n").map(norm).filter(Boolean);
  const issues: TypingIssue[] = [];
  let correct = 0;

  m.forEach((exp, i) => {
    const got = t[i];
    const n = i + 1;
    if (got === undefined) { issues.push({ line: n, message: `Linha faltando: ${exp}` }); return; }
    if (got === exp) { correct++; return; }
    if (exp.endsWith(";") && !got.endsWith(";") && got === exp.slice(0, -1).trim()) issues.push({ line: n, message: "Falta o ponto e vírgula (;) no final." });
    else if (got.toLowerCase() === exp.toLowerCase()) issues.push({ line: n, message: "Diferença de maiúsculas/minúsculas (Java diferencia)." });
    else issues.push({ line: n, message: `Esperado: ${exp}` });
  });
  if (t.length > m.length) issues.push({ line: m.length + 1, message: `${t.length - m.length} linha(s) a mais que o modelo.` });

  const opens = count(typed, "{"), closes = count(typed, "}");
  if (opens !== closes) issues.unshift({ line: 0, message: opens > closes ? `${opens - closes} chave(s) { sem fechar.` : `${closes - opens} chave(s) } a mais.` });
  const po = count(typed, "("), pc = count(typed, ")");
  if (po !== pc) issues.unshift({ line: 0, message: "Parênteses ( ) desbalanceados." });

  return { accuracy: m.length ? Math.round((correct / m.length) * 100) : 0, correctLines: correct, totalLines: m.length, issues };
}
