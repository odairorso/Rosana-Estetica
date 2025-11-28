-- Verificar estrutura das tabelas packages e procedures
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name IN ('packages', 'procedures')
ORDER BY table_name, ordinal_position;