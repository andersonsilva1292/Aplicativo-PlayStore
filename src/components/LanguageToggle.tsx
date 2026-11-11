import { Languages } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

/** Alternador compacto PT/EN, acessível por teclado e com alvo de toque de 44px. */
export default function LanguageToggle() {
  const { lang, toggle, t } = useLanguage();

  return (
    <button
      onClick={toggle}
      aria-label={`${t("nav.language")}: ${lang === "pt" ? "Português" : "English"}`}
      className="min-h-11 px-2.5 grid grid-flow-col items-center gap-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
    >
      <Languages className="h-5 w-5" aria-hidden="true" />
      <span className="text-[11px] font-semibold uppercase tracking-wide">{lang === "pt" ? "PT" : "EN"}</span>
    </button>
  );
}
