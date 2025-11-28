-- Verificar políticas RLS existentes para as tabelas com erro
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check  
FROM pg_policies 
WHERE tablename IN ('packages', 'procedures', 'store_sales')
ORDER BY tablename, policyname;