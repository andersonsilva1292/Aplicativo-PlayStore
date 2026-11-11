import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import AdminLessonMedia from "@/components/AdminLessonMedia";
import Seo from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/hooks/useAccess";
import { Button } from "@/components/ui/button";
import {
  Activity,
  BadgeDollarSign,
  CheckCircle2,
  Clock,
  Loader2,
  MailCheck,
  MailWarning,
  RefreshCw,
  Send,
  Undo2,
  Users,
  XCircle,
} from "lucide-react";


interface ProfileRow {
  user_id: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
  trial_started_at: string;
}
interface PaymentRow {
  id: string;
  user_id: string | null;
  email: string | null;
  product_name: string | null;
  amount_cents: number;
  currency: string;
  method: string;
  status: string;
  created_at: string;
  paid_at: string | null;
  environment: string;
  confirmation_email_sent_at: string | null;
  confirmation_email_error: string | null;
  refunded_at: string | null;
  refund_amount_cents: number;


}
interface AccessRow {
  user_id: string;
  active: boolean;
  source: string;
  expires_at: string | null;
}
interface SessionRow {
  user_id: string;
  last_seen_at: string;
}

const money = (cents: number, currency: string) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: currency.toUpperCase() });

const dt = (value: string | null) =>
  value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando",
  paid: "Aprovado",
  failed: "Recusado",
  expired: "Expirado",
  refunded: "Reembolsado",
};

