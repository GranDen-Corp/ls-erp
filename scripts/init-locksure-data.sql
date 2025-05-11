-- 創建訂單資料
INSERT INTO orders (
  order_number,
  customer_id,
  po_number,
  amount,
  status,
  order_date,
  products,
  currency
)
SELECT
  'ORD-' || TO_CHAR(NOW() - (i || ' days')::INTERVAL, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 3, '0'),
  (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1),
  'PO-' || (SELECT SUBSTRING(name FROM 1 FOR 2) FROM customers WHERE id = (SELECT id FROM customers ORDER BY RANDOM() LIMIT 1)) || '-' || TO_CHAR(NOW() - (i || ' days')::INTERVAL, 'YYYYMMDD') || '-' || LPAD((i * 3)::TEXT, 3, '0'),
  (RANDOM() * 50000 + 5000)::NUMERIC(10, 2),
  CASE 
    WHEN i % 5 = 0 THEN '待確認'
    WHEN i % 5 = 1 THEN '進行中'
    WHEN i % 5 = 2 THEN '驗貨完成'
    WHEN i % 5 = 3 THEN '已出貨'
    ELSE '結案'
  END,
  (NOW() - (i || ' days')::INTERVAL)::DATE,
  CASE 
    WHEN i % 4 = 0 THEN '特殊冷成型零件 x ' || (RANDOM() * 1000 + 100)::INTEGER
    WHEN i % 4 = 1 THEN '汽車緊固件 x ' || (RANDOM() * 500 + 50)::INTEGER
    WHEN i % 4 = 2 THEN '特殊沖壓零件 x ' || (RANDOM() * 2000 + 200)::INTEGER
    ELSE '組裝零件 x ' || (RANDOM() * 300 + 30)::INTEGER
  END,
  'USD'
FROM generate_series(1, 20) i;

-- 創建採購單資料
INSERT INTO purchases (
  po_number,
  factory_id,
  order_id,
  amount,
  status,
  po_date,
  products,
  currency,
  product_images
)
SELECT
  'PO-' || TO_CHAR(NOW() - (i || ' days')::INTERVAL, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 3, '0'),
  (SELECT factory_id FROM factories ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM orders ORDER BY RANDOM() LIMIT 1),
  (RANDOM() * 40000 + 4000)::NUMERIC(10, 2),
  CASE 
    WHEN i % 3 = 0 THEN '待確認'
    WHEN i % 3 = 1 THEN '進行中'
    ELSE '已完成'
  END,
  (NOW() - (i || ' days')::INTERVAL)::DATE,
  CASE 
    WHEN i % 4 = 0 THEN '特殊冷成型零件 x ' || (RANDOM() * 1000 + 100)::INTEGER
    WHEN i % 4 = 1 THEN '汽車緊固件 x ' || (RANDOM() * 500 + 50)::INTEGER
    WHEN i % 4 = 2 THEN '特殊沖壓零件 x ' || (RANDOM() * 2000 + 200)::INTEGER
    ELSE '組裝零件 x ' || (RANDOM() * 300 + 30)::INTEGER
  END,
  'USD',
  CASE 
    WHEN i % 4 = 0 THEN '[{"id":"1","url":"/hex-bolt.png","alt":"特殊冷成型零件","isThumbnail":true}]'
    WHEN i % 4 = 1 THEN '[{"id":"2","url":"/socket-head-cap-screw.png","alt":"汽車緊固件","isThumbnail":true}]'
    WHEN i % 4 = 2 THEN '[{"id":"3","url":"/ball-bearing.png","alt":"特殊沖壓零件","isThumbnail":true}]'
    ELSE '[{"id":"4","url":"/tapered-roller-bearing.png","alt":"組裝零件","isThumbnail":true}]'
  END::JSONB
FROM generate_series(1, 15) i;

-- 更新訂單的關聯採購單
UPDATE orders o
SET related_purchase_ids = (
  SELECT ARRAY_AGG(p.id)
  FROM purchases p
  WHERE p.order_id = o.id
);

-- 更新採購單的產品圖片
UPDATE purchases
SET product_images = CASE 
  WHEN products LIKE '%特殊冷成型零件%' THEN '[{"id":"1","url":"/hex-bolt.png","alt":"特殊冷成型零件","isThumbnail":true}]'::JSONB
  WHEN products LIKE '%汽車緊固件%' THEN '[{"id":"2","url":"/socket-head-cap-screw.png","alt":"汽車緊固件","isThumbnail":true}]'::JSONB
  WHEN products LIKE '%特殊沖壓零件%' THEN '[{"id":"3","url":"/ball-bearing.png","alt":"特殊沖壓零件","isThumbnail":true}]'::JSONB
  WHEN products LIKE '%組裝零件%' THEN '[{"id":"4","url":"/tapered-roller-bearing.png","alt":"組裝零件","isThumbnail":true}]'::JSONB
  ELSE product_images
END;
