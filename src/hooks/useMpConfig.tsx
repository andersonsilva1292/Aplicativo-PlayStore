import { useEffect, useState } from "react";
import { getMercadoPagoConfig, type MpConfig } from "@/lib/mercadopago";

/** Disponibiliza o ambiente de cobrança e informa se o pagamento está pronto para uso. */
export function useMpConfig(): { config: MpConfig | null; ready: boolean; loading: boolean } {
  const [config, setConfig] = useState<MpConfig | null>(null);

  useEffect(() => {
    let active = true;
    void getMercadoPagoConfig().then((value) => {
      if (active) setConfig(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return { config, ready: !!config?.publicKey, loading: config === null };
}
