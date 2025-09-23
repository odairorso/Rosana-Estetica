-- Script para adicionar colunas de endereço na tabela clients
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna rua
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS rua text;

-- Adicionar coluna numero  
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS numero text;

-- Adicionar coluna bairro
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS bairro text;

-- Adicionar coluna cidade
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cidade text;

-- Adicionar coluna estado
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS estado text;

-- Adicionar coluna cep
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cep text;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;