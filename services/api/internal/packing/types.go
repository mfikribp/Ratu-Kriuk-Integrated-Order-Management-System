package packing

import "time"

type PackingOrder struct {
	ID           string    `json:"id"`
	OrderNumber  string    `json:"order_number"`
	CustomerName string    `json:"customer_name"`
	OrderDate    time.Time `json:"order_date"`
	Status       string    `json:"status"`
	ItemCount    int       `json:"item_count"`
	CreatedAt    time.Time `json:"created_at"`
}

type PackingOrderDetail struct {
	ID           string    `json:"id"`
	OrderNumber  string    `json:"order_number"`
	CustomerName string    `json:"customer_name"`
	CustomerPhone string   `json:"customer_phone"`
	CustomerAddress string  `json:"customer_address"`
	OrderDate    time.Time `json:"order_date"`
	Status       string    `json:"status"`
	Items        []PackingItem `json:"items"`
	ShippingCost float64   `json:"shipping_cost"`
	GrandTotal   float64   `json:"grand_total"`
}

type PackingItem struct {
	ProductID   string  `json:"product_id"`
	ProductName string  `json:"product_name"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
}

type MarkPackedRequest struct {
	Note string `json:"note"`
}