-- 檢查 products 表的所有約束
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(pg_constraint.oid) AS constraint_definition,
    contype AS constraint_type,
    pg_class.relname AS table_name
FROM pg_constraint
INNER JOIN pg_class ON pg_constraint.conrelid = pg_class.oid
INNER JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE pg_class.relname = 'products'
  AND pg_namespace.nspname = 'public'
ORDER BY contype; 