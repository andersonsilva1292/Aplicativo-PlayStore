import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BookOpen,
  Download,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Route as RouteIcon,
  User,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { COURSE_META, allLessons } from "@/data/automation-course";
import { TRACK_THEMES } from "@/data/track-themes";
import { useAutomationProgress } from "@/hooks/useAutomationProgress";
import { useQuizStats } from "@/hooks/useQuizStats";
import { useLanguage } from "@/hooks/useLanguage";

const spring = { type: "spring" as const, stiffness: 260, damping: 26 };

/** Painel central: todos os módulos da plataforma em uma única tela. */
export default function Inicio() {
  const navigate = useNavigate();
  const { completedCount, total, percent, nextPendingLesson } = useAutomationProgress();
  const quiz = useQuizStats();
  const { t } = useLanguage();

  const next = useMemo(() => nextPendingLesson(), [nextPendingLesson]);
  const nextIndex = allLessons.findIndex((l) => l.id === next?.id);

  const chapterEntries = Object.entries(quiz.chapterProgress ?? {}).map(([, value]) => Number(value) || 0);
  const ctflPercent = Math.round(chapterEntries.reduce((a, b) => a + b, 0) / Math.max(1, chapterEntries.length));

  return (
    <AppLayout>
      <Seo
        title="Painel de estudos | Anderson Academy e Automação de Testes"
        description="Painel central com os módulos de certificação CTFL, automação de testes e download dos materiais em PDF gerados por IA."
        path="/inicio"
      />

      <div className="px-3 py-5 sm:px-6 sm:py-6 max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <header className="text-center space-y-2.5">
          <h1 className="font-display text-[1.6rem] leading-tight sm:text-3xl md:text-4xl font-bold tracking-tight">
            <span className="text-gradient">{t("hub.title")}</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-[13px] sm:text-sm">{t("hub.subtitle")}</p>
        </header>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          {/* Módulo CTFL */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className={`${TRACK_THEMES.ctfl.themeClass} glass-card card-modern rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5`}
          >
            <div className="flex items-start gap-3">
              <div className="gradient-primary rounded-2xl p-2.5 shadow-glow shrink-0">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">{t("hub.ctfl")}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{TRACK_THEMES.ctfl.tagline}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground gap-2">
                <span className="truncate">{t("hub.ctfl.progress")}</span>
                <span>{ctflPercent}%</span>
              </div>
              <ProgressBar value={ctflPercent} variant={ctflPercent < 40 ? "destructive" : ctflPercent < 70 ? "warning" : "success"} />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <ModuleButton to="/trilhas" icon={RouteIcon} label={t("mod.trilhas")} hint={t("mod.trilhas.hint")} />
              <ModuleButton to="/simulados" icon={FileText} label={t("mod.simulados")} hint={t("mod.simulados.hint")} />
              <ModuleButton to="/relatorios" icon={BarChart3} label={t("mod.relatorios")} hint={t("mod.relatorios.hint")} />
              <ModuleButton to="/syllabus" icon={BookOpen} label={t("mod.syllabus")} hint={t("mod.syllabus.hint")} />
              <ModuleButton to="/dashboard" icon={LayoutDashboard} label={t("mod.dashboard")} hint={t("mod.dashboard.hint")} />
              <ModuleButton to="/chat" icon={MessageSquare} label={t("mod.chat")} hint={t("mod.chat.hint")} />
            </div>

            <Button
              onClick={() => navigate("/trilhas")}
              className="w-full min-h-11 gradient-primary text-primary-foreground shadow-glow hover-scale"
            >
              <span className="truncate">{t("hub.ctfl.cta")}</span> <ArrowRight className="h-4 w-4 ml-1.5 shrink-0" />
            </Button>
          </motion.section>

          {/* Módulo Automação */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.06 }}
            className={`${TRACK_THEMES.automacao.themeClass} glass-card card-modern rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5`}
          >
            <div className="flex items-start gap-3">
              <div className="gradient-primary rounded-2xl p-2.5 shadow-glow shrink-0">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">{t("hub.automation")}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{TRACK_THEMES.automacao.tagline}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground gap-2">
                <span className="truncate">
                  {completedCount} {t("hub.automation.steps", { total })}
                </span>
                <span>{percent}%</span>
              </div>
              <ProgressBar value={percent} variant={percent < 40 ? "destructive" : percent < 70 ? "warning" : "success"} />
              {next && (
                <p className="text-xs text-muted-foreground pt-1">
                  {t("hub.automation.next")}{" "}
                  <span className="text-foreground font-medium">
                    {nextIndex + 1}. {next.title}
                  </span>
                </p>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <ModuleButton to="/trajetoria" icon={RouteIcon} label={t("mod.trajetoria")} hint={t("mod.trajetoria.hint")} />
              <ModuleButton to="/automacao" icon={ListChecks} label={t("mod.acompanhamento")} hint={t("mod.acompanhamento.hint")} />
            </div>

            <Button
              onClick={() => navigate(`/trajetoria?lesson=${next?.id ?? allLessons[0].id}`)}
              className="w-full min-h-11 gradient-primary text-primary-foreground shadow-glow hover-scale"
            >
              <span className="truncate">
                {completedCount > 0 ? t("hub.automation.continue") : t("hub.automation.start")}
              </span>{" "}
              <ArrowRight className="h-4 w-4 ml-1.5 shrink-0" />
            </Button>
          </motion.section>
        </div>

        {/* Downloads */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.12 }}
          className="glass-card card-modern rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="gradient-primary rounded-2xl p-2.5 shadow-glow shrink-0">
            <Download className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground">{t("mat.card.title")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t("mat.card.subtitle")}</p>
          </div>
          <Button asChild variant="secondary" className="shrink-0 w-full sm:w-auto min-h-11">
            <Link to="/materiais">
              {t("mat.open")} <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </motion.section>

        <div className="glass-card rounded-2xl p-4 text-xs text-muted-foreground flex flex-wrap gap-4 justify-center text-center">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary" /> {t("hub.instructor")} {COURSE_META.instructor}
          </span>
        </div>
      </div>
    </AppLayout>
  );
}

function ModuleButton({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: string;
  icon: typeof RouteIcon;
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-border/40 bg-white/[0.03] hover:bg-white/[0.07] hover:border-primary/40 transition-all p-3 sm:p-3.5 flex items-start gap-3 min-h-16"
    >
      <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground truncate">{label}</span>
        <span className="block text-[11px] text-muted-foreground truncate">{hint}</span>
      </span>
    </Link>
  );
}
