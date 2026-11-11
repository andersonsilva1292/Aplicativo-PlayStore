CREATE UNIQUE INDEX IF NOT EXISTS lesson_media_lesson_kind_uidx ON public.lesson_media (lesson_id, kind);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_media TO authenticated;
GRANT ALL ON public.lesson_media TO service_role;
DROP POLICY IF EXISTS "Master admin manages lesson media" ON public.lesson_media;
CREATE POLICY "Master admin manages lesson media" ON public.lesson_media FOR ALL TO authenticated
USING (public.is_master_admin(auth.uid())) WITH CHECK (public.is_master_admin(auth.uid()));