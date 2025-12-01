-- Adiciona a política de segurança (RLS) para a tabela 'sales'
-- Permite que usuários autenticados realizem todas as operações (SELECT, INSERT, UPDATE, DELETE)

CREATE POLICY "Permitir todas as operações para usuários autenticados" 
ON public.sales
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
