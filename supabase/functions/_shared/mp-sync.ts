import { type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { type MpEnv, mapPaymentStatus, mpFetch } from "./mercadopago.ts";
import { ACCESS_DAYS, accessExpiryFromNow, grantAccess, revokeAccess } from "./access.ts";
import { paymentByMpId, sendPaymentConfirmation } from "./payment-email.ts";

export const APP_URL = "https://estudosimuladorctfl.lovable.app";

export interface SyncResult {
  status: "pending" | "paid" | "failed" | "expired" | "refunded";
  statusDetail: string | null;
}

function userIdFrom(payment: any): string | null {
  const meta = payment.metadata?.user_id ?? payment.metadata?.userId;
  if (typeof meta === "string" && meta) return meta;
  const reference = String(payment.external_reference ?? "");
  const [userId] = reference.split(":");
  return userId || null;
}

function planIdFrom(payment: any): string | null {
  const meta = payment.metadata?.plan_id ?? payment.metadata?.planId;
  if (typeof meta === "string" && meta) return meta;
  const reference = String(payment.external_reference ?? "");
  const parts = reference.split(":");
  return parts[1] || null;
}

/**
 * Consulta o pagamento na origem e atualiza histórico, acesso e confirmação por e-mail.
 * É a única função que decide liberar ou bloquear o acesso de uma compra.
 */
export async function syncPayment(
  supabase: SupabaseClient,
  env: MpEnv,
  mpPaymentId: string
): Promise<SyncResult> {
  const payment = await mpFetch<any>(env, `/v1/payments/${mpPaymentId}`);
  const status = mapPaymentStatus(String(payment.status ?? ""));
  const userId = userIdFrom(payment);
  const planId = planIdFrom(payment);
  const isRecurring = Boolean(payment.metadata?.preapproval_id || payment.point_of_interaction?.type === "SUBSCRIPTION");
  const refundedCents = Math.round(Number(payment.transaction_amount_refunded ?? 0) * 100);

  const { data: existing } = await supabase
    .from("payments")
    .select("id, user_id, status")
    .eq("mp_payment_id", String(payment.id))
    .maybeSingle();

  const patch: Record<string, unknown> = {
    user_id: userId,
    email: payment.payer?.email ?? null,
    mp_payment_id: String(payment.id),
    provider: "mercadopago",
    price_id: planId,
    product_name: payment.description ?? null,
    amount_cents: Math.round(Number(payment.transaction_amount ?? 0) * 100),
    currency: (payment.currency_id ?? "BRL").toLowerCase(),
    method: payment.payment_method_id === "pix" ? "pix" : "card",
    status,
    failure_reason:
      status === "failed" || status === "refunded" ? (payment.status_detail ?? null) : null,
    expires_at: payment.date_of_expiration ?? null,
    paid_at: payment.date_approved ?? (status === "paid" ? new Date().toISOString() : null),
    approved_at: payment.date_approved ?? null,
    refunded_at: status === "refunded" ? new Date().toISOString() : null,
    refund_amount_cents: refundedCents,
    environment: env,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("payments").update(patch).eq("id", existing.id);
  } else {
    await supabase.from("payments").insert(patch);
  }

  if (userId) {
    if (status === "paid" && !isRecurring) {
      await grantAccess(supabase, userId, "payment", accessExpiryFromNow(ACCESS_DAYS));
    } else if (status === "refunded") {
      await revokeAccess(supabase, userId);
    }
  }

  if (status === "paid") {
    try {
      const row = await paymentByMpId(supabase, String(payment.id));
      if (row) await sendPaymentConfirmation(supabase, row, { appUrl: APP_URL });
    } catch (error) {
      console.error("Falha ao enviar confirmação de pagamento:", error);
    }
  }

  return { status, statusDetail: payment.status_detail ?? null };
}

function subscriptionStatus(status: string): string {
  switch (status) {
    case "authorized":
      return "active";
    case "paused":
      return "paused";
    case "cancelled":
      return "canceled";
    default:
      return "incomplete";
  }
}

/** Atualiza a assinatura mensal: renovação paga, pausa, falha ou cancelamento. */
export async function syncPreapproval(
  supabase: SupabaseClient,
  env: MpEnv,
  preapprovalId: string
): Promise<void> {
  const preapproval = await mpFetch<any>(env, `/preapproval/${preapprovalId}`);
  const status = subscriptionStatus(String(preapproval.status ?? ""));
  const reference = String(preapproval.external_reference ?? "");
  const [refUser, refPlan] = reference.split(":");

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, user_id, current_period_end")
    .eq("mp_preapproval_id", preapprovalId)
    .maybeSingle();

  const userId = (existing?.user_id as string | undefined) ?? (refUser || undefined);
  if (!userId) {
    console.error("Assinatura sem aluno identificado:", preapprovalId);
    return;
  }

  const nextPayment = preapproval.next_payment_date
    ? new Date(preapproval.next_payment_date).toISOString()
    : ((existing?.current_period_end as string | null) ?? null);

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      mp_preapproval_id: preapprovalId,
      provider: "mercadopago",
      price_id: refPlan || null,
      product_id: refPlan || null,
      status,
      current_period_end: nextPayment,
      cancel_at_period_end: status === "canceled",
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "mp_preapproval_id" }
  );

  if (status === "active") {
    await grantAccess(supabase, userId, "subscription", null);
  } else if (nextPayment && new Date(nextPayment) > new Date()) {
    // Cancelada ou pausada: o acesso vale até o fim do período já pago.
    await grantAccess(supabase, userId, "subscription", nextPayment);
  } else {
    await revokeAccess(supabase, userId);
  }
}

/** Cobrança mensal gerada pela assinatura. */
export async function syncAuthorizedPayment(
  supabase: SupabaseClient,
  env: MpEnv,
  authorizedPaymentId: string
): Promise<void> {
  const authorized = await mpFetch<any>(env, `/authorized_payments/${authorizedPaymentId}`);
  const preapprovalId = authorized.preapproval_id ? String(authorized.preapproval_id) : null;
  const paymentId = authorized.payment?.id ? String(authorized.payment.id) : null;

  if (paymentId) {
    try {
      await syncPayment(supabase, env, paymentId);
    } catch (error) {
      console.error("Falha ao sincronizar cobrança da assinatura:", error);
    }
  }
  if (preapprovalId) await syncPreapproval(supabase, env, preapprovalId);
}
