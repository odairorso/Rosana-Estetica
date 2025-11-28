-- Grant basic permissions to anon and authenticated roles
-- This ensures that users can access data even without authentication for basic operations

-- Grant SELECT permissions to anon role for basic data access
GRANT SELECT ON clients TO anon;
GRANT SELECT ON procedures TO anon;
GRANT SELECT ON packages TO anon;
GRANT SELECT ON appointments TO anon;
GRANT SELECT ON sales TO anon;
GRANT SELECT ON inventory TO anon;
GRANT SELECT ON store_products TO anon;
GRANT SELECT ON store_sales TO anon;
GRANT SELECT ON store_sale_items TO anon;
GRANT SELECT ON store_inventory_movements TO anon;
GRANT SELECT ON esthetic_products TO anon;
GRANT SELECT ON financial_transactions TO anon;

-- Grant full permissions to authenticated role
GRANT ALL ON clients TO authenticated;
GRANT ALL ON procedures TO authenticated;
GRANT ALL ON packages TO authenticated;
GRANT ALL ON appointments TO authenticated;
GRANT ALL ON sales TO authenticated;
GRANT ALL ON inventory TO authenticated;
GRANT ALL ON store_products TO authenticated;
GRANT ALL ON store_sales TO authenticated;
GRANT ALL ON store_sale_items TO authenticated;
GRANT ALL ON store_inventory_movements TO authenticated;
GRANT ALL ON esthetic_products TO authenticated;
GRANT ALL ON financial_transactions TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE clients_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE procedures_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE packages_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE appointments_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE sales_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE inventory_id_seq TO authenticated;