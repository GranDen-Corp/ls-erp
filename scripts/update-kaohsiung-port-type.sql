-- 更新高雄港為主要出貨港
UPDATE ports 
SET port_type = '主要出貨港'
WHERE un_locode = 'TWKHH' OR port_name_en ILIKE '%kaohsiung%' OR port_name_zh LIKE '%高雄%';

-- 如果高雄港不存在，則新增
INSERT INTO ports (region, port_name_zh, port_name_en, un_locode, port_type)
SELECT '亞洲', '高雄港', 'Kaohsiung', 'TWKHH', '主要出貨港'
WHERE NOT EXISTS (
    SELECT 1 FROM ports 
    WHERE un_locode = 'TWKHH' OR port_name_en ILIKE '%kaohsiung%' OR port_name_zh LIKE '%高雄%'
);

-- 確認更新結果
SELECT * FROM ports WHERE port_type = '主要出貨港';
