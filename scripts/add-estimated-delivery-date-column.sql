-- 為 orders 表添加 estimated_delivery_date 欄位
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

-- 添加註釋說明欄位用途
COMMENT ON COLUMN orders.estimated_delivery_date IS '預期(期望)交貨日期';

-- 為新欄位創建索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_orders_estimated_delivery_date 
ON orders(estimated_delivery_date);
