-- 從products表中刪除jinzhan_drawing欄位
ALTER TABLE products 
DROP COLUMN IF EXISTS jinzhan_drawing,
DROP COLUMN IF EXISTS drawing_version;
