-- 創建供應商資料表
CREATE TABLE IF NOT EXISTS factories (
  factory_id VARCHAR(50) PRIMARY KEY,
  factory_name VARCHAR(100) NOT NULL,
  factory_id VARCHAR(50),
  contact_person VARCHAR(100),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(50),
  payment_term VARCHAR(100),
  delivery_term VARCHAR(100),
  lead_time INTEGER,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  factory_type VARCHAR(50),
  category1 VARCHAR(50),
  category2 VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_factories_factory_id ON factories(factory_id);
CREATE INDEX IF NOT EXISTS idx_factories_factory_name ON factories(factory_name);

-- 插入測試資料
INSERT INTO factories (
  factory_id, factory_name, factory_id, contact_person, contact_email, 
  contact_phone, payment_term, delivery_term, lead_time, address, 
  notes, is_active, factory_type, category1
) VALUES 
('SUP-001', '台灣精密五金有限公司', 'FAC-001', '張志明', 'contact@twpm.com', 
 '02-2345-6789', '月結30天', 'FOB 基隆', 14, '新北市新莊區中正路123號', 
 '專業生產高精度螺絲和緊固件', TRUE, '製造商', '五金零件'),

('SUP-002', '大陸精密機械廠', 'FAC-002', '李大明', 'contact@cpm.com', 
 '86-755-1234-5678', '月結60天', 'FOB 深圳', 21, '廣東省深圳市寶安區工業園區B12', 
 '大型機械零件製造商，專注於汽車和工業設備零件', TRUE, '製造商', '機械零件'),

('SUP-003', '歐洲精密軸承公司', 'FAC-003', 'John Smith', 'john@epb.eu', 
 '49-123-456789', '預付30%，出貨付70%', 'CIF 台北', 30, 'Industriestrasse 45, Berlin, Germany', 
 '高品質軸承供應商，專注於精密工業應用', TRUE, '製造商', '軸承'),

('SUP-004', '美國工業零件公司', 'FAC-004', 'Mike Johnson', 'mike@usip.com', 
 '1-555-123-4567', 'NET 45', 'FOB 洛杉磯', 25, '123 Industrial Blvd, Chicago, IL, USA', 
 '工業零件和組件的主要供應商，專注於高品質標準件', TRUE, '批發商', '標準件'),

('SUP-005', '日本精密電子零件株式會社', 'FAC-005', '田中健太', 'tanaka@jpec.jp', 
 '81-3-1234-5678', '月結45天', 'FOB 東京', 18, '東京都品川區西五反田2-11-2', 
 '專業生產高精度電子零件和連接器', TRUE, '製造商', '電子零件'),

('SUP-006', '韓國工業材料有限公司', 'FAC-006', '金正浩', 'kim@kim.kr', 
 '82-2-1234-5678', '月結30天', 'FOB 釜山', 15, '首爾特別市江南區德黑蘭路306號', 
 '專業提供各種工業用特殊材料和表面處理服務', TRUE, '材料供應商', '特殊材料'),

('SUP-007', '台灣塑膠模具廠', 'FAC-007', '林小明', 'lin@tpm.com.tw', 
 '04-2345-6789', '月結60天', 'EXW', 10, '台中市西屯區工業區一路123號', 
 '專業塑膠模具設計和製造，適用於各種工業應用', TRUE, '製造商', '塑膠模具'),

('SUP-008', '印度金屬加工廠', 'FAC-008', 'Rajesh Patel', 'rajesh@imw.in', 
 '91-22-1234-5678', '預付50%，出貨付50%', 'FOB 孟買', 28, 'Industrial Area, Phase II, New Delhi, India', 
 '專業金屬加工和表面處理，成本效益高', TRUE, '製造商', '金屬加工'),

('SUP-009', '越南組裝工廠', 'FAC-009', 'Nguyen Van Minh', 'nguyen@vaf.vn', 
 '84-28-1234-5678', '月結45天', 'FOB 胡志明市', 20, 'Industrial Zone, Binh Duong Province, Vietnam', 
 '低成本高效率的組裝服務，適合勞動密集型產品', TRUE, '組裝廠', '組裝服務'),

('SUP-010', '墨西哥汽車零件廠', 'FAC-010', 'Carlos Rodriguez', 'carlos@map.mx', 
 '52-55-1234-5678', '月結60天', 'FOB 墨西哥城', 22, 'Zona Industrial, Guadalajara, Mexico', 
 '專注於汽車零件製造，符合北美市場標準', TRUE, '製造商', '汽車零件');
