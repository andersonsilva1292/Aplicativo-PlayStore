import { motion } from "framer-motion";
import { BarChart3, TrendingUp, AlertTriangle, Target } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Seo from "@/components/Seo";
import ProgressBar from "@/components/ProgressBar";
import { chapters, sampleQuestions } from "@/data/ctfl-data";
import { useQuizStats } from "@/hooks/useQuizStats";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

export default function Relatorios() {
  const { avgScore, totalCorrect, chapterProgress, evolutionData, difficultyTopics, loading } = useQuizStats();

  const totalBankQuestions = sampleQuestions.length;
  const approvalProb = Math.min(100, Math.round((totalCorrect / totalBankQuestions) * 100));

  const radarData = chapters.map((c) => ({
    subject: `Cap. ${c.id}`,
    score: chapterProgress[c.id] || 0,
    fullMark: 100,
  }));

  return (
    <AppLayout>
      <Seo
        title="Relatórios de Desempenho | Anderson Academy"
        description="Análise completa do seu progresso no CTFL: previsão de aprovação, desempenho por capítulo, evolução nos simulados e padrões de erro."
        path="/relatorios"
      />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
            <BarChart3 className="h-6 w-6 text-primary" />
            Relatórios de Desempenho
          </h1>
          <p className="text-muted-foreground">Análise completa do seu progresso e previsão de aprovação</p>
        </div>

        {/* Approval prediction */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl shadow-card p-6"
        >
          <h2 className="font-display font-semibold flex items-center gap-2 mb-4 text-foreground">
            <Target className="h-5 w-5 text-primary" />
            Previsão de Aprovação
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className={`text-5xl font-display font-bold ${approvalProb >= 60 ? "text-success" : approvalProb >= 40 ? "text-warning" : "text-muted-foreground"}`}>
                {approvalProb}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Probabilidade</p>
            </div>
            <div className="flex-1">
              <ProgressBar
                value={approvalProb}
                variant={approvalProb >= 60 ? "success" : approvalProb >= 40 ? "warning" : "destructive"}
                label="Baseado no seu histórico de simulados"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Média atual: {avgScore}% · Meta: 65% · Faltam ~{Math.max(0, 65 - avgScore)} pontos percentuais
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-xl shadow-card p-5"
          >
            <h2 className="font-display font-semibold mb-4 text-foreground">📊 Desempenho por Capítulo</h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 20%, 18%)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} />
                <Radar name="Score" dataKey="score" stroke="hsl(160, 60%, 42%)" fill="hsl(160, 60%, 42%)" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Evolution chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl shadow-card p-5"
          >
            <h2 className="font-display font-semibold mb-4 flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-success" />
              Evolução nos Simulados
            </h2>
            {evolutionData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                Complete simulados para ver sua evolução aqui.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                  <XAxis dataKey="sim" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(220, 25%, 11%)",
                      border: "1px solid hsl(220, 20%, 20%)",
                      borderRadius: "12px",
                      color: "hsl(210, 20%, 95%)",
                    }}
                  />
                  <ReferenceLine y={65} stroke="hsl(160, 60%, 42%)" strokeDasharray="5 5" label={{ value: "Meta 65%", fill: "hsl(215, 15%, 55%)", fontSize: 10 }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(160, 60%, 42%)" strokeWidth={2.5} dot={{ fill: "hsl(160, 60%, 42%)", r: 4 }} name="Pontuação %" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Error patterns */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl shadow-card p-5"
        >
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Padrões de Erro – Tópicos para Revisar
          </h2>
          {difficultyTopics.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              Nenhum padrão identificado ainda. Complete simulados para gerar análises.
            </div>
          ) : (
            <div className="space-y-3">
              {difficultyTopics.map((dt) => {
                const ch = chapters.find((c) => c.id === dt.chapter);
                return (
                  <div key={dt.chapter} className="flex items-center gap-4">
                    <div className="flex-1">
                      <ProgressBar
                        value={dt.errors}
                        max={dt.total}
                        label={`${ch?.icon} Cap. ${dt.chapter} – ${ch?.title}`}
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
