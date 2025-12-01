-- Fix RLS Policies for Sales and related tables
-- This script safely enables RLS and creates policies, dropping existing ones to avoid conflicts.

BEGIN;

-- 1. SALES (Service Sales)
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas as operações para usuários autenticados" ON sales;
CREATE POLICY "Permitir todas as operações para usuários autenticados" ON sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. STORE SALES
ALTER TABLE store_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas as operações para usuários autenticados" ON store_sales;
CREATE POLICY "Permitir todas as operações para usuários autenticados" ON store_sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. STORE SALE ITEMS
ALTER TABLE store_sale_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas as operações para usuários autenticados" ON store_sale_items;
CREATE POLICY "Permitir todas as operações para usuários autenticados" ON store_sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. FINANCIAL TRANSACTIONS
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas as operações para usuários autenticados" ON financial_transactions;
CREATE POLICY "Permitir todas as operações para usuários autenticados" ON financial_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. STORE INVENTORY MOVEMENTS
ALTER TABLE store_inventory_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas as operações para usuários autenticados" ON store_inventory_movements;
CREATE POLICY "Permitir todas as operações para usuários autenticados" ON store_inventory_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. STORE PRODUCTS (Just in case)
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas as operações para usuários autenticados" ON store_products;
CREATE POLICY "Permitir todas as operações para usuários autenticados" ON store_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMIT;
