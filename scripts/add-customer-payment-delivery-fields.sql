-- 新增付款方式和交貨方式欄位到 customers 表
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50);

-- 新增註解說明
COMMENT ON COLUMN customers.payment_method IS '付款方式，對應 payment_terms 表的 code';
COMMENT ON COLUMN customers.delivery_method IS '交貨方式，對應 trade_terms 表的 code';
