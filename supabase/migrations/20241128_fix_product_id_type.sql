-- Alterar o tipo da coluna product_id para TEXT em store_sale_items e store_inventory_movements
-- Isso é necessário porque os produtos existentes parecem ter IDs numéricos/timestamp (ex: "1764360554293")
-- enquanto a tabela foi criada esperando UUID.

DO $$
BEGIN
    -- Tentar alterar store_sale_items
    BEGIN
        ALTER TABLE store_sale_items DROP CONSTRAINT IF EXISTS store_sale_items_product_id_fkey;
        ALTER TABLE store_sale_items ALTER COLUMN product_id TYPE TEXT;
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'Erro ao alterar store_sale_items: %', SQLERRM;
    END;

    -- Tentar alterar store_inventory_movements
    BEGIN
        ALTER TABLE store_inventory_movements DROP CONSTRAINT IF EXISTS store_inventory_movements_product_id_fkey;
        ALTER TABLE store_inventory_movements ALTER COLUMN product_id TYPE TEXT;
    EXCEPTION
        WHEN OTHERS THEN RAISE NOTICE 'Erro ao alterar store_inventory_movements: %', SQLERRM;
    END;
END $$;
