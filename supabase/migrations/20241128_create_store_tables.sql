-- Criar tabela de produtos da loja
CREATE TABLE IF NOT EXISTS store_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    size VARCHAR(20),
    color VARCHAR(50),
    description TEXT,
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    max_stock INTEGER DEFAULT 100,
    supplier VARCHAR(255),
    barcode VARCHAR(100),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de vendas da loja
CREATE TABLE IF NOT EXISTS store_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    client_id BIGINT REFERENCES clients(id),
    user_id UUID REFERENCES auth.users(id),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar sequência para números de venda
CREATE SEQUENCE IF NOT EXISTS store_sale_number_seq START 1000;

-- Criar tabela de itens da venda
CREATE TABLE IF NOT EXISTS store_sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID REFERENCES store_sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES store_products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS store_inventory_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES store_products(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'ajuste')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_id UUID, -- Pode referenciar uma venda ou compra
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de transações financeiras (unificada)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL, -- 'receita' ou 'despesa'
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('estetica', 'loja')), -- Define se é da estética ou loja
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_id UUID, -- Pode referenciar uma venda, compra, etc.
    reference_type VARCHAR(50), -- 'store_sale', 'appointment', 'purchase', etc.
    client_id BIGINT REFERENCES clients(id),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_store_products_category ON store_products(category);
CREATE INDEX IF NOT EXISTS idx_store_products_sku ON store_products(sku);
CREATE INDEX IF NOT EXISTS idx_store_products_name ON store_products(name);
CREATE INDEX IF NOT EXISTS idx_store_sales_client_id ON store_sales(client_id);
CREATE INDEX IF NOT EXISTS idx_store_sales_sale_date ON store_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_store_sale_items_sale_id ON store_sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_store_sale_items_product_id ON store_sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON store_inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON store_inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_scope ON financial_transactions(scope);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);

-- Function para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_store_products_updated_at ON store_products;
CREATE TRIGGER update_store_products_updated_at
    BEFORE UPDATE ON store_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_sales_updated_at ON store_sales;
CREATE TRIGGER update_store_sales_updated_at
    BEFORE UPDATE ON store_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_transactions_updated_at ON financial_transactions;
CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function para gerar número de venda automático
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'LV' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('store_sale_number_seq')::TEXT, 4, '0');
END;
$$ language 'plpgsql';

-- RLS Policies - Habilitar RLS
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Policies para store_products (todos podem ler, apenas autenticados podem modificar)
CREATE POLICY "store_products_select_all" ON store_products FOR SELECT USING (true);
CREATE POLICY "store_products_insert_auth" ON store_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "store_products_update_auth" ON store_products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "store_products_delete_auth" ON store_products FOR DELETE USING (auth.role() = 'authenticated');

-- Policies para store_sales (apenas autenticados)
CREATE POLICY "store_sales_select_auth" ON store_sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "store_sales_insert_auth" ON store_sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "store_sales_update_auth" ON store_sales FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies para store_sale_items (apenas autenticados)
CREATE POLICY "store_sale_items_select_auth" ON store_sale_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "store_sale_items_insert_auth" ON store_sale_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "store_sale_items_update_auth" ON store_sale_items FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies para store_inventory_movements (apenas autenticados)
CREATE POLICY "inventory_movements_select_auth" ON store_inventory_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "inventory_movements_insert_auth" ON store_inventory_movements FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies para financial_transactions (apenas autenticados)
CREATE POLICY "financial_transactions_select_auth" ON financial_transactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "financial_transactions_insert_auth" ON financial_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "financial_transactions_update_auth" ON financial_transactions FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON store_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON store_products TO authenticated;
GRANT SELECT ON store_sales TO authenticated;
GRANT INSERT, UPDATE ON store_sales TO authenticated;
GRANT SELECT ON store_sale_items TO authenticated;
GRANT INSERT, UPDATE ON store_sale_items TO authenticated;
GRANT SELECT ON store_inventory_movements TO authenticated;
GRANT INSERT ON store_inventory_movements TO authenticated;
GRANT SELECT ON financial_transactions TO authenticated;
GRANT INSERT, UPDATE ON financial_transactions TO authenticated;
GRANT USAGE ON SEQUENCE store_sale_number_seq TO authenticated;

-- Inserir produtos de teste
INSERT INTO store_products (name, sku, category, size, color, description, cost_price, sale_price, stock_quantity, min_stock, supplier) VALUES
('Calça Jeans Masculina', 'JEANS-M-001', 'Calças', 'M', 'Azul', 'Calça jeans tradicional masculina', 45.00, 89.90, 15, 5, 'Fornecedor Jeans'),
('Calça Jeans Feminina', 'JEANS-F-001', 'Calças', 'P', 'Preto', 'Calça jeans skinny feminina', 50.00, 99.90, 12, 5, 'Fornecedor Jeans'),
('Camiseta Básica Branca', 'CAMI-B-001', 'Camisetas', 'M', 'Branco', 'Camiseta básica 100% algodão', 12.00, 29.90, 25, 10, 'Têxtil Brasil'),
('Camiseta Polo Azul', 'POLO-A-001', 'Camisetas', 'G', 'Azul Marinho', 'Camiseta polo com bolso', 25.00, 59.90, 8, 5, 'Têxtil Brasil'),
('Calça Social Masculina', 'SOCIAL-M-001', 'Calças', 'G', 'Cinza', 'Calça social para trabalho', 60.00, 129.90, 6, 3, 'Fashion Wear'),
('Camiseta Estampada', 'ESTA-C-001', 'Camisetas', 'P', 'Colorido', 'Camiseta com estampa tropical', 18.00, 45.90, 20, 8, 'Têxtil Brasil'),
('Calça Moletom', 'MOLETOM-001', 'Calças', 'GG', 'Cinza', 'Calça moletom confortável', 35.00, 79.90, 10, 5, 'Confort Max'),
('Regata Esportiva', 'REGATA-001', 'Camisetas', 'M', 'Preto', 'Regata para academia', 15.00, 35.90, 30, 15, 'Sport Line');

-- Criar view para relatório de vendas da loja
CREATE OR REPLACE VIEW store_sales_report AS
SELECT 
    ss.id,
    ss.sale_number,
    ss.sale_date,
    c.name as client_name,
    c.phone as client_phone,
    ss.total_amount,
    ss.discount_amount,
    ss.payment_method,
    ss.payment_status,
    COUNT(si.id) as items_count,
    u.email as seller_email
FROM store_sales ss
LEFT JOIN clients c ON ss.client_id = c.id
LEFT JOIN store_sale_items si ON ss.id = si.sale_id
LEFT JOIN auth.users u ON ss.user_id = u.id
GROUP BY ss.id, ss.sale_number, ss.sale_date, c.name, c.phone, ss.total_amount, ss.discount_amount, ss.payment_method, ss.payment_status, u.email;