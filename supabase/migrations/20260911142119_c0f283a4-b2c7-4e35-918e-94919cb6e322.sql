-- Inserção, alteração e exclusão de pagamentos: negada para usuários autenticados,
-- já que essas operações só acontecem pelas edge functions com service_role.
CREATE POLICY "Negar inserção direta de pagamentos"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Negar alteração direta de pagamentos"
ON public.payments FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Negar exclusão direta de pagamentos"
ON public.payments FOR DELETE
TO authenticated
USING (false);