package orders

import "time"

type Order struct {
	ID           string    `json:"id"`
	OrderNumber  string    `json:"order_number"`
	Source       string    `json:"source"` // MANUAL, MARKETPLACE_X
	CustomerID   string    `json:"customer_id"`
	OrderDate    time.Time `json:"order_date"`
	Status       string    `json:"status"` // Diproses, Dikemas, Dikirim, Selesai, Dibatalkan
	ProductTotal float64   `json:"product_total"`
	ShippingCost float64   `json:"shipping_cost"`
	GrandTotal   float64   `json:"grand_total"`
	Notes        string    `json:"notes,omitempty"`
	CreatedBy    string    `json:"created_by"`
	UpdatedBy    string    `json:"updated_by"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type OrderItem struct {
	ID                   string  `json:"id"`
	OrderID              string  `json:"order_id"`
	ProductID            string  `json:"product_id"`
	ProductNameSnapshot  string  `json:"product_name_snapshot"`
	UnitPriceSnapshot    float64 `json:"unit_price_snapshot"`
	Quantity             int     `json:"quantity"`
	Subtotal             float64 `json:"subtotal"`
}

type OrderStatusHistory struct {
	ID        string    `json:"id"`
	OrderID   string    `json:"order_id"`
	OldStatus string    `json:"old_status"`
	NewStatus string    `json:"new_status"`
	ChangedBy string    `json:"changed_by"`
	Note      string    `json:"note,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateOrderRequest struct {
	CustomerID   string                   `json:"customer_id" binding:"required"`
	OrderDate    time.Time                `json:"order_date" binding:"required"`
	ShippingCost float64                  `json:"shipping_cost" binding:"required,gte=0"`
	Items        []CreateOrderItemRequest `json:"items" binding:"required,min=1"`
	Notes        string                   `json:"notes"`
}

type CreateOrderItemRequest struct {
	ProductID string `json:"product_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,gt=0"`
}

type UpdateOrderStatusRequest struct {
	NewStatus string `json:"new_status" binding:"required"`
	Note      string `json:"note"`
}