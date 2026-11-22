-- migration 00003_create_status_history.sql
-- Track order status changes

CREATE TABLE order_status_history (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    old_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    changed_by CHAR(36) NOT NULL,
    note TEXT NULL,
    created_at DATETIME(3),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
