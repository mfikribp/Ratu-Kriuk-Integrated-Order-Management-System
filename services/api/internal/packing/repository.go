package packing

import (
	"context"
	"database/sql"
	"fmt"

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

func (r *Repository) GetPackingList(ctx context.Context, limit, offset int) ([]PackingOrder, error) {
	query := `
	SELECT o.id, o.order_number, c.name, o.order_date, o.status, 
	       COUNT(oi.id) as item_count, o.created_at
	FROM orders o
	JOIN customers c ON o.customer_id = c.id
	LEFT JOIN order_items oi ON o.id = oi.order_id
	WHERE o.status = 'Diproses'
	GROUP BY o.id
	ORDER BY o.created_at DESC
	LIMIT ? OFFSET ?
	`

	rows, err := r.DB.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var packingOrders []PackingOrder
	for rows.Next() {
		var po PackingOrder
		err := rows.Scan(&po.ID, &po.OrderNumber, &po.CustomerName, &po.OrderDate, &po.Status, &po.ItemCount, &po.CreatedAt)
		if err != nil {
			return nil, err
		}
		packingOrders = append(packingOrders, po)
	}

	return packingOrders, nil
}

func (r *Repository) GetPackingDetail(ctx context.Context, orderID string) (*PackingOrderDetail, error) {
	order, items, err := r.OrderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	if order.Status != "Diproses" {
		return nil, fmt.Errorf("order is not in Diproses status")
	}

	customer, err := r.CustomerRepo.GetByID(order.CustomerID)
	if err != nil {
		return nil, err
	}

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

func (r *Repository) MarkPacked(ctx context.Context, orderID, changedBy, note string) error {
	return r.OrderRepo.UpdateStatus(ctx, orderID, "Diproses", "Dikemas", changedBy, note)
}