/** Área exclusiva do proprietário: cadastros, pagamentos e sessões ativas. */
export default function AdminSite() {
  const { loading: accessLoading, isMasterAdmin } = useAccess();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [access, setAccess] = useState<AccessRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [resending, setResending] = useState<string | null>(null);
  const [refunding, setRefunding] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [p, pay, acc, sess] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, display_name, email, created_at, trial_started_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select(
          "id, user_id, email, product_name, amount_cents, currency, method, status, created_at, paid_at, environment, confirmation_email_sent_at, confirmation_email_error, refunded_at, refund_amount_cents"
        )


        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("course_access").select("user_id, active, source, expires_at"),
      supabase.from("user_sessions").select("user_id, last_seen_at"),
    ]);
    setProfiles((p.data as ProfileRow[]) ?? []);
    setPayments((pay.data as PaymentRow[]) ?? []);
    setAccess((acc.data as AccessRow[]) ?? []);
    setSessions((sess.data as SessionRow[]) ?? []);
    setLoading(false);
  };

  /** Reenvia a confirmação de pagamento para o aluno. */
  const resend = async (payment: PaymentRow) => {
    setResending(payment.id);
    const { data, error } = await supabase.functions.invoke("resend-payment-confirmation", {
      body: { paymentId: payment.id },
    });
    setResending(null);

    const message =
      (data as { error?: string } | null)?.error ??
      (error ? "Não foi possível enviar agora. Verifique o domínio de e-mail." : null);

    if (message) {
      toast.error("Confirmação não enviada", { description: message });
      return;
    }
    toast.success("Confirmação enviada", {
      description: `E-mail reenviado para ${payment.email}.`,
    });
    void load();
  };

  /** Garantia de 7 dias: devolve o valor e encerra o acesso do aluno. */
  const refund = async (payment: PaymentRow) => {
    const confirmed = window.confirm(
      `Confirmar reembolso de ${money(payment.amount_cents, payment.currency)} para ${
        payment.email ?? "este aluno"
      }? O acesso será encerrado imediatamente.`
    );
    if (!confirmed) return;

    setRefunding(payment.id);
    const { data, error } = await supabase.functions.invoke("mp-refund-payment", {
      body: { paymentId: payment.id },
    });
    setRefunding(null);

    const message =
      (data as { error?: string } | null)?.error ??
      (error ? "Não foi possível reembolsar agora." : null);
    if (message) {
      toast.error("Reembolso não realizado", { description: message });
      return;
    }
    toast.success("Reembolso realizado", { description: "Acesso encerrado e valor devolvido." });
    void load();
  };



  useEffect(() => {
    if (isMasterAdmin) void load();
  }, [isMasterAdmin]);

  const accessByUser = useMemo(
    () => new Map(access.map((a) => [a.user_id, a])),
    [access]
  );
  const sessionByUser = useMemo(
    () => new Map(sessions.map((s) => [s.user_id, s])),
    [sessions]
  );

  const onlineCount = sessions.filter(
    (s) => Date.now() - new Date(s.last_seen_at).getTime() < 5 * 60_000
  ).length;
  const paidPayments = payments.filter((p) => p.status === "paid");
  const revenue = paidPayments.reduce((sum, p) => sum + p.amount_cents, 0);
  const activeAccess = access.filter(
    (a) => a.active && (!a.expires_at || new Date(a.expires_at) > new Date())
  ).length;

  if (accessLoading) {
    return (
      <AppLayout>
        <div className="min-h-[60dvh] grid place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  if (!isMasterAdmin) return <Navigate to="/inicio" replace />;

  return (
    <AppLayout>
      <Seo
        title="Administração do site | Anderson Academy"
        description="Painel do proprietário: cadastros, pagamentos e sessões ativas."
        path="/administracao"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 py-6 sm:py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gradient">
              Administração do site
            </h1>
            <p className="text-sm text-muted-foreground">
              Visão exclusiva do proprietário: quem entrou, quem está online e quem pagou.
            </p>
          </div>
          <Button variant="outline" onClick={load} className="sm:ml-auto min-h-11">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Users, label: "Cadastros", value: String(profiles.length) },
            { icon: Activity, label: "Online agora", value: String(onlineCount) },
            { icon: CheckCircle2, label: "Acessos ativos", value: String(activeAccess) },
            { icon: BadgeDollarSign, label: "Receita aprovada", value: money(revenue, "brl") },
          ].map((s) => (
            <div key={s.label} className="card-modern p-4">
              <s.icon className="h-4 w-4 text-primary" />
              <p className="mt-2 text-xl sm:text-2xl font-bold font-display">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <AdminLessonMedia />

        {loading ? (
          <div className="min-h-40 grid place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <section className="card-modern p-4 sm:p-5 space-y-3">
              <h2 className="font-display text-lg font-semibold">Alunos cadastrados</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="text-xs uppercase text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 pr-3">Aluno</th>
                      <th className="text-left py-2 pr-3">Cadastro</th>
                      <th className="text-left py-2 pr-3">Acesso</th>
                      <th className="text-left py-2">Última atividade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => {
                      const acc = accessByUser.get(p.user_id);
                      const trialActive =
                        new Date(p.trial_started_at).getTime() + 24 * 3600_000 > Date.now();
                      const paid =
                        !!acc?.active && (!acc.expires_at || new Date(acc.expires_at) > new Date());
                      const sess = sessionByUser.get(p.user_id);
                      const online =
                        !!sess && Date.now() - new Date(sess.last_seen_at).getTime() < 5 * 60_000;
                      return (
                        <tr key={p.user_id} className="border-b border-border/30">
                          <td className="py-2.5 pr-3">
                            <span className="block font-medium">{p.display_name ?? "—"}</span>
                            <span className="block text-xs text-muted-foreground">
                              {p.email ?? "—"}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-muted-foreground">{dt(p.created_at)}</td>
                          <td className="py-2.5 pr-3">
                            {paid ? (
                              <span className="text-primary">Pago ({acc?.source})</span>
                            ) : trialActive ? (
                              <span className="text-muted-foreground">Teste 24h</span>
                            ) : (
                              <span className="text-destructive">Bloqueado</span>
                            )}
                          </td>
                          <td className="py-2.5 text-muted-foreground">
                            {online ? (
                              <span className="text-primary">Online agora</span>
                            ) : (
                              dt(sess?.last_seen_at ?? null)
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card-modern p-4 sm:p-5 space-y-3">
              <h2 className="font-display text-lg font-semibold">Pagamentos</h2>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum pagamento registrado ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[920px]">
                    <thead className="text-xs uppercase text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 pr-3">Cliente</th>
                        <th className="text-left py-2 pr-3">Produto</th>
                        <th className="text-left py-2 pr-3">Valor</th>
                        <th className="text-left py-2 pr-3">Forma</th>
                        <th className="text-left py-2 pr-3">Situação</th>
                        <th className="text-left py-2 pr-3">Data</th>
                        <th className="text-left py-2 pr-3">Confirmação por e-mail</th>
                        <th className="text-left py-2">Reembolso</th>
                      </tr>
                    </thead>

                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-border/30">
                          <td className="py-2.5 pr-3">{p.email ?? "—"}</td>
                          <td className="py-2.5 pr-3 text-muted-foreground">
                            {p.product_name ?? "—"}
                          </td>
                          <td className="py-2.5 pr-3">{money(p.amount_cents, p.currency)}</td>
                          <td className="py-2.5 pr-3 uppercase text-xs">{p.method}</td>
                          <td className="py-2.5 pr-3">
                            <span
                              className={
                                p.status === "paid"
                                  ? "text-primary inline-flex items-center gap-1"
                                  : p.status === "pending"
                                    ? "text-muted-foreground inline-flex items-center gap-1"
                                    : "text-destructive inline-flex items-center gap-1"
                              }
                            >
                              {p.status === "paid" ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : p.status === "pending" ? (
                                <Clock className="h-3.5 w-3.5" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                              {STATUS_LABEL[p.status] ?? p.status}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-muted-foreground">
                            {dt(p.paid_at ?? p.created_at)}
                          </td>
                          <td className="py-2.5">
                            {p.status !== "paid" ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                {p.confirmation_email_sent_at ? (
                                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                                    <MailCheck className="h-3.5 w-3.5" />
                                    Enviado em {dt(p.confirmation_email_sent_at)}
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-1 text-xs text-destructive"
                                    title={p.confirmation_email_error ?? undefined}
                                  >
                                    <MailWarning className="h-3.5 w-3.5" />
                                    Não enviado
                                  </span>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="min-h-9"
                                  disabled={resending === p.id || !p.email}
                                  onClick={() => void resend(p)}
                                >
                                  {resending === p.id ? (
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                  ) : (
                                    <Send className="h-3.5 w-3.5 mr-1.5" />
                                  )}
                                  Reenviar
                                </Button>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5">
                            {p.status === "refunded" ? (
                              <span className="text-xs text-muted-foreground">
                                Devolvido {money(p.refund_amount_cents || p.amount_cents, p.currency)} em{" "}
                                {dt(p.refunded_at)}
                              </span>
                            ) : p.status === "paid" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="min-h-9"
                                disabled={refunding === p.id}
                                onClick={() => void refund(p)}
                              >
                                {refunding === p.id ? (
                                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                ) : (
                                  <Undo2 className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                Reembolsar
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>

                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
