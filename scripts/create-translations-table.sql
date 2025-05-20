-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  chinese TEXT NOT NULL,
  english TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, chinese)
);

-- Insert process category translations
INSERT INTO translations (category, chinese, english) VALUES
  ('process', '材料', 'Material'),
  ('process', '成型', 'Forming'),
  ('process', '搓牙', 'Threading'),
  ('process', '熱處理', 'Heat Treatment'),
  ('process', '電鍍', 'Electroplating'),
  ('process', '篩選', 'Screening'),
  ('process', '組裝', 'Assembly'),
  ('process', '包裝', 'Packaging'),
  ('process', '檢驗', 'Inspection'),
  ('process', '測試', 'Testing')
ON CONFLICT (category, chinese) DO UPDATE SET
  english = EXCLUDED.english,
  updated_at = CURRENT_TIMESTAMP;

-- Insert process requirements translations
INSERT INTO translations (category, chinese, english) VALUES
  ('process_requirements', 'SAE 10B21', 'SAE 10B21'),
  ('process_requirements', '硬度HRC 28-32，拉力800Mpa，降伏640Mpa', 'Hardness HRC 28-32, Tensile strength 800Mpa, Yield 640Mpa'),
  ('process_requirements', '三價鉻鋅SUM MIN，鹽測12/48', 'Trivalent chromium zinc SUM MIN, Salt spray test 12/48'),
  ('process_requirements', '50 PPM：混料、總長', '50 PPM: Mixed materials, Total length')
ON CONFLICT (category, chinese) DO UPDATE SET
  english = EXCLUDED.english,
  updated_at = CURRENT_TIMESTAMP;

-- Insert process terms translations
INSERT INTO translations (category, chinese, english) VALUES
  ('process_terms', '材證', 'Material Certificate'),
  ('process_terms', '硬度', 'Hardness'),
  ('process_terms', '拉力', 'Tensile Strength'),
  ('process_terms', '膜厚', 'Film Thickness'),
  ('process_terms', '鹽測', 'Salt Spray Test'),
  ('process_terms', '除氫', 'Hydrogen Removal'),
  ('process_terms', '篩選報告', 'Screening Report')
ON CONFLICT (category, chinese) DO UPDATE SET
  english = EXCLUDED.english,
  updated_at = CURRENT_TIMESTAMP;
