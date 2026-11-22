package orders

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
)

type Repository struct {
	DB *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{DB: db}
}

func (r *Repository) Create(ctx context.Context, o *Order, items []OrderItem) error {
	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	o.ID = uuid.New().String()
	query := `INSERT INTO orders (id, order_number, source, customer_id, order_date, status, product_total, shipping_cost, grand_total, notes, created_by, updated_by, created_at, updated_at)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`
	
	_, err = tx.ExecContext(ctx, query, o.ID, o.OrderNumber, o.Source, o.CustomerID, o.OrderDate, o.Status, o.ProductTotal, o.ShippingCost, o.GrandTotal, o.Notes, o.CreatedBy, o.UpdatedBy)
	if err != nil {
		return fmt.Errorf("failed to insert order: %w", err)
	}

	for _, item := range items {
		item.ID = uuid.New().String()
		item.OrderID = o.ID
		itemQuery := `INSERT INTO order_items (id, order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, subtotal)
		VALUES (?, ?, ?, ?, ?, ?, ?)`
		_, err = tx.ExecContext(ctx, itemQuery, item.ID, item.OrderID, item.ProductID, item.ProductNameSnapshot, item.UnitPriceSnapshot, item.Quantity, item.Subtotal)
		if err != nil {
			return fmt.Errorf("failed to insert order item: %w", err)
		}
	}

	historyQuery := `INSERT INTO order_status_history (id, order_id, old_status, new_status, changed_by, note, created_at)
	VALUES (?, ?, ?, ?, ?, ?, NOW(3))`
	_, err = tx.ExecContext(ctx, historyQuery, uuid.New().String(), o.ID, nil, o.Status, o.CreatedBy, "Order created")
	if err != nil {
		return fmt.Errorf("failed to insert status history: %w", err)
	}

	return tx.Commit()
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Order, []OrderItem, error) {
	query := `SELECT id, order_number, source, customer_id, order_date, status, product_total, shipping_cost, grand_total, notes, created_by, updated_by, created_at, updated_at FROM orders WHERE id = ?`
	
	var o Order
	err := r.DB.QueryRowContext(ctx, query, id).Scan(&o.ID, &o.OrderNumber, &o.Source, &o.CustomerID, &o.OrderDate, &o.Status, &o.ProductTotal, &o.ShippingCost, &o.GrandTotal, &o.Notes, &o.CreatedBy, &o.UpdatedBy, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return nil, nil, err
	}

	itemQuery := `SELECT id, order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, subtotal FROM order_items WHERE order_id = ?`
	rows, err := r.DB.QueryContext(ctx, itemQuery, id)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var items []OrderItem
	for rows.Next() {
		var i OrderItem
		err := rows.Scan(&i.ID, &i.OrderID, &i.ProductID, &i.ProductNameSnapshot, &i.UnitPriceSnapshot, &i.Quantity, &i.Subtotal)
		if err != nil {
			return nil, nil, err
		}
		items = append(items, i)
	}

	return &o, items, nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id, oldStatus, newStatus, changedBy, note string) error {
	tx, err := r.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE orders SET status = ?, updated_by = ?, updated_at = NOW(3) WHERE id = ? AND status = ?`
	result, err := tx.ExecContext(ctx, query, newStatus, changedBy, id, oldStatus)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("order status mismatch or order not found")
	}

	historyQuery := `INSERT INTO order_status_history (id, order_id, old_status, new_status, changed_by, note, created_at)
	VALUES (?, ?, ?, ?, ?, ?, NOW(3))`
	_, err = tx.ExecContext(ctx, historyQuery, uuid.New().String(), id, oldStatus, newStatus, changedBy, note)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *Repository) GetAll(ctx context.Context, limit, offset int) ([]Order, error) {
	query := `SELECT id, order_number, source, customer_id, order_date, status, product_total, shipping_cost, grand_total, notes, created_by, updated_by, created_at, updated_at 
	FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?`
	
	rows, err := r.DB.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		err := rows.Scan(&o.ID, &o.OrderNumber, &o.Source, &o.CustomerID, &o.OrderDate, &o.Status, &o.ProductTotal, &o.ShippingCost, &o.GrandTotal, &o.Notes, &o.CreatedBy, &o.UpdatedBy, &o.CreatedAt, &o.UpdatedAt)
		if err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}

	return orders, nil
}