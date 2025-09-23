-- Adicionar coluna sale_id na tabela appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL;