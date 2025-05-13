-- 首先確保 pid_part_no 欄位是 JSON 類型
ALTER TABLE products 
ALTER COLUMN pid_part_no TYPE JSONB USING pid_part_no::JSONB;

-- 創建一個觸發器函數來驗證 pid_part_no 中的 part_no 值是否存在於 products 表中
CREATE OR REPLACE FUNCTION validate_pid_part_no()
RETURNS TRIGGER AS $$
DECLARE
  part_no_value TEXT;
  part_nos JSONB;
BEGIN
  -- 只處理組裝件
  IF NEW.is_assembly IS NOT TRUE THEN
    RETURN NEW;
  END IF;
  
  -- 如果 pid_part_no 為空，則跳過驗證
  IF NEW.pid_part_no IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- 處理不同格式的 pid_part_no
  IF jsonb_typeof(NEW.pid_part_no) = 'array' THEN
    -- 如果是數組，遍歷每個元素
    FOR i IN 0..jsonb_array_length(NEW.pid_part_no) - 1 LOOP
      part_no_value := NULL;
      
      -- 如果元素是對象，獲取 part_no 屬性
      IF jsonb_typeof(NEW.pid_part_no->i) = 'object' THEN
        part_no_value := (NEW.pid_part_no->i->>'part_no');
      ELSE
        -- 如果元素是字符串，直接使用
        part_no_value := (NEW.pid_part_no->>i);
      END IF;
      
      -- 驗證 part_no 是否存在
      IF part_no_value IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM products WHERE part_no = part_no_value
      ) THEN
        RAISE EXCEPTION '零件編號 % 不存在於產品表中', part_no_value;
      END IF;
    END LOOP;
  ELSIF jsonb_typeof(NEW.pid_part_no) = 'object' THEN
    -- 如果是對象，獲取所有值
    part_nos := jsonb_object_agg(key, value) FROM jsonb_each(NEW.pid_part_no);
    
    -- 遍歷所有值
    FOR key, value IN SELECT * FROM jsonb_each(part_nos) LOOP
      part_no_value := NULL;
      
      -- 如果值是對象，獲取 part_no 屬性
      IF jsonb_typeof(value) = 'object' THEN
        part_no_value := (value->>'part_no');
      ELSE
        -- 如果值是字符串，直接使用
        part_no_value := (value#>>'{}');
      END IF;
      
      -- 驗證 part_no 是否存在
      IF part_no_value IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM products WHERE part_no = part_no_value
      ) THEN
        RAISE EXCEPTION '零件編號 % 不存在於產品表中', part_no_value;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 創建觸發器
CREATE TRIGGER check_pid_part_no
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION validate_pid_part_no();

-- 創建索引以提高查詢效能
CREATE INDEX idx_products_part_no ON products(part_no);

-- 添加註釋
COMMENT ON COLUMN products.pid_part_no IS '組裝件的零件清單，包含零件編號和數量。格式為 JSONB 數組或對象，每個元素包含 part_no 屬性。';
COMMENT ON TRIGGER check_pid_part_no ON products IS '驗證組裝件的零件編號是否存在於產品表中';
