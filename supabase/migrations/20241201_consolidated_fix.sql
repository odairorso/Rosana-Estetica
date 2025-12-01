-- Consolidated Fix for Store Products
-- 1. Fix ID type to TEXT
-- 2. Restore Foreign Keys

DO $$
BEGIN
    -- 1. Drop existing constraints that might block the change
    ALTER TABLE store_sale_items DROP CONSTRAINT IF EXISTS store_sale_items_product_id_fkey;
    ALTER TABLE store_inventory_movements DROP CONSTRAINT IF EXISTS store_inventory_movements_product_id_fkey;
    ALTER TABLE store_products DROP CONSTRAINT IF EXISTS store_products_pkey CASCADE;

    -- 2. Change ID type to TEXT
    -- Using USING to ensure conversion if there's data (though usually UUID to TEXT is implicit)
    ALTER TABLE store_products ALTER COLUMN id TYPE TEXT;

    -- 3. Re-add Primary Key
    ALTER TABLE store_products ADD PRIMARY KEY (id);

    -- 4. Restore Foreign Key for store_sale_items
    ALTER TABLE store_sale_items
    ADD CONSTRAINT store_sale_items_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES store_products(id)
    ON DELETE SET NULL;

    -- 5. Restore Foreign Key for store_inventory_movements
    ALTER TABLE store_inventory_movements
    ADD CONSTRAINT store_inventory_movements_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES store_products(id)
    ON DELETE CASCADE;

END $$;
