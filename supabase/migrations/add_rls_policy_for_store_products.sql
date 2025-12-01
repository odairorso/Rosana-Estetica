-- Adiciona a política de segurança (RLS) para a tabela 'store_products'
-- Permite que usuários autenticados leiam os produtos da loja.
-- Isso é necessário para exibir os detalhes dos produtos nos itens da venda.

-- Habilita RLS na tabela, caso ainda não esteja habilitado.
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

-- Remove a política antiga, se existir, para evitar conflitos.
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON public.store_products;

-- Cria a política que permite a leitura (SELECT) para qualquer usuário autenticado.
CREATE POLICY "Permitir leitura para usuários autenticados" 
ON public.store_products
FOR SELECT
TO authenticated
USING (true);
