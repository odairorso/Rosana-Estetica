-- Criar políticas RLS corretas baseadas na estrutura real das tabelas

-- Políticas para tabela packages (coluna: active, não is_active)
CREATE POLICY "Permitir leitura de pacotes ativos" ON packages
    FOR SELECT USING (active = true);

CREATE POLICY "Permitir todas as operações para usuários autenticados" ON packages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para tabela procedures (coluna: active, não is_active)
CREATE POLICY "Permitir leitura de procedimentos ativos" ON procedures
    FOR SELECT USING (active = true);

CREATE POLICY "Permitir todas as operações para usuários autenticados" ON procedures
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para tabela store_sales
CREATE POLICY "Permitir leitura de vendas para usuários autenticados" ON store_sales
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de vendas para usuários autenticados" ON store_sales
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização de vendas para usuários autenticados" ON store_sales
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);