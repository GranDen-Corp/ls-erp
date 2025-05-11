-- 創建訂單資料表
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  po_number VARCHAR(50),
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  order_date DATE NOT NULL,
  products TEXT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建訂單更新觸發器
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at();

-- 插入一些示例訂單數據
INSERT INTO orders (order_number, customer_id, po_number, amount, status, order_date, products, currency)
VALUES
  ('ORD-2023-0012', (SELECT id FROM customers LIMIT 1), 'PO-TE-2023-042', 25200, '待確認', '2023-04-15', '特殊冷成型零件 x 500', 'USD'),
  ('ORD-2023-0011', (SELECT id FROM customers OFFSET 1 LIMIT 1), 'PO-HT-2023-118', 12400, '進行中', '2023-04-14', '汽車緊固件 x 2000', 'USD'),
  ('ORD-2023-0010', (SELECT id FROM customers OFFSET 2 LIMIT 1), 'PO-TI-2023-087', 8750, '驗貨完成', '2023-04-12', '特殊沖壓零件 x 5000', 'USD'),
  ('ORD-2023-0009', (SELECT id FROM customers OFFSET 3 LIMIT 1), 'PO-KM-2023-063', 18300, '已出貨', '2023-04-10', '組裝零件 x 300', 'USD'),
  ('ORD-2023-0008', (SELECT id FROM customers OFFSET 4 LIMIT 1), 'PO-TC-2023-055', 9200, '結案', '2023-04-08', '汽車零件 x 150', 'USD');
