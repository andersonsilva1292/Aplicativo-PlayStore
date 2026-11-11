import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getMercadoPagoConfig } from "@/lib/mercadopago";

const TRIAL_HOURS = 24;
/** Beta público: todo usuário logado tem acesso completo. Desligue para voltar a cobrar. */
export const PUBLIC_BETA = true;

export interface AccessState {
  loading: boolean;
  isMasterAdmin: boolean;
  /** Acesso liberado (pagamento, assinatura, trial ou proprietário). */
  hasAccess: boolean;
  /** Origem do acesso atual. */
  source: "master_admin" | "payment" | "subscription" | "beta" | "trial" | "none";
  trialEndsAt: Date | null;
  trialMsLeft: number;
  expiresAt: Date | null;
  refresh: () => Promise<void>;
}

/**
 * Centraliza a regra de acesso: proprietário e alunos pagantes têm acesso total;
 * novos cadastros recebem 24 horas de teste gratuito a partir da criação da conta.
 */
export function useAccess(): AccessState {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [source, setSource] = useState<AccessState["source"]>("none");
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setIsMasterAdmin(false);
      setSource("none");
      setTrialEndsAt(null);
      return;
    }

    const { environment } = await getMercadoPagoConfig();

    const [roles, access, subs, profile] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("course_access").select("active, expires_at, source").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", user.id)
        .eq("environment", environment)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("profiles").select("trial_started_at").eq("user_id", user.id).maybeSingle(),
    ]);

    const admin = (roles.data ?? []).some((r) => r.role === "master_admin");
    setIsMasterAdmin(admin);

    const trialStart = profile.data?.trial_started_at ? new Date(profile.data.trial_started_at) : null;
    const trialEnd = trialStart ? new Date(trialStart.getTime() + TRIAL_HOURS * 3600_000) : null;
    setTrialEndsAt(trialEnd);

    const accessRow = access.data;
    const accessValid =
      !!accessRow?.active && (!accessRow.expires_at || new Date(accessRow.expires_at) > new Date());

    const sub = subs.data;
    const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end) : null;
    // Cancelamento agendado: o acesso continua até o fim do período já pago.
    const subValid =
      !!sub &&
      ((["active", "trialing", "past_due"].includes(sub.status) &&
        (!periodEnd || periodEnd > new Date())) ||
        (sub.status === "canceled" && !!periodEnd && periodEnd > new Date()));

    if (admin) {
      setSource("master_admin");
      setExpiresAt(null);
    } else if (accessValid) {
      setSource("payment");
      setExpiresAt(accessRow?.expires_at ? new Date(accessRow.expires_at) : null);
    } else if (subValid) {
      setSource("subscription");
      setExpiresAt(sub?.current_period_end ? new Date(sub.current_period_end) : null);
    } else if (PUBLIC_BETA) {
      setSource("beta");
      setExpiresAt(null);
    } else if (trialEnd && trialEnd.getTime() > Date.now()) {
      setSource("trial");
      setExpiresAt(trialEnd);
    } else {
      setSource("none");
      setExpiresAt(null);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  // Relógio para o contador do teste gratuito.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Marca presença para o painel do proprietário.
  useEffect(() => {
    if (!user) return;
    const ping = async () => {
      await supabase.from("user_sessions").upsert(
        {
          user_id: user.id,
          last_seen_at: new Date().toISOString(),
          user_agent: navigator.userAgent.slice(0, 300),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    };
    void ping();
    const id = window.setInterval(ping, 120_000);
    return () => window.clearInterval(id);
  }, [user]);

  const trialMsLeft = trialEndsAt ? Math.max(0, trialEndsAt.getTime() - now) : 0;

  return {
    loading,
    isMasterAdmin,
    hasAccess: source !== "none",
    source,
    trialEndsAt,
    trialMsLeft,
    expiresAt,
    refresh: load,
  };
}

export function formatCountdown(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
