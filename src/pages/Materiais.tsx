import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { AlertTriangle, Download, FileText, Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import EnvironmentSetup from "@/components/EnvironmentSetup";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { modules } from "@/data/automation-course";
import { trails } from "@/data/ctfl-data";
import { supabase } from "@/integrations/supabase/client";
import { useAutomationProgress } from "@/hooks/useAutomationProgress";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLessonPdf, downloadBytes, isLessonMaterial, safeFileName } from "@/lib/lesson-pdf";

/** Área de download das apostilas em PDF geradas por IA para cada etapa. */
export default function Materiais() {
  const { logActivity } = useAutomationProgress();
  const { t } = useLanguage();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = async (
    lessonId: string,
    title: string,
    content: string,
    course: "automacao" | "ctfl" = "automacao"
  ) => {
    setBusy(lessonId);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-lesson-pdf", {
        body: { lessonId, title, content: content.slice(0, 12000), course },
      });
      if (fnError) {
        let msg = "Não foi possível gerar o material agora.";
        try {
          const body = await (fnError as any).context?.json?.();
          if (body?.error) msg = body.error;
        } catch { /* mantém mensagem padrão */ }
        throw new Error(msg);
      }
      const payload = data as { material?: unknown; owner?: string; error?: string } | null;
      if (payload?.error) throw new Error(payload.error);
      if (!isLessonMaterial(payload?.material)) throw new Error("Material indisponível para esta etapa.");

      const bytes = buildLessonPdf(
        title,
        payload.material,
        payload?.owner ?? "Aluno",
        course === "ctfl"
          ? "Preparatório CTFL · ISTQB Foundation Level Syllabus v4.0"
          : "Curso de Automação de Testes · Projeto Central Automation"
      );
      downloadBytes(bytes, safeFileName(title, lessonId));
      logActivity("material_baixado", lessonId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao baixar o material.");
    } finally {
      setBusy(null);
    }
  };

  const DownloadButton = ({ id, onClick }: { id: string; onClick: () => void }) => (
    <Button size="sm" variant="secondary" className="min-h-10 w-full sm:w-auto" disabled={busy === id} onClick={onClick}>
      {busy === id ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
      {busy === id ? t("mat.preparing") : t("mat.download")}
    </Button>
  );



  return (
    <AppLayout>
      <Seo
        title="Download de materiais em PDF"
        description="Baixe as apostilas em PDF geradas por IA para cada etapa do curso de automação de testes."
        path="/materiais"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="px-3 py-5 sm:px-6 sm:py-6 max-w-4xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5">
            <Download className="h-6 w-6 text-primary shrink-0" /> {t("mat.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("mat.subtitle")}
          </p>
        </header>

        {error && (
          <p className="text-sm text-destructive flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
          </p>
        )}

        <Tabs defaultValue="automacao" className="space-y-5">
          <TabsList className="w-full grid grid-cols-2 h-auto">
            <TabsTrigger value="automacao" className="min-h-11">Automação de Testes</TabsTrigger>
            <TabsTrigger value="ctfl" className="min-h-11">Preparatório CTFL</TabsTrigger>
          </TabsList>

          <TabsContent value="automacao" className="space-y-6">
            <EnvironmentSetup />
            {modules.map((mod, mi) => (
              <motion.section
                key={mod.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: mi * 0.04 }}
                className="glass-card card-modern rounded-2xl p-5 space-y-3"
              >
                <div>
                  <h2 className="font-display font-semibold text-foreground">
                    {t("mat.month")} {mod.month} — {mod.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.goal}</p>
                </div>

                <ul className="space-y-2">
                  {mod.lessons.map((l) => (
                    <li key={l.id} className="rounded-xl border border-border/40 p-3 flex items-center gap-3 flex-wrap">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground/90 flex-1 min-w-0">{l.title}</span>
                      <DownloadButton id={l.id} onClick={() => download(l.id, l.title, l.content)} />
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </TabsContent>

          <TabsContent value="ctfl" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Apostilas por capítulo do Syllabus CTFL v4.0, com teoria, checklist de revisão, exercícios resolvidos e
              glossário.
            </p>
            {trails.map((trail, ti) => (
              <motion.section
                key={trail.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ti * 0.04 }}
                className="glass-card card-modern rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-semibold text-foreground">
                      Capítulo {trail.chapter} — {trail.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{trail.description}</p>
                  </div>
                  <DownloadButton
                    id={trail.id}
                    onClick={() =>
                      download(
                        trail.id,
                        `CTFL Capítulo ${trail.chapter} — ${trail.title}`,
                        [
                          trail.description,
                          ...trail.topics.map((tp) => `${tp.id} ${tp.title} (${tp.level}): ${tp.description}`),
                        ].join("\n"),
                        "ctfl"
                      )
                    }
                  />
                </div>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {trail.topics.map((tp) => (
                    <li key={tp.id} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary font-mono shrink-0">{tp.level}</span>
                      <span className="min-w-0">{tp.title}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  );
}
