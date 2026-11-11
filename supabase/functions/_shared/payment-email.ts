import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

/** Cópia interna de cada confirmação de pagamento. */
export const OWNER_EMAIL = "andersonsilva1292@hotmail.com";

export interface PaymentEmailRow {
  id: string;
  user_id: string | null;
  email: string | null;
  product_name: string | null;
  amount_cents: number;
  currency: string;
  method: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  stripe_session_id: string | null;
  mp_payment_id: string | null;
  confirmation_email_sent_at: string | null;
}

const PAYMENT_COLUMNS =
  "id, user_id, email, product_name, amount_cents, currency, method, status, paid_at, created_at, stripe_session_id, mp_payment_id, confirmation_email_sent_at";

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

export function formatMoney(cents: number, currency: string): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: (currency || "brl").toUpperCase(),
  });
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

export function methodLabel(method: string): string {
  if (method === "pix") return "PIX";
  if (method === "card") return "Cartão de crédito";
  return method || "—";
}

/** Nome do aluno e validade do acesso liberado pela compra. */
async function loadStudentContext(
  supabase: SupabaseClient,
  userId: string | null
): Promise<{ name: string | null; accessUntil: string | null }> {
  if (!userId) return { name: null, accessUntil: null };

  const [profile, access] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("user_id", userId).maybeSingle(),
    supabase
      .from("course_access")
      .select("expires_at, active")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    name: (profile.data?.display_name as string | null) ?? null,
    accessUntil: access.data?.active ? ((access.data.expires_at as string | null) ?? null) : null,
  };
}

async function invokeSend(body: Record<string, unknown>): Promise<void> {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Falha no envio (${response.status}): ${detail.slice(0, 300)}`);
  }
}

export interface SendResult {
  sent: boolean;
  error?: string;
}

/**
 * Envia a confirmação de pagamento ao aluno e a cópia para o proprietário.
 * `force` permite o reenvio manual pela área de administração.
 */
export async function sendPaymentConfirmation(
  supabase: SupabaseClient,
  payment: PaymentEmailRow,
  options: { force?: boolean; appUrl: string }
): Promise<SendResult> {
  if (payment.status !== "paid") {
    return { sent: false, error: "Pagamento não está aprovado." };
  }
  if (!payment.email) {
    return { sent: false, error: "Pagamento sem e-mail do aluno." };
  }
  if (payment.confirmation_email_sent_at && !options.force) {
    return { sent: false };
  }

  const { name, accessUntil } = await loadStudentContext(supabase, payment.user_id);
  const paidAt = payment.paid_at ?? payment.created_at;

  const shared = {
    studentName: name,
    productName: payment.product_name ?? "Acesso Completo",
    amount: formatMoney(payment.amount_cents, payment.currency),
    method: methodLabel(payment.method),
    paidAt: formatDateTime(paidAt),
    accessUntil: accessUntil ? formatDateTime(accessUntil) : null,
    appUrl: options.appUrl,
    supportEmail: OWNER_EMAIL,
  };

  const suffix = options.force ? `-resend-${Date.now()}` : "";
  const key = payment.mp_payment_id ?? payment.stripe_session_id ?? payment.id;

  try {
    await invokeSend({
      templateName: "payment-confirmation",
      recipientEmail: payment.email,
      idempotencyKey: `payment-confirmation-${key}${suffix}`,
      templateData: shared,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase
      .from("payments")
      .update({ confirmation_email_error: message, updated_at: new Date().toISOString() })
      .eq("id", payment.id);
    return { sent: false, error: message };
  }

  await supabase
    .from("payments")
    .update({
      confirmation_email_sent_at: new Date().toISOString(),
      confirmation_email_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  // Cópia para o proprietário: falha aqui não invalida a confirmação do aluno.
  try {
    await invokeSend({
      templateName: "payment-notice-owner",
      recipientEmail: OWNER_EMAIL,
      idempotencyKey: `payment-notice-owner-${key}${suffix}`,
      templateData: { ...shared, studentEmail: payment.email },
    });
  } catch (error) {
    console.error("Falha na cópia para o proprietário:", error);
  }

  return { sent: true };
}

/** Busca o pagamento pelo identificador do Mercado Pago. */
export async function paymentByMpId(
  supabase: SupabaseClient,
  mpPaymentId: string
): Promise<PaymentEmailRow | null> {
  const { data } = await supabase
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .eq("mp_payment_id", mpPaymentId)
    .maybeSingle();
  return (data as PaymentEmailRow | null) ?? null;
}

/** Busca o pagamento por id interno. */
export async function paymentById(
  supabase: SupabaseClient,
  id: string
): Promise<PaymentEmailRow | null> {
  const { data } = await supabase
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as PaymentEmailRow | null) ?? null;
}
