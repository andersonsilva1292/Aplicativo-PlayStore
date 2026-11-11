import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMpConfig } from "@/hooks/useMpConfig";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";

interface Props {
  planId: string;
  /** Compra única ou assinatura mensal recorrente. */
  kind: "onetime" | "monthly";
  /** Valor em reais, apenas para o texto do botão. */
  amount: number;
}

/**
 * Leva o aluno ao ambiente de pagamento do Mercado Pago (Checkout Pro).
 * Lá ele escolhe PIX, cartão ou boleto; o acesso é liberado pelo aviso automático.
 */
export default function MercadoPagoCheckout({ planId, kind, amount }: Props) {
  const { config } = useMpConfig();
  const environment = config?.environment ?? "test";
  const [loading, setLoading] = useState(false);

  const openCheckout = async () => {
    setLoading(true);
    // Dentro de uma moldura (pré-visualização), o Mercado Pago recusa abrir.
    // Abrimos uma aba nova já no clique para o navegador não bloquear.
    let inFrame = false;
    try {
      inFrame = window.self !== window.top;
    } catch {
      inFrame = true;
    }
    const popup = inFrame ? window.open("about:blank", "_blank") : null;

    const { data, error } = await supabase.functions.invoke("mp-create-checkout", {
      body: {
        planId,
        environment,
        returnUrl: `${window.location.origin}/minha-conta?pagamento=retorno`,
      },
    });
    const payload = data as { checkoutUrl?: string; error?: string } | null;

    if (error || !payload?.checkoutUrl) {
      popup?.close();
      setLoading(false);
      let description = payload?.error;
      if (!description && error && "context" in error) {
        try {
          description = (await (error as { context: Response }).context.json())?.error;
        } catch {
          /* ignora */
        }
      }
      toast.error("Não foi possível abrir o pagamento", {
        description: description ?? "Tente novamente em instantes.",
      });
      return;
    }

    if (popup) {
      popup.location.href = payload.checkoutUrl;
      setLoading(false);
      toast.success("Pagamento aberto em uma nova aba", {
        description: "Conclua lá. Ao voltar, o acesso é liberado automaticamente.",
      });
      return;
    }
    if (inFrame) {
      window.open(payload.checkoutUrl, "_blank");
      setLoading(false);
      return;
    }
    window.location.href = payload.checkoutUrl;
  };

  const price = amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-3">
      <Button className="w-full min-h-12" disabled={loading} onClick={() => void openCheckout()}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Abrindo pagamento…
          </>
        ) : (
          <>
            <ExternalLink className="h-4 w-4" />
            {kind === "monthly" ? `Assinar por ${price} por mês` : `Pagar ${price}`}
          </>
        )}
      </Button>
      <p className="flex items-start gap-2 rounded-xl border border-border/50 bg-card/40 p-3.5 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        {kind === "monthly"
          ? "Você será levado ao ambiente do Mercado Pago para autorizar a cobrança mensal no cartão. Pode cancelar quando quiser em Minha Conta."
          : "Você será levado ao ambiente do Mercado Pago, onde pode pagar por PIX, cartão de crédito ou boleto. O acesso é liberado automaticamente após a confirmação."}
      </p>
    </div>
  );
}
