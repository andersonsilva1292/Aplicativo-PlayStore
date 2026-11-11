import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccess, formatCountdown } from "@/hooks/useAccess";
import { getMercadoPagoConfig } from "@/lib/mercadopago";
import {
  BadgeCheck,
  CreditCard,
  Loader2,
  Receipt,
  ShieldCheck,
  Timer,
  XCircle,
} from "lucide-react";

interface PaymentRow {
  id: string;
  product_name: string | null;
  amount_cents: number;
  currency: string;
  method: string;
  status: string;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
}

interface SubscriptionRow {
  status: string;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

const money = (cents: number, currency: string) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: (currency || "brl").toUpperCase() });

const date = (value: string | null) =>
  value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  failed: "Não aprovado",
  expired: "Expirado",
  refunded: "Reembolsado",
};

const METHOD_LABEL: Record<string, string> = { pix: "PIX", card: "Cartão de crédito" };

export default function MinhaConta() {
  const { user, profile } = useAuth();
  const { loading: accessLoading, source, expiresAt, trialMsLeft, isMasterAdmin, refresh } =
    useAccess();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { environment } = await getMercadoPagoConfig();
    const [pay, sub] = await Promise.all([
      supabase
        .from("payments")
        .select("id, product_name, amount_cents, currency, method, status, paid_at, refunded_at, created_at")
        .eq("environment", environment)
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select("status, price_id, current_period_end, cancel_at_period_end")
        .eq("environment", environment)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setPayments((pay.data as PaymentRow[]) ?? []);
    setSubscription((sub.data as SubscriptionRow | null) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Volta do ambiente de pagamento: pergunta direto ao Mercado Pago e acompanha
   * a confirmação por até 10 minutos (PIX e boleto podem demorar).
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pagamento") !== "retorno") return;

    const mpPaymentId = params.get("payment_id") ?? params.get("collection_id") ?? "";
    let cancelled = false;
    let attempts = 0;
    setConfirming(true);

    const tick = async () => {
      if (cancelled) return;
      attempts += 1;
      const { environment } = await getMercadoPagoConfig();

      if (/^\d+$/.test(mpPaymentId)) {
        await supabase.functions
          .invoke("mp-sync-payment", { body: { mpPaymentId, environment } })
          .catch(() => null);
      }
      await refresh();
      await load();
      if (cancelled) return;

      const { data } = await supabase
        .from("payments")
        .select("id")
        .eq("environment", environment)
        .eq("status", "paid")
        .limit(1);

      if ((data?.length ?? 0) > 0) {
        setConfirming(false);
        toast.success("Pagamento confirmado", { description: "Seu acesso já está liberado." });
        return;
      }
      if (attempts >= 120) {
        setConfirming(false);
        return;
      }
      timer = window.setTimeout(() => void tick(), 5000);
    };

    let timer = window.setTimeout(() => void tick(), 3000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [load, refresh]);

  /** Cancelamento imediato da renovação, mantendo o acesso até o fim do período pago. */
  const cancelSubscription = async () => {
    const confirmed = window.confirm(
      "Cancelar a renovação automática? Você continua com acesso até o fim do período já pago."
    );
    if (!confirmed) return;

    setPortalLoading(true);
    const { environment } = await getMercadoPagoConfig();
    const { data, error } = await supabase.functions.invoke("mp-cancel-subscription", {
      body: { environment },
    });
    setPortalLoading(false);

    const message =
      (data as { error?: string } | null)?.error ??
      (error ? "Não foi possível cancelar agora. Tente novamente." : null);
    if (message) {
      toast.error("Cancelamento não concluído", { description: message });
      return;
    }
    toast.success("Renovação cancelada", {
      description: "Seu acesso continua até o fim do período já pago.",
    });
    void load();
  };

  const accessLabel = () => {
    if (isMasterAdmin) return "Acesso irrestrito de proprietário";
    if (source === "payment") return expiresAt ? `Acesso pago válido até ${expiresAt.toLocaleDateString("pt-BR")}` : "Acesso pago ativo";
    if (source === "subscription")
      return subscription?.cancel_at_period_end && subscription.current_period_end
        ? `Assinatura cancelada — acesso até ${new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}`
        : "Assinatura ativa com renovação automática";
    if (source === "beta") return "Beta público — acesso completo liberado";
    if (source === "trial") return `Teste gratuito — termina em ${formatCountdown(trialMsLeft)}`;
    return "Sem acesso ativo";
  };

  return (
    <AppLayout>
      <Seo
        title="Minha conta e cobrança | Anderson Academy"
        description="Acompanhe seu acesso, assinatura e histórico de compras na plataforma Anderson Academy."
        path="/minha-conta"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="mx-auto w-full max-w-4xl px-3 sm:px-4 py-6 sm:py-10 space-y-6">
        <header>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gradient">Minha conta</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {profile?.display_name ?? user?.email} · {user?.email}
          </p>
        </header>

        {confirming && (
          <section className="card-modern p-5 sm:p-6 flex items-start gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Confirmando seu pagamento</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pode levar alguns minutos no PIX ou boleto. Deixe esta página aberta — o acesso é
                liberado automaticamente assim que a confirmação chegar.
              </p>
            </div>
          </section>
        )}

        {/* Situação do acesso */}
        <section className="card-modern p-5 sm:p-6 flex items-start gap-3">
          {source === "trial" ? (
            <Timer className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          ) : (
            <BadgeCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Situação do acesso</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {accessLoading ? "Verificando…" : accessLabel()}
            </p>
          </div>
          {source === "none" && (
            <Button asChild size="sm">
              <Link to="/assinatura">Liberar acesso</Link>
            </Button>
          )}
        </section>

        {/* Assinatura e cobrança */}
        <section className="card-modern p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4.5 w-4.5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Assinatura e cobrança</h2>
          </div>

          {subscription ? (
            <dl className="grid gap-3 sm:grid-cols-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Plano</dt>
                <dd className="font-medium">
                  {subscription.price_id === "acesso_fundador_mensal" ? "Mensal (plano antigo)" : subscription.price_id}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Situação</dt>
                <dd className="font-medium">
                  {subscription.cancel_at_period_end ? "Cancelamento agendado" : subscription.status === "active" ? "Ativa" : subscription.status}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {subscription.cancel_at_period_end ? "Acesso até" : "Próxima cobrança"}
                </dt>
                <dd className="font-medium">
                  {subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR")
                    : "—"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Você não tem assinatura recorrente ativa. Compras únicas aparecem no histórico abaixo.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5">
            {subscription && !subscription.cancel_at_period_end && subscription.status === "active" && (
              <Button
                onClick={() => void cancelSubscription()}
                disabled={portalLoading}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Cancelar renovação
              </Button>
            )}
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/assinatura">Ver planos</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Ao cancelar, o acesso continua até o fim do período já pago e nenhuma nova cobrança é
            feita. Para trocar o cartão, cancele e assine novamente com o novo cartão.
          </p>
        </section>

        {/* Histórico */}
        <section className="card-modern p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-4.5 w-4.5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Histórico de compras</h2>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma compra registrada nesta conta.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3">Produto</th>
                    <th className="py-2 pr-3">Valor</th>
                    <th className="py-2 pr-3">Forma</th>
                    <th className="py-2 pr-3">Situação</th>
                    <th className="py-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t border-border/40">
                      <td className="py-2.5 pr-3">{p.product_name ?? "—"}</td>
                      <td className="py-2.5 pr-3 font-mono">{money(p.amount_cents, p.currency)}</td>
                      <td className="py-2.5 pr-3">{METHOD_LABEL[p.method] ?? p.method}</td>
                      <td className="py-2.5 pr-3">{STATUS_LABEL[p.status] ?? p.status}</td>
                      <td className="py-2.5">{date(p.refunded_at ?? p.paid_at ?? p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card-modern p-5 sm:p-6 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Garantia de 7 dias.</span> Peça o
            reembolso integral pelo e-mail de suporte dentro de 7 dias da compra; o valor é devolvido
            e o acesso encerrado automaticamente.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
