-- Alterar o tipo da coluna id para TEXT em store_products
-- Isso é necessário porque o frontend está gerando IDs baseados em timestamp (ex: "1764360554293")
-- e a tabela foi criada esperando UUID.

DO $$
BEGIN
    -- Tentar alterar store_products
    BEGIN
        -- Primeiro precisamos remover a constraint de chave primária se existir
        ALTER TABLE store_products DROP CONSTRAINT IF EXISTS store_products_pkey CASCADE;
        
        -- Alterar o tipo da coluna
        ALTER TABLE store_products ALTER COLUMN id TYPE TEXT;
        
        -- Recriar a chave primária
        ALTER TABLE store_products ADD PRIMARY KEY (id);
        
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'Erro ao alterar store_products: %', SQLERRM;
    END;
END $$;
