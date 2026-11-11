import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDevMode } from "@/hooks/useDevMode";
import { allLessons, type Lesson } from "@/data/automation-course";
import { lessonExtras } from "@/data/lesson-extras";

export interface ProgressRow {
  lesson_id: string;
  quiz_passed: boolean;
  quiz_score: number;
  code_submitted: string | null;
  code_draft: string | null;
  code_draft_updated_at: string | null;
  quiz_draft: Record<string, number>;
  notes: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  updated_at: string;
  video_watched_at: string | null;
  video_position_seconds: number;
  pdf_opened_at: string | null;
  exam_passed: boolean;
  exam_score: number;
  exam_attempts: number;
  exam_taken_at: string | null;
}

export interface ActivityRow {
  lesson_id: string | null;
  action: string;
  created_at: string;
}

/** A aula tem prova final quando existe banco de questões de prova para ela. */
export function hasExam(lessonId: string) {
  return (lessonExtras[lessonId]?.exam?.length ?? 0) > 0;
}

export function isLessonComplete(lesson: Lesson, row?: ProgressRow) {
  if (!row) return false;
  if (!row.video_watched_at) return false;
  if (!row.quiz_passed) return false;
  if (lesson.exercise && !row.code_submitted) return false;
  if (hasExam(lesson.id) && !row.exam_passed) return false;
  return true;
}


import { getAllUserProgress, saveUserProgress } from "@/lib/firestore-service";

