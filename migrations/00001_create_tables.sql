-- migration 00001_create_tables.sql
-- Create tables for Ratu Kriuk Order Management System

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE_PACKING', 'EMPLOYEE_PRODUCTION')),
    full_name VARCHAR(150),
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME(3),
    updated_at DATETIME(3)
);

CREATE TABLE customers (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    city_region_postal_code VARCHAR(100),
    created_at DATETIME(3),
    updated_at DATETIME(3)
);

CREATE TABLE products (
    id CHAR(36) PRIMARY KEY,
    sku VARCHAR(80) UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit_price DECIMAL(14,2) NOT NULL CHECK (unit_price >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME(3),
    updated_at DATETIME(3)
);

CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NULL,
    source VARCHAR(50) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    order_date DATETIME(3) NOT NULL,
    status VARCHAR(30) NOT NULL,
    product_total DECIMAL(14,2) NOT NULL CHECK (product_total >= 0),
    shipping_cost DECIMAL(14,2) NOT NULL CHECK (shipping_cost >= 0),
    grand_total DECIMAL(14,2) NOT NULL CHECK (grand_total >= 0),
    notes TEXT,
    created_by CHAR(36) NOT NULL,
    updated_by CHAR(36) NOT NULL,
    created_at DATETIME(3),
    updated_at DATETIME(3),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE order_items (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    product_name_snapshot VARCHAR(150) NOT NULL,
    unit_price_snapshot DECIMAL(14,2) NOT NULL CHECK (unit_price_snapshot >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(14,2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE production_batches (
    id CHAR(36) PRIMARY KEY,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    production_date DATE NOT NULL,
    batch_code VARCHAR(100),
    notes TEXT,
    recorded_by CHAR(36) NOT NULL,
    created_at DATETIME(3),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_production_batches_product ON production_batches(product_id);
CREATE INDEX idx_production_batches_date ON production_batches(production_date);