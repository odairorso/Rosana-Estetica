-- Conceder permissões completas para todas as tabelas do sistema
-- Tabelas de procedimentos e pacotes (estética)
GRANT ALL ON procedures TO authenticated;
GRANT SELECT ON procedures TO anon;

GRANT ALL ON packages TO authenticated;
GRANT SELECT ON packages TO anon;

-- Tabelas de estoque da loja
GRANT ALL ON store_products TO authenticated;
GRANT SELECT ON store_products TO anon;

GRANT ALL ON store_sales TO authenticated;
GRANT SELECT ON store_sales TO anon;

GRANT ALL ON store_sale_items TO authenticated;
GRANT SELECT ON store_sale_items TO anon;

GRANT ALL ON store_inventory_movements TO authenticated;
GRANT SELECT ON store_inventory_movements TO anon;

-- Tabelas de transações financeiras
GRANT ALL ON financial_transactions TO authenticated;
GRANT SELECT ON financial_transactions TO anon;

-- Tabelas de produtos de estética
GRANT ALL ON esthetic_products TO authenticated;
GRANT SELECT ON esthetic_products TO anon;

-- Tabelas principais do sistema
GRANT ALL ON clients TO authenticated;
GRANT SELECT ON clients TO anon;

GRANT ALL ON sales TO authenticated;
GRANT SELECT ON sales TO anon;

GRANT ALL ON appointments TO authenticated;
GRANT SELECT ON appointments TO anon;

GRANT ALL ON inventory TO authenticated;
GRANT SELECT ON inventory TO anon;