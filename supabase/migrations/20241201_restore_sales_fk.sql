-- Restore Foreign Key between store_sale_items and store_sales
DO $$
BEGIN
    -- Check if the constraint exists, if not, add it
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_sale_items_sale_id_fkey') THEN
        ALTER TABLE store_sale_items
        ADD CONSTRAINT store_sale_items_sale_id_fkey
        FOREIGN KEY (sale_id)
        REFERENCES store_sales(id)
        ON DELETE CASCADE;
    END IF;
END $$;
