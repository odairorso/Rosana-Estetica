SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('financial_transactions', 'store_sales') 
AND column_name IN ('id', 'reference_id');
