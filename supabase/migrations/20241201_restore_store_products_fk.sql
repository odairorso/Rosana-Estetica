-- Restore Foreign Key for store_sale_items
DO $$
BEGIN
    -- Check if constraint exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_sale_items_product_id_fkey') THEN
        ALTER TABLE store_sale_items
        ADD CONSTRAINT store_sale_items_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES store_products(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Restore Foreign Key for store_inventory_movements (good practice to restore this too)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_inventory_movements_product_id_fkey') THEN
        ALTER TABLE store_inventory_movements
        ADD CONSTRAINT store_inventory_movements_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES store_products(id)
        ON DELETE CASCADE;
    END IF;
END $$;
