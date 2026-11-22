-- migration 00002_create_import_tables.sql
-- Tables for marketplace CSV import jobs and per-row results

CREATE TABLE import_jobs (
    id CHAR(36) PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    original_filename VARCHAR(255),
    status VARCHAR(30) NOT NULL,
    total_rows INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    duplicate_count INT NOT NULL DEFAULT 0,
    created_by CHAR(36) NOT NULL,
    created_at DATETIME(3),
    finished_at DATETIME(3) NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE import_row_results (
    id CHAR(36) PRIMARY KEY,
    import_job_id CHAR(36) NOT NULL,
    `row_number` INT NOT NULL,
    external_order_number VARCHAR(100),
    result VARCHAR(20) NOT NULL,
    message TEXT,
    order_id CHAR(36) NULL,
    created_at DATETIME(3),
    FOREIGN KEY (import_job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
);

CREATE INDEX idx_import_row_results_job ON import_row_results(import_job_id);
