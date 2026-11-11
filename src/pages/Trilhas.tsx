import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronRight, CheckCircle2, Circle, Sparkles, Play } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { trails, chapters, sampleQuestions } from "@/data/ctfl-data";
import { useQuizStats } from "@/hooks/useQuizStats";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Trilhas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);
  const { chapterProgress } = useQuizStats();
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    supabase
      .from("quiz_results")
      .select("questions_data")
      .then(({ data }) => {
        const set = new Set<string>();
        (data || []).forEach((row: any) => {
          (row.questions_data || []).forEach((q: any) => {
            if (q?.id) set.add(q.id);
          });
        });
        setAnsweredIds(set);
      });
  }, [user]);

  const practiceUnanswered = (chapterId: number) => {
    const pool = sampleQuestions.filter((q) => q.chapter === chapterId && !answeredIds.has(q.id));
    if (pool.length === 0) return;
    const ids = pool.map((q) => q.id);
    navigate("/simulados", { state: { questionIds: ids, label: `Cap. ${chapterId} – Não respondidas` } });
  };


  return (
    <AppLayout>
      <Seo
        title="Trilhas de Estudo | Anderson Academy"
        description="Estude o syllabus CTFL organizado em 6 capítulos e por níveis cognitivos K1, K2 e K3. Trilhas com tópicos, descrições e progresso individual."
        path="/trilhas"
      />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
            <BookOpen className="h-6 w-6 text-primary" />
            Trilhas de Estudo
          </h1>
          <p className="text-muted-foreground">Estude de forma organizada por capítulos e níveis cognitivos</p>
        </div>

        {/* Level legend */}
        <div className="flex gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary font-medium border border-primary/20">K1 – Lembrar</span>
          <span className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent font-medium border border-accent/20">K2 – Entender</span>
          <span className="px-3 py-1.5 rounded-lg bg-warning/15 text-warning font-medium border border-warning/20">K3 – Aplicar</span>
        </div>

        <div className="space-y-3">
          {trails.map((trail, i) => {
            const chapter = chapters.find((c) => c.id === trail.chapter);
            const progress = chapterProgress[trail.chapter] || 0;
            const isOpen = expanded === trail.id;

            return (
              <motion.div
                key={trail.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl shadow-card overflow-hidden hover:shadow-glow transition-shadow duration-300"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : trail.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-2xl">{chapter?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display font-semibold truncate text-foreground">
                        Cap. {trail.chapter} – {trail.title}
                      </h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{trail.description}</p>
                    <div className="mt-2">
                      <ProgressBar value={progress} size="sm" showPercent={false} variant={progress < 40 ? "destructive" : progress < 60 ? "warning" : "success"} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
                    {isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-2 border-t border-border/30 pt-3">
                        {trail.topics.map((topic) => {
                          const done = progress >= 65;
                          return (
                            <div
                              key={topic.id}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                done ? "bg-success/10 border border-success/20" : "bg-white/3 hover:bg-white/5 border border-transparent"
                              }`}
                            >
                              {done ? (
                                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{topic.id} – {topic.title}</p>
                                <p className="text-xs text-muted-foreground">{topic.description}</p>
                              </div>
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                                  topic.level === "K1"
                                    ? "bg-primary/15 text-primary"
                                    : topic.level === "K2"
                                    ? "bg-accent/15 text-accent"
                                    : "bg-warning/15 text-warning"
                                }`}
                              >
                                {topic.level}
                              </span>
                            </div>
                          );
                        })}
                        {(() => {
                          const chapterQs = sampleQuestions.filter((q) => q.chapter === trail.chapter);
                          const unanswered = chapterQs.filter((q) => !answeredIds.has(q.id));
                          return (
                            <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3 flex-wrap">
                              <div className="text-xs text-muted-foreground">
                                <p className="text-foreground font-medium flex items-center gap-1">
                                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                                  {unanswered.length} questões ainda não respondidas
                                </p>
                                <p className="mt-0.5">
                                  📝 {chapterQs.length} disponíveis · {chapterQs.length - unanswered.length} já praticadas
                                </p>
                              </div>
                              <Button
                                size="sm"
                                disabled={unanswered.length === 0}
                                onClick={() => practiceUnanswered(trail.chapter)}
                                className="gradient-primary text-primary-foreground shadow-glow disabled:opacity-40"
                              >
                                <Play className="h-3.5 w-3.5 mr-1" />
                                {unanswered.length === 0 ? "Tudo praticado" : "Praticar novas"}
                              </Button>
                            </div>
                          );
                        })()}
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
