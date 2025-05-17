-- 創建產品類別表
CREATE TABLE IF NOT EXISTS product_types (
  id SERIAL PRIMARY KEY,
  type_code VARCHAR(50) NOT NULL UNIQUE,
  type_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入初始數據
INSERT INTO product_types (type_code, type_name, description)
VALUES 
  ('assembly', '組合件', '由多個零件組合而成的產品'),
  ('bolt', '螺栓', '用於固定或連接的螺紋緊固件'),
  ('precision', '精密車床件', '使用車床加工的高精度零件'),
  ('stamping', '沖壓件', '使用沖壓工藝製造的金屬零件'),
  ('component', '部件', '構成產品的基本單元')
ON CONFLICT (type_code) DO UPDATE
SET type_name = EXCLUDED.type_name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;
