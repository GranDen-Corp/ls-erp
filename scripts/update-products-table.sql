-- 先刪除現有的主鍵約束
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_pkey;

-- 刪除現有的唯一性約束
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_customer_id_part_no_key;

-- 添加新的主鍵約束
ALTER TABLE products
ADD CONSTRAINT products_pkey PRIMARY KEY (component_name, part_no);

-- 添加 component_name 和 part_no 的唯一性約束
ALTER TABLE products
ADD CONSTRAINT products_component_name_part_no_key UNIQUE (component_name, part_no);

-- 添加 customer_id 的索引（但不是主鍵）
CREATE INDEX IF NOT EXISTS idx_products_customer_id ON products(customer_id); 