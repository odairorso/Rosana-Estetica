-- Fix product_id type in related tables to TEXT
BEGIN;

-- 1. Fix store_sale_items
-- Drop constraint if it exists (might be named differently, so we try standard names)
ALTER TABLE store_sale_items 
DROP CONSTRAINT IF EXISTS store_sale_items_product_id_fkey;

-- Change column type
ALTER TABLE store_sale_items 
ALTER COLUMN product_id TYPE TEXT;

-- 2. Fix store_inventory_movements
ALTER TABLE store_inventory_movements 
DROP CONSTRAINT IF EXISTS store_inventory_movements_product_id_fkey;

ALTER TABLE store_inventory_movements 
ALTER COLUMN product_id TYPE TEXT;

-- 3. Restore Foreign Keys (referencing store_products.id which is already TEXT)
-- We assume store_products.id is already TEXT from previous fix.
ALTER TABLE store_sale_items
ADD CONSTRAINT store_sale_items_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES store_products(id);

ALTER TABLE store_inventory_movements
ADD CONSTRAINT store_inventory_movements_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES store_products(id);

COMMIT;
