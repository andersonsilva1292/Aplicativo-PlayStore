import { motion } from "framer-motion";
import { Target, CheckCircle, XCircle, TrendingUp, Clock, BookOpen } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import StatCard from "@/components/StatCard";
import ProgressBar from "@/components/ProgressBar";
import { chapters, getGreeting } from "@/data/ctfl-data";
import { useQuizStats } from "@/hooks/useQuizStats";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const {
    loading,
    totalQuestions,
    totalCorrect,
    totalErrors,
    overallProgress,
    simuladosCount,
    chapterProgress,
    weeklyData,
    difficultyTopics,
  } = useQuizStats();

  return (
    <AppLayout>
      <Seo
        title="Painel de Progresso | Anderson Academy"
        description="Acompanhe seu progresso de estudos para o CTFL: acertos, erros, simulados realizados e evolução semanal por capítulo do syllabus ISTQB."
        path="/dashboard"
      />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">Painel de Progresso</h1>
          <p className="text-muted-foreground">{getGreeting()}! Veja seu progresso na preparação para o CTFL</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Progresso Geral" value={`${overallProgress}%`} subtitle="Meta: 65%" icon={Target} gradient="primary" />
          <StatCard title="Acertos" value={totalCorrect} subtitle={`de ${totalQuestions} questões`} icon={CheckCircle} gradient="success" />
          <StatCard title="Erros" value={totalErrors} subtitle={totalQuestions === 0 ? "Comece a praticar!" : `${Math.round((totalErrors / totalQuestions) * 100)}% de erro`} icon={XCircle} gradient="warm" />
          <StatCard title="Simulados" value={simuladosCount} subtitle="realizados" icon={TrendingUp} gradient="primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl shadow-card p-5"
          >
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Evolução Semanal
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215, 15%, 55%)" }} stroke="hsl(220, 20%, 18%)" />
                <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 55%)" }} stroke="hsl(220, 20%, 18%)" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 25%, 11%)",
                    border: "1px solid hsl(220, 20%, 20%)",
                    borderRadius: "12px",
                    fontSize: 12,
                    color: "hsl(210, 20%, 95%)",
                  }}
                />
                <Bar dataKey="acertos" fill="hsl(160, 60%, 42%)" radius={[4, 4, 0, 0]} name="Acertos" />
                <Bar dataKey="erros" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} name="Erros" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Chapter progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl shadow-card p-5"
          >
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2 text-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              Progresso por Capítulo
            </h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((chapter) => {
                const ch = chapters.find((c) => c.id === chapter);
                const progress = chapterProgress[chapter] || 0;
                return (
                  <ProgressBar
                    key={chapter}
                    value={progress}
                    label={`${ch?.icon} Cap. ${chapter}`}
                    variant={progress < 40 ? "destructive" : progress < 60 ? "warning" : "success"}
                    size="sm"
                  />
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Difficulty highlights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl shadow-card p-5"
        >
          <h2 className="font-display font-semibold mb-3 text-foreground">⚠️ Tópicos com Maior Dificuldade</h2>
          {difficultyTopics.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p className="text-sm">Nenhum dado ainda. Complete simulados para identificar seus pontos fracos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {difficultyTopics.slice(0, 4).map((dt) => {
                const ch = chapters.find((c) => c.id === dt.chapter);
                return (
                  <div key={dt.chapter} className="flex items-center gap-3">
                    <span className="text-lg">{ch?.icon}</span>
                    <div className="flex-1">
                      <ProgressBar
                        value={dt.errorRate}
                        label={`Cap. ${dt.chapter} – ${ch?.title}`}
                        variant="destructive"
                        size="sm"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {dt.errors}/{dt.total} erros
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
