import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  type MpEnv,
  jsonHeaders,
  loadPlan,
  mpFetch,
  resolveEnv,
  serviceClient,
} from "../_shared/mercadopago.ts";

/**
 * Gera o link do pagamento hospedado pelo Mercado Pago (Checkout Pro).
 * Compra única: preferência com PIX, cartão e boleto.
 * Plano mensal: autorização de cobrança recorrente (preapproval).
 */

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, ...jsonHeaders } });

function safeReturnUrl(raw: unknown): string {
  const value = String(raw ?? "");
  return /^https:\/\/[a-zA-Z0-9.-]+\/[\w\-/?=&%.]*$/.test(value)
    ? value
    : "https://estudosimuladorctfl.lovable.app/minha-conta";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const supabase = serviceClient();

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Faça login para concluir a compra." }, 401);
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: "Sessão inválida. Entre novamente." }, 401);

    const body = await req.json().catch(() => ({}));
    const planId = String(body.planId ?? "");
    const environment: MpEnv = resolveEnv(body.environment);
    const returnUrl = safeReturnUrl(body.returnUrl);

    if (!/^[a-zA-Z0-9_-]+$/.test(planId)) return json({ error: "Plano inválido." }, 400);

    const plan = await loadPlan(supabase, planId);
    const payerEmail = String(user.email ?? "").trim();
    const reference = `${user.id}:${plan.id}`;
    const notificationUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook?env=${environment}`;
    const amount = plan.amount_cents / 100;

    // O Mercado Pago não deixa o dono da conta pagar a si mesmo (o botão do PIX fica travado).
    try {
      const seller = await mpFetch<any>(environment, "/users/me");
      const sellerEmail = String(seller?.email ?? "").trim().toLowerCase();
      if (sellerEmail && payerEmail && sellerEmail === payerEmail.toLowerCase()) {
        return json({
          error:
            "Este e-mail é o mesmo da conta Mercado Pago que recebe os pagamentos. O Mercado Pago não permite pagar a si mesmo: teste com outra conta de aluno e outra conta Mercado Pago.",
        }, 400);
      }
    } catch (e) {
      console.warn("Não foi possível conferir a conta vendedora", e);
    }
    const currency = (plan.currency || "brl").toUpperCase();

    if (plan.recurring_interval === "month") {
      const preapproval = await mpFetch<any>(environment, "/preapproval", {
        method: "POST",
        idempotencyKey: crypto.randomUUID(),
        body: {
          reason: plan.name,
          external_reference: reference,
          payer_email: payerEmail || undefined,
          back_url: returnUrl,
          notification_url: notificationUrl,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: amount,
            currency_id: currency,
          },
        },
      });

      const url = environment === "test"
        ? (preapproval.sandbox_init_point ?? preapproval.init_point)
        : (preapproval.init_point ?? preapproval.sandbox_init_point);
      if (!url) return json({ error: "Não foi possível abrir o pagamento." }, 400);
      return json({ checkoutUrl: url, kind: "monthly", preapprovalId: String(preapproval.id ?? "") });
    }

    const preference = await mpFetch<any>(environment, "/checkout/preferences", {
      method: "POST",
      idempotencyKey: crypto.randomUUID(),
      body: {
        items: [
          {
            id: plan.id,
            title: plan.name,
            description: plan.description ?? plan.name,
            quantity: 1,
            unit_price: amount,
            currency_id: currency,
          },
        ],
        payer: payerEmail ? { email: payerEmail } : undefined,
        external_reference: reference,
        metadata: { user_id: user.id, plan_id: plan.id },
        notification_url: notificationUrl,
        statement_descriptor: "CTFLPREP",
        back_urls: { success: returnUrl, pending: returnUrl, failure: returnUrl },
        auto_return: "approved",
      },
    });

    const url = environment === "test"
      ? (preference.sandbox_init_point ?? preference.init_point)
      : (preference.init_point ?? preference.sandbox_init_point);
    if (!url) return json({ error: "Não foi possível abrir o pagamento." }, 400);
    return json({ checkoutUrl: url, kind: "onetime", preferenceId: String(preference.id ?? "") });
  } catch (error) {
    console.error("mp-create-checkout error", error);
    const message = error instanceof Error ? error.message : "Erro ao iniciar o pagamento.";
    return json({ error: message }, 400);
  }
});