export function useAutomationProgress() {
  const { user } = useAuth();
  const devMode = useDevMode();
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const map: Record<string, ProgressRow> = {};
    try {
      const [{ data: rows }, { data: acts }] = await Promise.all([
        supabase.from("automation_progress").select("*"),
        supabase.from("automation_activity").select("lesson_id, action, created_at").order("created_at", { ascending: false }).limit(200),
      ]);
      (rows || []).forEach((r: any) => (map[r.lesson_id] = r));
      setActivity((acts as ActivityRow[]) || []);
    } catch {
      // Supabase fallback
    }

    try {
      const fsRows = await getAllUserProgress(user.id);
      fsRows.forEach((r) => {
        map[r.lessonId] = {
          ...(map[r.lessonId] || {}),
          lesson_id: r.lessonId,
          user_id: user.id,
          quiz_score: r.quiz_score ?? 0,
          quiz_passed: (r.quiz_score ?? 0) >= 70,
          exam_score: r.exam_score ?? 0,
          exam_attempts: r.exam_attempts ?? 0,
          exam_passed: (r.exam_score ?? 0) >= 70,
          code_submitted: r.code_submitted ?? null,
          code_draft: r.code_draft ?? null,
          pdf_opened_at: r.pdf_opened_at ?? null,
        } as ProgressRow;
      });
    } catch (e) {
      console.warn("Firestore progress load fallback:", e);
    }

    setProgress(map);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const logActivity = useCallback(
    async (action: string, lessonId?: string) => {
      if (!user) return;
      await supabase.from("automation_activity").insert({ user_id: user.id, action, lesson_id: lessonId ?? null });
      setActivity((prev) => [{ action, lesson_id: lessonId ?? null, created_at: new Date().toISOString() }, ...prev]);
    },
    [user]
  );

  const upsert = useCallback(
    async (lessonId: string, patch: Partial<ProgressRow>) => {
      if (!user) return;
      const lesson = allLessons.find((l) => l.id === lessonId)!;
      const merged = { ...(progress[lessonId] || {}), ...patch } as ProgressRow;
      const complete = isLessonComplete(lesson, merged);
      const payload = {
        user_id: user.id,
        lesson_id: lessonId,
        quiz_passed: merged.quiz_passed ?? false,
        quiz_score: merged.quiz_score ?? 0,
        code_submitted: merged.code_submitted ?? null,
        code_draft: merged.code_draft ?? null,
        code_draft_updated_at: merged.code_draft_updated_at ?? null,
        quiz_draft: (merged.quiz_draft ?? {}) as any,
        notes: merged.notes ?? null,
        video_watched_at: merged.video_watched_at ?? null,
        video_position_seconds: merged.video_position_seconds ?? 0,
        pdf_opened_at: merged.pdf_opened_at ?? null,
        exam_passed: merged.exam_passed ?? false,
        exam_score: merged.exam_score ?? 0,
        exam_attempts: merged.exam_attempts ?? 0,
        exam_taken_at: merged.exam_taken_at ?? null,

        submitted_at: merged.code_submitted ? merged.submitted_at ?? new Date().toISOString() : null,
        completed_at: complete ? merged.completed_at ?? new Date().toISOString() : null,
      };
      try {
        const { data } = await supabase
          .from("automation_progress")
          .upsert(payload, { onConflict: "user_id,lesson_id" })
          .select()
          .maybeSingle();
        if (data) setProgress((prev) => ({ ...prev, [lessonId]: data as ProgressRow }));
        else setProgress((prev) => ({ ...prev, [lessonId]: merged }));
      } catch {
        setProgress((prev) => ({ ...prev, [lessonId]: merged }));
      }

      try {
        await saveUserProgress(user.id, lessonId, {
          quiz_score: merged.quiz_score,
          code_submitted: merged.code_submitted ?? undefined,
          code_draft: merged.code_draft ?? undefined,
          pdf_opened_at: merged.pdf_opened_at ?? undefined,
          exam_score: merged.exam_score,
          exam_attempts: merged.exam_attempts,
        });
      } catch (e) {
        console.warn("Firestore save progress:", e);
      }
    },
    [user, progress]
  );

  /** Salva rascunho (código do exercício, respostas do questionário e anotações) sem concluir a aula */
  const saveDraft = useCallback(
    async (lessonId: string, patch: { code_draft?: string; quiz_draft?: Record<string, number>; notes?: string }) => {
      await upsert(lessonId, {
        ...patch,
        code_draft_updated_at: new Date().toISOString(),
      } as Partial<ProgressRow>);
    },
    [upsert]
  );

  /** Marca a vídeo-aula como assistida até o fim (libera as etapas seguintes da aula) */
  const markVideoWatched = useCallback(
    async (lessonId: string) => {
      if (progress[lessonId]?.video_watched_at) return;
      await upsert(lessonId, { video_watched_at: new Date().toISOString() });
    },
    [upsert, progress]
  );

  /** Guarda o slide/segundo em que o aluno parou o vídeo, para retomar depois */
  const saveVideoPosition = useCallback(
    async (lessonId: string, seconds: number) => {
      await upsert(lessonId, { video_position_seconds: Math.max(0, Math.round(seconds)) });
    },
    [upsert]
  );

  /** Registra a primeira abertura do material complementar em PDF */
  const markPdfOpened = useCallback(
    async (lessonId: string) => {
      if (progress[lessonId]?.pdf_opened_at) return;
      await upsert(lessonId, { pdf_opened_at: new Date().toISOString() });
    },
    [upsert, progress]
  );

  /** Grava o resultado da prova final da aula (aprovação mínima de 65%) */
  const saveExamResult = useCallback(
    async (lessonId: string, score: number, passed: boolean) => {
      const prev = progress[lessonId];
      await upsert(lessonId, {
        exam_score: score,
        exam_passed: passed || !!prev?.exam_passed,
        exam_attempts: (prev?.exam_attempts ?? 0) + 1,
        exam_taken_at: new Date().toISOString(),
      });
    },
    [upsert, progress]
  );

  const completedCount = allLessons.filter((l) => isLessonComplete(l, progress[l.id])).length;


  /** Uma aula está liberada quando a anterior foi concluída (trava de segurança).
   *  No modo desenvolvimento todas ficam liberadas. */
  const isUnlocked = useCallback(
    (lessonId: string) => {
      if (devMode) return true;
      const idx = allLessons.findIndex((l) => l.id === lessonId);
      if (idx <= 0) return true;
      const prev = allLessons[idx - 1];
      return isLessonComplete(prev, progress[prev.id]);
    },
    [progress, devMode]
  );

  /** Próxima etapa pendente da trajetória (ou a última, se tudo estiver concluído) */
  const nextPendingLesson = useCallback(() => {
    const pending = allLessons.find((l) => !isLessonComplete(l, progress[l.id]));
    return pending ?? allLessons[allLessons.length - 1];
  }, [progress]);

  return {
    loading,
    progress,
    activity,
    logActivity,
    upsert,
    saveDraft,
    markVideoWatched,
    saveVideoPosition,
    markPdfOpened,
    saveExamResult,

    nextPendingLesson,
    reload: load,
    isUnlocked,
    completedCount,
    total: allLessons.length,
    percent: Math.round((completedCount / allLessons.length) * 100),
  };
}
