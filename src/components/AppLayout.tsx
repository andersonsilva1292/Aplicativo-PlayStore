import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useAccess, formatCountdown } from "@/hooks/useAccess";
import { motion, AnimatePresence } from "framer-motion";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";
import LanguageToggle from "@/components/LanguageToggle";
import PaymentApprovedNotice from "@/components/PaymentApprovedNotice";
import InstallAppButton from "@/components/InstallAppButton";
import DynamicIslandTutor from "@/components/DynamicIslandTutor";
import {
  ArrowLeft,
  GraduationCap,
  CreditCard,
  LayoutGrid,
  LogOut,
  Shield,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";

/**
 * Layout enxuto: sem menu lateral. A navegação acontece no painel central
 * (`/inicio`), e o topo mantém retorno ao painel, idioma, privacidade e saída.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile, user } = useAuth();
  const { t } = useLanguage();
  const { source, trialMsLeft, isMasterAdmin } = useAccess();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const isHub = location.pathname === "/inicio";
  const isSubscription = location.pathname === "/assinatura";

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };


  return (
    <div className="flex min-h-dvh flex-col bg-background relative isolate">
      <div className="aurora fixed inset-0 -z-10" aria-hidden="true" />
      <div className="grid-noise fixed inset-0 -z-10 opacity-40" aria-hidden="true" />

      <div role="status" className="w-full bg-warning/15 border-b border-warning/30 text-warning text-xs sm:text-sm text-center px-3 py-1.5">
        Beta público aberto — todos os módulos estão liberados para testes. Algumas funções podem mudar.
      </div>
      <header className="sticky top-0 z-30 glass border-x-0 border-t-0">
        {user && <DynamicIslandTutor />}
        <div className="w-full max-w-6xl mx-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          {!isHub && (
            <Link
              to="/inicio"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-11 pr-0.5"
              aria-label={t("nav.panel")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t("nav.panel")}</span>
            </Link>
          )}

          <Link to="/inicio" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="ios-icon ios-icon-primary h-8 w-8 shrink-0">
              <GraduationCap className="h-4.5 w-4.5 text-primary-foreground" />
            </span>
            <span className="font-display font-semibold tracking-tight text-foreground truncate text-sm sm:text-base">Anderson Academy</span>
          </Link>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <InstallAppButton />
            {isHub && <LayoutGrid className="h-4 w-4 text-primary/70 mr-1 hidden sm:block" aria-hidden="true" />}
            {profile?.display_name && (
              <span className="hidden lg:inline text-xs text-muted-foreground max-w-[160px] truncate mr-2">
                {profile.display_name}
              </span>
            )}
            {source === "trial" && !isSubscription && (
              <Link
                to="/assinatura"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                aria-label="Teste gratuito — ver planos"
              >
                <Timer className="h-3.5 w-3.5" />
                <span className="font-mono">{formatCountdown(trialMsLeft)}</span>
              </Link>
            )}
            {source === "none" && !isSubscription && (
              <Link
                to="/assinatura"
                className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold text-primary-foreground"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Liberar acesso
              </Link>
            )}
            <Link
              to="/minha-conta"
              className="min-h-11 min-w-11 grid place-items-center rounded-[28%] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-[transform,color,background-color] duration-300 active:scale-90"
              aria-label="Minha conta e cobrança"
            >
              <CreditCard className="h-5 w-5" />
            </Link>
            {isMasterAdmin && (
              <Link
                to="/administracao"
                className="min-h-11 min-w-11 grid place-items-center rounded-[28%] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-[transform,color,background-color] duration-300 active:scale-90"
                aria-label="Administração do site"
              >
                <ShieldCheck className="h-5 w-5" />
              </Link>
            )}
            <LanguageToggle />

            <button
              onClick={() => setShowPrivacy(true)}
              className="min-h-11 min-w-11 grid place-items-center rounded-[28%] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-[transform,color,background-color] duration-300 active:scale-90"
              aria-label={t("nav.privacy")}
            >
              <Shield className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="min-h-11 min-w-11 grid place-items-center rounded-[28%] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-[transform,color,background-color] duration-300 active:scale-90"
              aria-label={t("nav.signout")}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="text-center py-3 px-4 text-[11px] sm:text-xs text-muted-foreground/40 border-t border-border/30">
        {t("footer.credits")}
      </footer>

      <PrivacyPolicyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} showDeleteOption />
      <PaymentApprovedNotice />
    </div>
  );
}
