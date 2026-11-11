import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PracticeDraft {
  id: string;
  title: string;
  language: string;
  code: string;
  lesson_id: string | null;
  updated_at: string;
}

const MAX_TITLE = 80;
const MAX_CODE = 20000;

export function sanitizeDraftTitle(raw: string) {
  const clean = raw.replace(/\s+/g, " ").trim();
  return (clean || "Rascunho").slice(0, MAX_TITLE);
}

/** Rascunhos de prática livre salvos por aluno (título, linguagem e código). */
export function usePracticeDrafts(lessonId?: string) {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<PracticeDraft[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setDrafts([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("practice_drafts")
      .select("id, title, language, code, lesson_id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    setDrafts((data as PracticeDraft[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const saveDraft = useCallback(
    async (input: { id?: string; title: string; code: string; language?: string }) => {
      if (!user) return null;
      const payload = {
        user_id: user.id,
        title: sanitizeDraftTitle(input.title),
        code: (input.code ?? "").slice(0, MAX_CODE),
        language: input.language ?? "javascript",
        lesson_id: lessonId ?? null,
      };
      const query = input.id
        ? supabase.from("practice_drafts").update(payload).eq("id", input.id).select().maybeSingle()
        : supabase.from("practice_drafts").insert(payload).select().maybeSingle();
      const { data, error } = await query;
      if (error || !data) return null;
      const saved = data as PracticeDraft;
      setDrafts((prev) => [saved, ...prev.filter((d) => d.id !== saved.id)]);
      return saved;
    },
    [user, lessonId]
  );

  const deleteDraft = useCallback(
    async (id: string) => {
      if (!user) return;
      await supabase.from("practice_drafts").delete().eq("id", id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    },
    [user]
  );

  return { drafts, loading, saveDraft, deleteDraft, reload: load };
}
