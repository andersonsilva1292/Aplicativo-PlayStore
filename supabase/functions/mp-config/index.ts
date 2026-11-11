import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { defaultEnv, jsonHeaders, publicKey } from "../_shared/mercadopago.ts";

/** Chave pública e ambiente de cobrança (valores publicáveis, sem segredo). */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const env = defaultEnv();
    return new Response(JSON.stringify({ environment: env, publicKey: publicKey(env) }), {
      status: 200,
      headers: { ...corsHeaders, ...jsonHeaders },
    });
  } catch (error) {
    console.error("mp-config error", error);
    return new Response(JSON.stringify({ environment: null, publicKey: null }), {
      status: 200,
      headers: { ...corsHeaders, ...jsonHeaders },
    });
  }
});
