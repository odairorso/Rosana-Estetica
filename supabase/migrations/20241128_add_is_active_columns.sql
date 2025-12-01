-- Adicionar coluna is_active na tabela procedures
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'procedures' AND column_name = 'is_active') THEN
        ALTER TABLE procedures ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Adicionar coluna is_active na tabela packages (caso não exista)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'is_active') THEN
        ALTER TABLE packages ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;
