package packing

import (
	"context"
	"database/sql"
	"errors"

	"github.com/ratu-kriuk/api/internal/catalog"
	"github.com/ratu-kriuk/api/internal/orders"
)

type Repository struct {
	DB           *sql.DB
	OrderRepo    *orders.Repository
	CustomerRepo *catalog.CustomerRepository
}

func NewRepository(db *sql.DB, orderRepo *orders.Repository, customerRepo *catalog.CustomerRepository) *Repository {
	return &Repository{
		DB:           db,
		OrderRepo:    orderRepo,
		CustomerRepo: customerRepo,
	}
}

func (r *Repository) GetPackingList(ctx context.Context, limit, offset int, status, search string) ([]PackingOrder, int, error) {
	if status == "" {
		status = "Diproses"
	}
	where := " WHERE o.status = ?"
	args := []any{status}
	if search != "" {
		where += " AND (o.order_number LIKE ? OR c.name LIKE ?)"
		args = append(args, "%"+search+"%", "%"+search+"%")
	}

	var total int
	countQuery := `SELECT COUNT(*) FROM orders o JOIN customers c ON o.customer_id = c.id` + where
	if err := r.DB.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
	SELECT o.id, o.order_number, c.name, o.order_date, o.status,
	       COUNT(oi.id) as item_count, o.created_at
	FROM orders o
	JOIN customers c ON o.customer_id = c.id
	LEFT JOIN order_items oi ON o.id = oi.order_id` + where + `
	GROUP BY o.id
	ORDER BY o.created_at DESC, o.id DESC
	LIMIT ? OFFSET ?
	`
	queryArgs := append(args, limit, offset)
	rows, err := r.DB.QueryContext(ctx, query, queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	packingOrders := make([]PackingOrder, 0)
	for rows.Next() {
		var po PackingOrder
		err := rows.Scan(&po.ID, &po.OrderNumber, &po.CustomerName, &po.OrderDate, &po.Status, &po.ItemCount, &po.CreatedAt)
		if err != nil {
			return nil, 0, err
		}
		packingOrders = append(packingOrders, po)
	}

	return packingOrders, total, rows.Err()
}

func (r *Repository) GetPackingDetail(ctx context.Context, orderID string) (*PackingOrderDetail, error) {
	order, items, err := r.OrderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	if order.Status != "Diproses" && order.Status != "Dikemas" {
		return nil, ErrOrderNotInPackingStatus
	}

	var customer catalog.Customer
	var phone, address sql.NullString
	err = r.DB.QueryRowContext(
		ctx,
		`SELECT id, name, phone, address FROM customers WHERE id = ?`,
		order.CustomerID,
	).Scan(&customer.ID, &customer.Name, &phone, &address)
	if err != nil {
		return nil, err
	}
	customer.Phone = phone.String
	customer.Address = address.String

	detail := &PackingOrderDetail{
		ID:              order.ID,
		OrderNumber:     order.OrderNumber,
		CustomerName:    customer.Name,
		CustomerPhone:   customer.Phone,
		CustomerAddress: customer.Address,
		OrderDate:       order.OrderDate,
		Status:          order.Status,
		ShippingCost:    order.ShippingCost,
		GrandTotal:      order.GrandTotal,
	}

	for _, item := range items {
		detail.Items = append(detail.Items, PackingItem{
			ProductID:   item.ProductID,
			ProductName: item.ProductNameSnapshot,
			Quantity:    item.Quantity,
			Subtotal:    item.Subtotal,
		})
	}

	return detail, nil
}

var ErrOrderNotInPackingStatus = errors.New("order is not in a packing status")

func (r *Repository) MarkPacked(ctx context.Context, orderID, changedBy, note string) error {
	return r.OrderRepo.UpdateStatus(ctx, orderID, "Diproses", "Dikemas", changedBy, note)
}
