-- 1. 在orders表中添加order_batch_id欄位
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_batch_id VARCHAR(50);

-- 2. 創建order_batch表
CREATE TABLE IF NOT EXISTS order_batch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_batch_id VARCHAR(50) NOT NULL UNIQUE,
  order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id),
  product_index VARCHAR(10) NOT NULL, -- 產品索引，如 'A', 'B', 'C'
  batch_number INTEGER NOT NULL, -- 批次編號，如 1, 2, 3
  part_no VARCHAR(100) NOT NULL, -- 產品編號
  description TEXT, -- 產品描述
  quantity INTEGER NOT NULL, -- 數量
  unit_price DECIMAL(12, 2) NOT NULL, -- 單價
  currency VARCHAR(3) DEFAULT 'USD', -- 貨幣
  is_assembly BOOLEAN DEFAULT FALSE, -- 是否為組件
  specifications TEXT, -- 產品規格
  remarks TEXT, -- 備註
  discount DECIMAL(5, 2) DEFAULT 0, -- 折扣百分比
  tax_rate DECIMAL(5, 2) DEFAULT 0, -- 稅率百分比
  total_price DECIMAL(12, 2), -- 總價
  planned_ship_date TIMESTAMP WITH TIME ZONE, -- 計劃出貨日期
  status VARCHAR(20) DEFAULT 'pending', -- 批次狀態
  tracking_number VARCHAR(100), -- 追蹤號碼
  actual_ship_date TIMESTAMP WITH TIME ZONE, -- 實際出貨日期
  estimated_arrival_date TIMESTAMP WITH TIME ZONE, -- 預計到達日期
  customs_info JSONB, -- 海關資訊
  metadata JSONB, -- 其他元數據
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 創建索引以提高查詢效能
CREATE INDEX IF NOT EXISTS idx_order_batch_order_id ON order_batch(order_id);
CREATE INDEX IF NOT EXISTS idx_order_batch_part_no ON order_batch(part_no);
CREATE INDEX IF NOT EXISTS idx_order_batch_status ON order_batch(status);

-- 4. 創建更新時間觸發器
CREATE OR REPLACE FUNCTION update_order_batch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_batch_updated_at
BEFORE UPDATE ON order_batch
FOR EACH ROW
EXECUTE FUNCTION update_order_batch_updated_at();
