-- Fix Orphaned Records and Restore Foreign Keys (Corrected)
DO $$
BEGIN
    -- 1. Clean up orphaned records
    -- We cast id to text to avoid "operator does not exist: text = uuid" error
    DELETE FROM store_sale_items
    WHERE product_id NOT IN (SELECT id::text FROM store_products);

    DELETE FROM store_inventory_movements
    WHERE product_id NOT IN (SELECT id::text FROM store_products);

    -- 2. Ensure store_products.id is TEXT
    -- We drop the PK first to allow the type change
    ALTER TABLE store_products DROP CONSTRAINT IF EXISTS store_products_pkey CASCADE;
    
    -- Change column type to TEXT
    ALTER TABLE store_products ALTER COLUMN id TYPE TEXT;
    
    -- Re-add Primary Key
    ALTER TABLE store_products ADD PRIMARY KEY (id);

    -- 3. Restore Foreign Keys
    -- Drop existing constraints to avoid conflicts
    ALTER TABLE store_sale_items DROP CONSTRAINT IF EXISTS store_sale_items_product_id_fkey;
    ALTER TABLE store_inventory_movements DROP CONSTRAINT IF EXISTS store_inventory_movements_product_id_fkey;

    -- Add Foreign Key for store_sale_items
    ALTER TABLE store_sale_items
    ADD CONSTRAINT store_sale_items_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES store_products(id)
    ON DELETE SET NULL;

    -- Add Foreign Key for store_inventory_movements
    ALTER TABLE store_inventory_movements
    ADD CONSTRAINT store_inventory_movements_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES store_products(id)
    ON DELETE CASCADE;

END $$;
