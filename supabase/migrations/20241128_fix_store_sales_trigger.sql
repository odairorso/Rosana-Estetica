-- Trigger to automatically generate sale_number on insert
CREATE OR REPLACE FUNCTION set_sale_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sale_number IS NULL THEN
        NEW.sale_number := generate_sale_number();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_store_sale_number ON store_sales;
CREATE TRIGGER set_store_sale_number
    BEFORE INSERT ON store_sales
    FOR EACH ROW
    EXECUTE FUNCTION set_sale_number();
