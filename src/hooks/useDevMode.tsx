import { useAuth } from "@/hooks/useAuth";

/** Conta do desenvolvedor: navega livremente por todas as aulas e etapas. */
export const DEV_EMAILS = ["andersonsilva1292@hotmail.com"];

/**
 * Modo desenvolvimento: libera todas as etapas e aulas, sem travas de sequência,
 * apenas para a conta do desenvolvedor.
 */
export function useDevMode(): boolean {
  const { user } = useAuth();
  const email = user?.email?.toLowerCase() ?? "";
  return DEV_EMAILS.includes(email);
}
