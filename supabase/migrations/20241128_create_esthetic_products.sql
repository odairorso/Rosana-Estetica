-- Criar tabela de produtos da estética (separada da loja)
CREATE TABLE IF NOT EXISTS esthetic_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    description TEXT,
    unit VARCHAR(50) DEFAULT 'unidade',
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    max_stock INTEGER DEFAULT 100,
    supplier VARCHAR(255),
    barcode VARCHAR(100),
    location VARCHAR(100),
    expiration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_esthetic_products_category ON esthetic_products(category);
CREATE INDEX IF NOT EXISTS idx_esthetic_products_name ON esthetic_products(name);

-- Function para atualizar timestamp
CREATE OR REPLACE FUNCTION update_esthetic_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_esthetic_products_updated_at ON esthetic_products;
CREATE TRIGGER update_esthetic_products_updated_at
    BEFORE UPDATE ON esthetic_products
    FOR EACH ROW
    EXECUTE FUNCTION update_esthetic_updated_at_column();

-- RLS Policies
ALTER TABLE esthetic_products ENABLE ROW LEVEL SECURITY;

-- Policies para esthetic_products (todos podem ler, apenas autenticados podem modificar)
CREATE POLICY "esthetic_products_select_all" ON esthetic_products FOR SELECT USING (true);
CREATE POLICY "esthetic_products_insert_auth" ON esthetic_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "esthetic_products_update_auth" ON esthetic_products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "esthetic_products_delete_auth" ON esthetic_products FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON esthetic_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON esthetic_products TO authenticated;

-- Inserir produtos de estética tradicionais
INSERT INTO esthetic_products (name, category, brand, description, unit, cost_price, sale_price, stock_quantity, min_stock, supplier, location) VALUES
('Ácido Glicólico 30%', 'Produtos Químicos', 'Dermage', 'Ácido glicólico para peeling químico', 'frasco', 25.00, 85.00, 10, 3, 'Dermage Brasil', 'Prateleira A1'),
('Máscara de Ouro 24k', 'Máscaras Faciais', 'Gold Beauty', 'Máscara facial com colágeno e ouro', 'unidade', 45.00, 150.00, 8, 2, 'Gold Beauty', 'Prateleira A2'),
('Creme Hidratante Facial', 'Hidratantes', 'La Roche', 'Creme hidratante para peles sensíveis', 'frasco', 35.00, 120.00, 15, 5, 'La Roche', 'Prateleira B1'),
('Sérum Vitamina C 20%', 'Séruns', 'Skinceuticals', 'Sérum antioxidante com vitamina C pura', 'frasco', 80.00, 280.00, 6, 2, 'Skinceuticals', 'Prateleira B2'),
('Água Micelar 500ml', 'Limpeza', 'Bioderma', 'Água micelar para remoção de maquiagem', 'frasco', 15.00, 45.00, 20, 8, 'Bioderma', 'Prateleira C1'),
('Protetor Solar FPS 60', 'Proteção Solar', 'Vichy', 'Protetor solar com toque seco', 'frasco', 28.00, 95.00, 12, 4, 'Vichy', 'Prateleira C2'),
('Ácido Salicílico 2%', 'Produtos Químicos', 'NeoStrata', 'Ácido salicílico para acne', 'frasco', 22.00, 75.00, 8, 3, 'NeoStrata', 'Prateleira A3'),
('Máscara de Argila', 'Máscaras Faciais', 'Amazonia', 'Máscara de argila verde amazônica', 'pote', 18.00, 60.00, 10, 3, 'Amazonia Natural', 'Prateleira A4'),
('Tônico Facial Adstringente', 'Tônicos', 'Avène', 'Tônico para peles oleosas', 'frasco', 20.00, 68.00, 14, 5, 'Avène', 'Prateleira C3'),
('Creme Anti-idade', 'Anti-idade', 'Olay', 'Creme com retinol e peptídeos', 'frasco', 55.00, 195.00, 7, 2, 'Olay Professional', 'Prateleira B3'),
('Gel de Limpeza Facial', 'Limpeza', 'Cetaphil', 'Gel limpador suave para todos os tipos de pele', 'frasco', 12.00, 42.00, 18, 6, 'Cetaphil', 'Prateleira C4'),
('Óleo de Rosa Mosqueta', 'Óleos', 'Andalou', 'Óleo puro de rosa mosqueta orgânica', 'frasco', 30.00, 105.00, 9, 3, 'Andalou Naturals', 'Prateleira D1'),
('Esfoliante Facial', 'Esfoliantes', 'St. Ives', 'Esfoliante com microesferas naturais', 'pote', 8.00, 28.00, 25, 10, 'St. Ives', 'Prateleira D2'),
('Máscara Hidratante Noturna', 'Máscaras', 'Laneige', 'Máscara de hidratação noturna', 'pote', 38.00, 135.00, 5, 2, 'Laneige', 'Prateleira B4'),
('Sérum de Ácido Hialurônico', 'Séruns', 'The Ordinary', 'Sérum com 2% de ácido hialurônico', 'frasco', 15.00, 52.00, 16, 5, 'The Ordinary', 'Prateleira D3');