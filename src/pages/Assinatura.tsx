import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import MercadoPagoCheckout from "@/components/MercadoPagoCheckout";
import { useMpConfig } from "@/hooks/useMpConfig";
import { useAccess, formatCountdown } from "@/hooks/useAccess";

import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";

type Plan = "onetime";

const PLANS: Record<
  Plan,
  { priceId: string; label: string; price: string; note: string; amount: number }
> = {
  onetime: {
    amount: 19.99,
    priceId: "acesso_fundador_onetime",
    label: "Acesso Completo",
    price: "R$ 19,99",
    note: "Pagamento único · 12 meses de acesso",
  },
};

const BENEFITS = [
  "Preparatório completo CTFL 4.0 (Syllabus v4.0) com 1.000 questões",
  "Curso de Automação de Testes: Java, Selenium, Cucumber, JUnit e ExtentReports",
  "Vídeo aulas com IA, apostilas em PDF e simulador de código com correção automática",
  "Tutor de IA em tempo real para tirar dúvidas em cada aula",
  "Simulados cronometrados, relatórios de desempenho e trilhas adaptativas",
  "Certificado de conclusão dos módulos de automação",
];

export default function Assinatura() {
  const { source, trialMsLeft, expiresAt } = useAccess();
  const { loading: configLoading } = useMpConfig();
  const plan: Plan = "onetime";


  return (
    <AppLayout>
      <Seo
        title="Acesso completo CTFL 4.0 + Automação de Testes | Anderson Academy"
        description="Assine o preparatório CTFL 4.0 com simulados, trilhas e tutor de IA, mais o curso de Automação de Testes com Java, Selenium e Cucumber. PIX ou cartão."
        path="/assinatura"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>


      <div className="mx-auto w-full max-w-5xl px-3 sm:px-4 py-6 sm:py-10 space-y-6">
        {/* Situação atual do acesso */}
        {source === "trial" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-modern p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <Timer className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Teste gratuito ativo</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Seu acesso liberado termina em{" "}
                <span className="font-mono text-foreground">{formatCountdown(trialMsLeft)}</span>.
                Garanta o acesso completo antes do bloqueio.
              </p>
            </div>
          </motion.div>
        )}
        {source === "none" && (
          <div className="card-modern p-4 sm:p-5 flex items-start gap-3 border-destructive/30">
            <Clock className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Seu teste gratuito de 24 horas terminou</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Os módulos de estudo estão bloqueados. Garanta o acesso abaixo para retomar de
                onde parou — todo o seu progresso está salvo.
              </p>
            </div>
          </div>
        )}
        {(source === "payment" || source === "subscription" || source === "master_admin") && (
          <div className="card-modern p-4 sm:p-5 flex items-start gap-3">
            <BadgeCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Acesso completo ativo</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {source === "master_admin"
                  ? "Você é o proprietário da plataforma e tem acesso irrestrito."
                  : expiresAt
                    ? `Válido até ${expiresAt.toLocaleDateString("pt-BR")}.`
                    : "Renovação automática ativa."}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] items-start">
          {/* Oferta */}
          <section className="card-modern p-5 sm:p-7 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Pagamento único · PIX ou cartão
            </div>

            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gradient">
                Certificação CTFL 4.0 + Automação de Testes
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Dois programas em uma única plataforma: aprovação no exame CTFL e a stack de
                automação usada no mercado. Aprenda no seu ritmo, com correção automática e
                tutor de IA.
              </p>
            </div>

            <div className="flex items-end gap-3">
                            <span className="font-display text-4xl font-bold text-foreground">
                {PLANS[plan].price}
              </span>
              <span className="text-xs text-muted-foreground pb-1.5">{PLANS[plan].note}</span>
            </div>

            <ul className="space-y-2.5">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-card/40 p-3.5">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Garantia de 7 dias.</span> Se não
                fizer sentido para você, basta pedir o reembolso integral pelo e-mail de suporte —
                sem burocracia.
              </p>
            </div>
          </section>

          {/* Pagamento */}
          <section className="card-modern p-5 sm:p-7 space-y-5">
            <h2 className="font-display text-lg font-semibold">Finalizar compra</h2>

            <div className="space-y-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Formas de pagamento
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  className="min-h-16 rounded-xl border border-border/50 px-3.5 py-3"
                >
                  <QrCode className="h-4 w-4 text-primary" />
                  <span className="mt-1 block text-sm font-semibold">PIX</span>
                  <span className="block text-xs text-muted-foreground">
                    Liberação em poucos minutos
                  </span>
                </div>
                <div className="min-h-16 rounded-xl border border-border/50 px-3.5 py-3">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="mt-1 block text-sm font-semibold">Cartão de crédito</span>
                  <span className="block text-xs text-muted-foreground">
                    Aprovação na hora
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {"Você escolhe a forma de pagamento na próxima etapa, no ambiente do Mercado Pago: PIX, cartão de crédito ou boleto."}
              </p>

            </div>


            {configLoading ? (
              <p className="text-xs text-muted-foreground">Preparando o pagamento…</p>
            ) : (
              <MercadoPagoCheckout
                key={PLANS[plan].priceId}
                planId={PLANS[plan].priceId}
                kind={plan}
                amount={PLANS[plan].amount}
              />
            )}

            <p className="text-center text-[11px] text-muted-foreground/70">
              Pagamento processado em ambiente seguro. Não armazenamos dados do seu cartão.
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
