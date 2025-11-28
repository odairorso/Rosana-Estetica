-- Criar políticas RLS para permitir acesso às tabelas com erro 400

-- Políticas para tabela packages
CREATE POLICY "Permitir leitura de pacotes ativos" ON packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Permitir leitura total para usuários autenticados" ON packages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para tabela procedures  
CREATE POLICY "Permitir leitura de procedimentos ativos" ON procedures
    FOR SELECT USING (is_active = true);

CREATE POLICY "Permitir leitura total para usuários autenticados" ON procedures
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para tabela store_sales
CREATE POLICY "Permitir leitura de vendas para usuários autenticados" ON store_sales
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de vendas para usuários autenticados" ON store_sales
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização de vendas para usuários autenticados" ON store_sales
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);