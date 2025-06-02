-- 為 orders 表添加港口欄位
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS port_of_loading VARCHAR(255),
ADD COLUMN IF NOT EXISTS port_of_discharge VARCHAR(255);

-- 添加註釋
COMMENT ON COLUMN orders.port_of_loading IS '出貨港';
COMMENT ON COLUMN orders.port_of_discharge IS '到貨港';
