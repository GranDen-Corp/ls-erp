-- 在確認所有數據已成功遷移到新結構後，移除舊的欄位
ALTER TABLE orders DROP COLUMN IF EXISTS part_no_assembly;
ALTER TABLE orders DROP COLUMN IF EXISTS part_no_list;
