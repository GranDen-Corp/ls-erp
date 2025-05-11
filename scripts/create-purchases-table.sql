-- 創建採購單資料表
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number VARCHAR(50) NOT NULL UNIQUE,
  factory_id UUID,
  factory_name VARCHAR(100),
  order_id UUID,
  order_number VARCHAR(50),
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  po_date DATE NOT NULL,
  products TEXT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  product_images JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_purchases_factory_id ON purchases(factory_id);
CREATE INDEX IF NOT EXISTS idx_purchases_order_id ON purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_po_date ON purchases(po_date);
