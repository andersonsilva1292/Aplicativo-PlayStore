import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BadgeCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccess } from "@/hooks/useAccess";

interface PaidPayment {
  id: string;
  product_name: string | null;
  amount_cents: number;
  currency: string;
  method: string;
  paid_at: string | null;
}

const SEEN_KEY = "ctfl-prep:payment-notice-seen";

function seen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function markSeen(id: string) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...seen(), id])].slice(-20)));
  } catch {
    /* armazenamento indisponível: apenas não persiste */
  }
}

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: (currency || "brl").toUpperCase(),
  }).format(cents / 100);
}

function dateTime(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

/**
 * Notificação in-app de pagamento aprovado: substitui a dependência de e-mail.
 * Aparece uma única vez por compra (controle local) e libera o acesso na hora.
 */
export default function PaymentApprovedNotice() {
  const { user } = useAuth();
  const { refresh } = useAccess();
  const [payment, setPayment] = useState<PaidPayment | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const check = async () => {
      const { data } = await supabase
        .from("payments")
        .select("id, product_name, amount_cents, currency, method, paid_at")
        .eq("user_id", user.id)
        .eq("status", "paid")
        .order("paid_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled || !data) return;
      if (seen().includes(data.id)) return;
      setPayment(data as PaidPayment);
      void refresh();
    };

    void check();

    const channel = supabase
      .channel(`payments-notice-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments", filter: `user_id=eq.${user.id}` },
        () => void check()
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  const close = () => {
    if (payment) markSeen(payment.id);
    setPayment(null);
  };

  return (
    <AnimatePresence>
      {payment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-notice-title"
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-md" onClick={close} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="glass relative w-full max-w-lg rounded-3xl border border-primary/30 p-6 sm:p-9 text-center shadow-glow"
          >
            <button
              onClick={close}
              className="absolute right-3 top-3 min-h-11 min-w-11 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              aria-label="Fechar aviso"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.12, type: "spring", damping: 12, stiffness: 200 }}
              className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-primary/15"
            >
              <BadgeCheck className="h-10 w-10 text-primary" />
            </motion.div>

            <h2 id="payment-notice-title" className="font-display text-xl sm:text-2xl font-bold text-gradient">
              Pagamento aprovado
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu acesso completo já está liberado. Bons estudos!
            </p>

            <dl className="mt-6 space-y-2 rounded-2xl border border-border/50 bg-white/5 p-4 text-left text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Produto</dt>
                <dd className="text-right font-medium">{payment.product_name ?? "Acesso Completo"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Valor</dt>
                <dd className="font-medium">{money(payment.amount_cents, payment.currency)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Forma de pagamento</dt>
                <dd className="font-medium">{payment.method === "pix" ? "PIX" : "Cartão"}</dd>
              </div>
              {payment.paid_at && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Data</dt>
                  <dd className="font-medium">{dateTime(payment.paid_at)}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <Link
                to="/inicio"
                onClick={close}
                className="flex-1 min-h-11 grid place-items-center rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                Começar a estudar
              </Link>
              <button
                onClick={close}
                className="flex-1 min-h-11 rounded-xl border border-border/60 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
