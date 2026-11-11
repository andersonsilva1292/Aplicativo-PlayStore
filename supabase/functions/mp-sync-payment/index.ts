import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { jsonHeaders, resolveEnv, serviceClient } from "../_shared/mercadopago.ts";
import { syncPayment } from "../_shared/mp-sync.ts";

/** Confirmação na volta da compra: consulta o pagamento até ser reconhecido. */

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, ...jsonHeaders } });

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

    const body = await req.json().catch(() => ({}));
    const mpPaymentId = String(body.mpPaymentId ?? "");
    const environment = resolveEnv(body.environment);
    if (!/^\d+$/.test(mpPaymentId)) return json({ error: "Pagamento inválido." }, 400);

    // O pagamento consultado precisa pertencer a quem está pedindo.
    const { data: owned } = await supabase
      .from("payments")
      .select("user_id")
      .eq("mp_payment_id", mpPaymentId)
      .maybeSingle();
    if (owned && owned.user_id && owned.user_id !== user.id) {
      return json({ error: "Pagamento não encontrado." }, 404);
    }

    const result = await syncPayment(supabase, environment, mpPaymentId);
    return json(result);
  } catch (error) {
    console.error("mp-sync-payment error", error);
    const message = error instanceof Error ? error.message : "Não foi possível confirmar o pagamento.";
    return json({ error: message }, 400);
  }
});
