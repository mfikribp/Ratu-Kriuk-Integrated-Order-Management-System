-- migration 00004_add_product_category.sql
-- Add category to group product variants

ALTER TABLE products ADD COLUMN category VARCHAR(100) NULL;
