-- 重新命名 customers 表中的 payment_term 欄位為 payment_terms
ALTER TABLE customers 
RENAME COLUMN payment_term TO payment_terms;
