ALTER TABLE customers
    ADD COLUMN customer_type VARCHAR(20) NOT NULL DEFAULT 'REGULAR',
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN imported_by_job_id CHAR(36) NULL,
    ADD CONSTRAINT fk_customers_import_job
        FOREIGN KEY (imported_by_job_id) REFERENCES import_jobs(id) ON DELETE SET NULL;

CREATE INDEX idx_customers_active_type_created
    ON customers (is_active, customer_type, created_at, id);

CREATE INDEX idx_orders_created_at
    ON orders (created_at, id);
