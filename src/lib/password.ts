/** Regras de senha do cadastro, validadas no formulário antes de chamar a autenticação. */
export interface PasswordRule {
  key: string;
  label: string;
  test: (value: string) => boolean;
}

export const passwordRules: PasswordRule[] = [
  { key: "len", label: "Pelo menos 8 caracteres", test: (v) => v.length >= 8 },
  { key: "letter", label: "Pelo menos uma letra", test: (v) => /[a-zA-Z]/.test(v) },
  { key: "number", label: "Pelo menos um número", test: (v) => /\d/.test(v) },
];

export function passwordIssues(value: string): string[] {
  return passwordRules.filter((r) => !r.test(value)).map((r) => r.label);
}

export function isPasswordValid(value: string): boolean {
  return passwordIssues(value).length === 0;
}

/** Força relativa (0 a 4) apenas para o indicador visual. */
export function passwordStrength(value: string): number {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^a-zA-Z0-9]/.test(value)) score++;
  return Math.min(4, score);
}

export const strengthLabels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
