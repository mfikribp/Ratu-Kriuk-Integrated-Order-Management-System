package catalog

import "time"

type Product struct {
	ID          string    `json:"id"`
	SKU         string    `json:"sku"`
	Name        string    `json:"name"`
	Category    string    `json:"category,omitempty"`
	Description string    `json:"description,omitempty"`
	UnitPrice   float64   `json:"unit_price"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Customer struct {
	ID                   string    `json:"id"`
	Name                 string    `json:"name"`
	Phone                string    `json:"phone,omitempty"`
	Address              string    `json:"address,omitempty"`
	CityRegionPostalCode string    `json:"city_region_postal_code,omitempty"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

type CreateProductRequest struct {
	SKU         string  `json:"sku"`
	Name        string  `json:"name" binding:"required"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
	UnitPrice   float64 `json:"unit_price" binding:"required,gte=0"`
}

type CreateCustomerRequest struct {
	Name                 string `json:"name" binding:"required"`
	Phone                string `json:"phone"`
	Address              string `json:"address"`
	CityRegionPostalCode string `json:"city_region_postal_code"`
}