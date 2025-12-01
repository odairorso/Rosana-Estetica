-- 1. Check the latest sale
SELECT id, sale_number, total_amount, created_at 
FROM store_sales 
ORDER BY created_at DESC 
LIMIT 1;

-- 2. Check items for that sale (replace the ID if needed, but this joins to find them)
SELECT ssi.* 
FROM store_sale_items ssi
JOIN store_sales ss ON ssi.sale_id = ss.id
ORDER BY ss.created_at DESC
LIMIT 5;

-- 3. Check table columns types
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('store_sales', 'store_sale_items') 
AND column_name IN ('id', 'sale_id', 'product_id');
