import { jsonHeaders, resolveEnv, serviceClient, verifyNotification } from "../_shared/mercadopago.ts";
import { syncAuthorizedPayment, syncPayment, syncPreapproval } from "../_shared/mp-sync.ts";

/** Aviso automático do Mercado Pago: pagamento aprovado, recusado, estornado ou renovação. */
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const url = new URL(req.url);
  const env = resolveEnv(url.searchParams.get("env"));

  try {
    const body = await req.json().catch(() => ({}));
    const dataId = String(body?.data?.id ?? url.searchParams.get("data.id") ?? "");
    const topic = String(body?.type ?? body?.topic ?? url.searchParams.get("topic") ?? "");

    if (!dataId) {
      return new Response(JSON.stringify({ received: true, ignored: "sem id" }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    const valid = await verifyNotification(req, dataId);
    if (!valid) {
      console.error("Aviso com assinatura inválida", { topic, dataId });
      return new Response("invalid signature", { status: 401 });
    }

    const supabase = serviceClient();

    switch (topic) {
      case "payment":
      case "payment.created":
      case "payment.updated":
        await syncPayment(supabase, env, dataId);
        break;
      case "subscription_preapproval":
      case "preapproval":
        await syncPreapproval(supabase, env, dataId);
        break;
      case "subscription_authorized_payment":
        await syncAuthorizedPayment(supabase, env, dataId);
        break;
      default:
        console.log("Aviso não tratado:", topic);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: jsonHeaders });
  } catch (error) {
    console.error("mp-webhook error", error);
    return new Response("webhook error", { status: 400 });
  }
});
