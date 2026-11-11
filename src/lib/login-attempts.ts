/**
 * Limite de tentativas de login por dispositivo: após 5 falhas consecutivas,
 * o formulário fica bloqueado por 5 minutos. Proteção complementar ao
 * rate limit do servidor, para dar feedback imediato ao usuário.
 */
const KEY = "ctfl-prep:login-attempts";
export const MAX_ATTEMPTS = 5;
export const LOCK_MS = 5 * 60 * 1000;

interface AttemptState {
  count: number;
  lockedUntil: number | null;
}

function read(): AttemptState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { count: 0, lockedUntil: null };
    const parsed = JSON.parse(raw) as AttemptState;
    return { count: Number(parsed.count) || 0, lockedUntil: parsed.lockedUntil ?? null };
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function write(state: AttemptState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* armazenamento indisponível: proteção apenas em memória desta sessão */
  }
}

/** Milissegundos restantes de bloqueio (0 quando liberado). */
export function lockMsLeft(): number {
  const { lockedUntil } = read();
  if (!lockedUntil) return 0;
  const left = lockedUntil - Date.now();
  if (left <= 0) {
    write({ count: 0, lockedUntil: null });
    return 0;
  }
  return left;
}

/** Registra uma falha e devolve o estado resultante. */
export function registerFailure(): { attemptsLeft: number; lockedMs: number } {
  const state = read();
  const count = state.count + 1;
  if (count >= MAX_ATTEMPTS) {
    write({ count, lockedUntil: Date.now() + LOCK_MS });
    return { attemptsLeft: 0, lockedMs: LOCK_MS };
  }
  write({ count, lockedUntil: null });
  return { attemptsLeft: MAX_ATTEMPTS - count, lockedMs: 0 };
}

export function clearAttempts() {
  write({ count: 0, lockedUntil: null });
}

export function formatLock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}
