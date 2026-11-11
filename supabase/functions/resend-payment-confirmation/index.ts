import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { paymentById, sendPaymentConfirmation, serviceClient } from "../_shared/payment-email.ts";

const APP_URL = "https://estudosimuladorctfl.lovable.app";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ error: "Sessão inválida." }, 401);

  const authClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  const { data: userData } = await authClient.auth.getUser(token);
  const user = userData?.user;
  if (!user) return json({ error: "Sessão inválida." }, 401);

  const admin = serviceClient();

  const { data: isMaster } = await admin.rpc("is_master_admin", { _user_id: user.id });
  if (!isMaster) return json({ error: "Acesso restrito ao proprietário." }, 403);

  let paymentId: unknown;
  try {
    paymentId = (await req.json())?.paymentId;
  } catch {
    return json({ error: "Corpo inválido." }, 400);
  }
  if (typeof paymentId !== "string" || !/^[0-9a-f-]{36}$/i.test(paymentId)) {
    return json({ error: "Pagamento inválido." }, 400);
  }

  const payment = await paymentById(admin, paymentId);
  if (!payment) return json({ error: "Pagamento não encontrado." }, 404);

  const result = await sendPaymentConfirmation(admin, payment, { force: true, appUrl: APP_URL });
  if (!result.sent) return json({ error: result.error ?? "Não foi possível enviar." }, 400);

  return json({ sent: true });
});
