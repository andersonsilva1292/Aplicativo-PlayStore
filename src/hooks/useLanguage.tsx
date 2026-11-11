import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "pt" | "en";

const STORAGE_KEY = "ctfl-prep:lang";

/** Dicionário de interface (pt-BR padrão, en-US para o público internacional). */
const DICT: Record<string, { pt: string; en: string }> = {
  // Layout
  "nav.panel": { pt: "Painel", en: "Dashboard" },
  "nav.privacy": { pt: "Privacidade e conta", en: "Privacy and account" },
  "nav.signout": { pt: "Sair da conta", en: "Sign out" },
  "nav.language": { pt: "Idioma", en: "Language" },
  "footer.credits": {
    pt: "Desenvolvido por Anderson dos Santos Silva",
    en: "Developed by Anderson dos Santos Silva",
  },

  // Painel
  "hub.title": { pt: "Seu painel de estudos", en: "Your study dashboard" },
  "hub.subtitle": {
    pt: "Escolha um módulo para continuar. Todo o progresso é pessoal e salvo automaticamente na sua conta.",
    en: "Pick a module to continue. All progress is personal and saved automatically to your account.",
  },
  "hub.ctfl": { pt: "Módulo CTFL", en: "CTFL module" },
  "hub.ctfl.progress": { pt: "Syllabus praticado", en: "Syllabus practiced" },
  "hub.ctfl.cta": { pt: "Continuar preparação CTFL", en: "Continue CTFL prep" },
  "hub.automation": { pt: "Módulo Automação de Testes", en: "Test Automation module" },
  "hub.automation.steps": { pt: "de {total} etapas concluídas", en: "of {total} steps completed" },
  "hub.automation.next": { pt: "Próxima etapa:", en: "Next step:" },
  "hub.automation.continue": { pt: "Continuar trajetória", en: "Continue journey" },
  "hub.automation.start": { pt: "Iniciar trajetória", en: "Start journey" },
  "hub.instructor": { pt: "Instrutor de automação:", en: "Automation instructor:" },

  "mod.trilhas": { pt: "Trilhas de estudo", en: "Study tracks" },
  "mod.trilhas.hint": { pt: "Conteúdo por capítulo", en: "Content by chapter" },
  "mod.simulados": { pt: "Simulados", en: "Mock exams" },
  "mod.simulados.hint": { pt: "Rápido, médio e maratona", en: "Quick, medium and marathon" },
  "mod.relatorios": { pt: "Relatórios", en: "Reports" },
  "mod.relatorios.hint": { pt: "Desempenho e histórico", en: "Performance and history" },
  "mod.syllabus": { pt: "Syllabus 4.0", en: "Syllabus 4.0" },
  "mod.syllabus.hint": { pt: "Guia estruturado", en: "Structured guide" },
  "mod.dashboard": { pt: "Visão geral", en: "Overview" },
  "mod.dashboard.hint": { pt: "Indicadores do exame", en: "Exam indicators" },
  "mod.chat": { pt: "Assistente CTFL", en: "CTFL assistant" },
  "mod.chat.hint": { pt: "Dúvidas do syllabus", en: "Syllabus questions" },
  "mod.trajetoria": { pt: "Trajetória guiada", en: "Guided journey" },
  "mod.trajetoria.hint": { pt: "Vídeo, material e questionário", en: "Video, material and quiz" },
  "mod.acompanhamento": { pt: "Acompanhamento", en: "Progress tracking" },
  "mod.acompanhamento.hint": { pt: "Módulos e atividades", en: "Modules and activities" },

  // Materiais
  "mat.title": { pt: "Download de materiais", en: "Download materials" },
  "mat.subtitle": {
    pt: "Apostilas em PDF geradas por IA, uma por etapa, com resumo, checklist e exercícios. Uso pessoal e confidencial.",
    en: "AI-generated PDF handbooks, one per step, with summary, checklist and exercises. Personal and confidential use.",
  },
  "mat.open": { pt: "Abrir área de materiais", en: "Open materials area" },
  "mat.card.title": { pt: "Download de materiais", en: "Download materials" },
  "mat.card.subtitle": {
    pt: "Apostilas em PDF geradas por IA para cada etapa do curso, prontas para baixar e estudar offline.",
    en: "AI-generated PDF handbooks for every course step, ready to download and study offline.",
  },
  "mat.month": { pt: "Mês", en: "Month" },
  "mat.download": { pt: "Baixar PDF", en: "Download PDF" },
  "mat.preparing": { pt: "Preparando...", en: "Preparing..." },

  // Ambiente
  "env.title": { pt: "Ambiente local — arquivos de instalação", en: "Local environment — installation files" },
  "env.subtitle": {
    pt: "Baixe os instaladores, configure as variáveis de ambiente e copie o pom.xml do projeto.",
    en: "Download the installers, set up the environment variables and copy the project's pom.xml.",
  },
  "env.download": { pt: "Baixar arquivo", en: "Download file" },
  "env.official": { pt: "Site oficial", en: "Official site" },
  "env.method": { pt: "Método 1: configuração permanente (recomendado)", en: "Method 1: permanent setup (recommended)" },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detect(): Lang {
  if (typeof window === "undefined") return "pt";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "pt" || stored === "en") return stored;
  return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let text = DICT[key]?.[lang] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
      }
      return text;
    },
    [lang]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang: setLangState, toggle: () => setLangState((p) => (p === "pt" ? "en" : "pt")), t }),
    [lang, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage precisa estar dentro de LanguageProvider");
  return ctx;
}
