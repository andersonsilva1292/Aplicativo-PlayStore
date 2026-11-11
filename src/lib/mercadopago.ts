import { initMercadoPago } from "@mercadopago/sdk-react";
import { supabase } from "@/integrations/supabase/client";

/** Ambiente de cobrança em uso: testes ou cobrança real. */
export type MpEnvironment = "test" | "prod";

export interface MpConfig {
  environment: MpEnvironment;
  publicKey: string | null;
}

const FALLBACK: MpConfig = { environment: "test", publicKey: null };

let cached: Promise<MpConfig> | null = null;
let sdkStarted = false;

/** Chave pública e ambiente vêm do servidor: nada sensível fica no navegador. */
export function getMercadoPagoConfig(): Promise<MpConfig> {
  if (!cached) {
    cached = supabase.functions
      .invoke("mp-config")
      .then(({ data, error }) => {
        if (error || !data?.publicKey) return FALLBACK;
        return {
          environment: data.environment === "prod" ? "prod" : "test",
          publicKey: String(data.publicKey),
        } as MpConfig;
      })
      .catch(() => FALLBACK);
  }
  return cached;
}

/** Prepara o formulário de cartão do Mercado Pago uma única vez por sessão. */
export async function ensureMercadoPago(): Promise<MpConfig> {
  const config = await getMercadoPagoConfig();
  if (config.publicKey && !sdkStarted) {
    initMercadoPago(config.publicKey, { locale: "pt-BR" });
    sdkStarted = true;
  }
  return config;
}
