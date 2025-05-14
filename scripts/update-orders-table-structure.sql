-- 1. 添加新的流水編號欄位 order_sid
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_sid SERIAL;

-- 2. 確保 order_id 欄位為 TEXT 類型
ALTER TABLE orders ALTER COLUMN order_id TYPE TEXT;

-- 3. 移除原有的主鍵約束
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pkey;

-- 4. 設置 order_sid 為新的主鍵
ALTER TABLE orders ADD PRIMARY KEY (order_sid);

-- 5. 為 order_id 添加唯一約束，確保其仍然是唯一的
ALTER TABLE orders ADD CONSTRAINT orders_order_id_unique UNIQUE (order_id);

-- 6. 創建索引以提高查詢效能
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
