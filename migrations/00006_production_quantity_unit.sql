ALTER TABLE production_batches
    ADD COLUMN quantity_unit VARCHAR(10) NULL AFTER quantity;

UPDATE production_batches
SET quantity_unit = 'PCS'
WHERE quantity_unit IS NULL;

ALTER TABLE production_batches
    MODIFY quantity_unit VARCHAR(10) NOT NULL DEFAULT 'KG';
