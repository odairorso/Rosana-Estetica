-- Fix Orphaned Records and Restore Foreign Keys
DO $$
BEGIN
    -- 1. Clean up orphaned records in store_sale_items
    -- Delete items where the product_id does not exist in store_products
    DELETE FROM store_sale_items
    WHERE product_id NOT IN (SELECT id FROM store_products);

    -- 2. Clean up orphaned records in store_inventory_movements
    DELETE FROM store_inventory_movements
    WHERE product_id NOT IN (SELECT id FROM store_products);

    -- 3. Now that data is clean, we can safely restore the Foreign Keys
    
    -- Drop constraints if they exist (just to be safe)
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
