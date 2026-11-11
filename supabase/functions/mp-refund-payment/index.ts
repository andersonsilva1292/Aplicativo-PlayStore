import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { jsonHeaders, mpFetch, resolveEnv, serviceClient } from "../_shared/mercadopago.ts";
import { revokeAccess } from "../_shared/access.ts";

/** Estorno acionado pelo proprietário na área de administração. */

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, ...jsonHeaders } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const supabase = serviceClient();

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Faça login para continuar." }, 401);
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (!user) return json({ error: "Sessão inválida." }, 401);

    const { data: isAdmin } = await supabase.rpc("is_master_admin", { _user_id: user.id });
    if (!isAdmin) return json({ error: "Ação restrita ao proprietário." }, 403);

    const body = await req.json().catch(() => ({}));
    const paymentId = String(body.paymentId ?? "");
    if (!UUID.test(paymentId)) return json({ error: "Compra inválida." }, 400);

    const { data: payment } = await supabase
      .from("payments")
      .select("id, user_id, mp_payment_id, amount_cents, status, environment")
      .eq("id", paymentId)
      .maybeSingle();

    if (!payment) return json({ error: "Compra não encontrada." }, 404);
    if (payment.status === "refunded") return json({ error: "Compra já reembolsada." }, 400);
    if (payment.status !== "paid") return json({ error: "Só compras pagas podem ser reembolsadas." }, 400);
    if (!payment.mp_payment_id) return json({ error: "Compra sem pagamento no Mercado Pago." }, 400);

    const environment = resolveEnv(payment.environment ?? body.environment);

    await mpFetch(environment, `/v1/payments/${payment.mp_payment_id}/refunds`, {
      method: "POST",
      body: {},
      idempotencyKey: `refund-${payment.id}`,
    });

    await supabase
      .from("payments")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString(),
        refund_amount_cents: payment.amount_cents ?? 0,
        failure_reason: "Reembolso emitido pelo proprietário",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (payment.user_id) await revokeAccess(supabase, payment.user_id as string);

    return json({ refunded: true });
  } catch (error) {
    console.error("mp-refund-payment error", error);
    const message = error instanceof Error ? error.message : "Não foi possível reembolsar.";
    return json({ error: message }, 400);
  }
});
