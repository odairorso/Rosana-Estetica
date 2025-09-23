-- Adicionar coluna CPF na tabela clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Comentário para documentar a mudança
COMMENT ON COLUMN public.clients.cpf IS 'CPF do cliente';