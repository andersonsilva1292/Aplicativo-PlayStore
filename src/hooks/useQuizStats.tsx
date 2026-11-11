import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Json } from "@/integrations/supabase/types";
import { sampleQuestions } from "@/data/ctfl-data";

interface QuizResult {
  id: string;
  correct_answers: number;
  total_questions: number;
  score_percentage: number;
  passed: boolean;
  time_spent_seconds: number | null;
  created_at: string;
  chapters_filter: number[] | null;
  level_filter: string | null;
  chapter_breakdown: Json | null;
}

interface ChapterBreakdown {
  [chapter: string]: { total: number; correct: number };
}

export function useQuizStats() {
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("quiz_results")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setResults(data as QuizResult[]);
        setLoading(false);
      });
  }, [user]);

  const totalQuestions = results.reduce((s, r) => s + r.total_questions, 0);
  const totalCorrect = results.reduce((s, r) => s + r.correct_answers, 0);
  const totalErrors = totalQuestions - totalCorrect;
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score_percentage, 0) / results.length) : 0;
  const simuladosCount = results.length;

  // Chapter aggregated stats from chapter_breakdown
  const chapterStats: Record<number, { total: number; correct: number }> = {};
  results.forEach((r) => {
    const bd = r.chapter_breakdown as ChapterBreakdown | null;
    if (!bd) return;
    Object.entries(bd).forEach(([ch, s]) => {
      const num = Number(ch);
      if (!chapterStats[num]) chapterStats[num] = { total: 0, correct: 0 };
      chapterStats[num].total += s.total;
      chapterStats[num].correct += s.correct;
    });
  });

  // Chapter progress: correct answers / total available questions in the bank
  const totalQuestionsPerChapter: Record<number, number> = {};
  sampleQuestions.forEach((q) => {
    totalQuestionsPerChapter[q.chapter] = (totalQuestionsPerChapter[q.chapter] || 0) + 1;
  });

  const chapterProgress: Record<number, number> = {};
  for (let i = 1; i <= 6; i++) {
    const s = chapterStats[i];
    const totalAvailable = totalQuestionsPerChapter[i] || 1;
    chapterProgress[i] = s && s.correct > 0 ? Math.round((s.correct / totalAvailable) * 100) : 0;
  }

  // Overall progress (weighted avg of chapter scores)
  const overallProgress = avgScore;

  // Weekly data (last 7 days)
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);
    
    let acertos = 0, erros = 0;
    results.forEach((r) => {
      const rd = new Date(r.created_at);
      if (rd >= d && rd < nextD) {
        acertos += r.correct_answers;
        erros += r.total_questions - r.correct_answers;
      }
    });
    return { day: dayNames[d.getDay()], acertos, erros };
  });

  // Evolution data for line chart
  const evolutionData = results.map((r, i) => ({
    sim: `#${i + 1}`,
    score: r.score_percentage,
  }));

  // Difficulty topics (chapters with worst performance)
  const difficultyTopics = Object.entries(chapterStats)
    .filter(([, s]) => s.total > 0)
    .map(([ch, s]) => ({
      chapter: Number(ch),
      errorRate: Math.round(((s.total - s.correct) / s.total) * 100),
      errors: s.total - s.correct,
      total: s.total,
    }))
    .sort((a, b) => b.errorRate - a.errorRate);

  return {
    results,
    loading,
    totalQuestions,
    totalCorrect,
    totalErrors,
    avgScore,
    simuladosCount,
    chapterStats,
    chapterProgress,
    overallProgress,
    weeklyData,
    evolutionData,
    difficultyTopics,
  };
}
