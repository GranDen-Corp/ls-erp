-- 移除 component_name_en 的唯一性約束
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_component_name_en_key;
