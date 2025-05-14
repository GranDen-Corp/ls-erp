-- 1. 備份現有訂單資料
CREATE TABLE IF NOT EXISTS orders_backup AS SELECT * FROM orders;

-- 2. 確保所有訂單都有有效的 order_id
UPDATE orders SET order_id = 'ORD-' || order_sid WHERE order_id IS NULL;

-- 3. 確保 order_id 欄位中的值是唯一的
-- 如果有重複的 order_id，為它們添加後綴
WITH duplicates AS (
  SELECT order_id, COUNT(*) as count
  FROM orders
  GROUP BY order_id
  HAVING COUNT(*) > 1
)
UPDATE orders o
SET order_id = o.order_id || '-' || o.order_sid
WHERE EXISTS (
  SELECT 1 FROM duplicates d
  WHERE d.order_id = o.order_id
);

-- 4. 添加唯一約束
ALTER TABLE orders ADD CONSTRAINT orders_order_id_unique UNIQUE (order_id);
