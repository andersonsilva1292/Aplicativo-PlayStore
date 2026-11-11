-- Somente alunos com acesso liberado podem ler os arquivos de aula.
CREATE POLICY "Alunos com acesso podem ler arquivos de aula"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-media'
  AND public.has_platform_access(auth.uid())
);

-- Envio, alteração e exclusão de arquivos de aula: apenas o proprietário.
CREATE POLICY "Proprietario envia arquivos de aula"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-media'
  AND public.is_master_admin(auth.uid())
);

CREATE POLICY "Proprietario altera arquivos de aula"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lesson-media' AND public.is_master_admin(auth.uid()))
WITH CHECK (bucket_id = 'lesson-media' AND public.is_master_admin(auth.uid()));

CREATE POLICY "Proprietario apaga arquivos de aula"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lesson-media' AND public.is_master_admin(auth.uid()));