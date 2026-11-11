DROP POLICY IF EXISTS "Authenticated users can read lesson media" ON public.lesson_media;

CREATE POLICY "Apenas alunos com acesso podem ver aulas"
ON public.lesson_media FOR SELECT
TO authenticated
USING (public.has_platform_access(auth.uid()));