-- 創建主要港口資料表
CREATE TABLE IF NOT EXISTS ports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region VARCHAR(100) NOT NULL,
  port_name_zh VARCHAR(200) NOT NULL,
  port_name_en VARCHAR(200) NOT NULL,
  un_locode VARCHAR(10) UNIQUE NOT NULL,
  port_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引以提高查詢性能
CREATE INDEX IF NOT EXISTS idx_ports_region ON ports(region);
CREATE INDEX IF NOT EXISTS idx_ports_un_locode ON ports(un_locode);
CREATE INDEX IF NOT EXISTS idx_ports_port_type ON ports(port_type);
CREATE INDEX IF NOT EXISTS idx_ports_port_name_zh ON ports(port_name_zh);
CREATE INDEX IF NOT EXISTS idx_ports_port_name_en ON ports(port_name_en);

-- 添加註釋
COMMENT ON TABLE ports IS '主要港口資料表';
COMMENT ON COLUMN ports.region IS '地區';
COMMENT ON COLUMN ports.port_name_zh IS '港口名稱（中文）';
COMMENT ON COLUMN ports.port_name_en IS '港口名稱（英文）';
COMMENT ON COLUMN ports.un_locode IS 'UN/LOCODE 聯合國港口代碼';
COMMENT ON COLUMN ports.port_type IS '港口類型';
