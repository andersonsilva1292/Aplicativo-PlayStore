import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { jsonHeaders, mpFetch, resolveEnv, serviceClient } from "../_shared/mercadopago.ts";
import { grantAccess, revokeAccess } from "../_shared/access.ts";

/** Cancelamento da assinatura pelo próprio aluno, mantendo o período já pago. */

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
    if (!user) return json({ error: "Sessão inválida. Entre novamente." }, 401);

    const body = await req.json().catch(() => ({}));
    const environment = resolveEnv(body.environment);

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, mp_preapproval_id, current_period_end, status")
      .eq("user_id", user.id)
      .eq("environment", environment)
      .not("mp_preapproval_id", "is", null)
      .in("status", ["active", "paused", "incomplete"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.mp_preapproval_id) {
      return json({ error: "Nenhuma assinatura ativa nesta conta." }, 404);
    }

    await mpFetch(environment, `/preapproval/${subscription.mp_preapproval_id}`, {
      method: "PUT",
      body: { status: "cancelled" },
    });

    const periodEnd = subscription.current_period_end as string | null;
    const keepUntil = periodEnd && new Date(periodEnd) > new Date() ? periodEnd : null;

    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    if (keepUntil) {
      await grantAccess(supabase, user.id, "subscription", keepUntil);
    } else {
      await revokeAccess(supabase, user.id);
    }

    return json({ canceled: true, accessUntil: keepUntil });
  } catch (error) {
    console.error("mp-cancel-subscription error", error);
    const message = error instanceof Error ? error.message : "Não foi possível cancelar a assinatura.";
    return json({ error: message }, 400);
  }
});
