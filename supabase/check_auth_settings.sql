-- Verificar configurações de autenticação e sessões
-- Verificar se há políticas específicas para auth.users
SELECT schemaname, tablename, policyname, permissive, roles, cmd  
FROM pg_policies 
WHERE schemaname = 'auth' 
ORDER BY tablename, policyname;

-- Verificar configurações de JWT e auth
SELECT name, setting FROM pg_settings WHERE name LIKE '%jwt%' OR name LIKE '%auth%';

-- Verificar se há restrições nas tabelas de auth
SELECT table_name, constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_schema = 'auth' 
ORDER BY table_name;