package production

import "time"

type ProductionBatch struct {
	ID             string    `json:"id"`
	ProductID      string    `json:"product_id"`
	ProductName    string    `json:"product_name"`
	Quantity       int       `json:"quantity"`
	ProductionDate time.Time `json:"production_date"`
	BatchCode      string    `json:"batch_code,omitempty"`
	Notes          string    `json:"notes,omitempty"`
	RecordedBy     string    `json:"recorded_by"`
	RecordedByName string    `json:"recorded_by_name"`
	CreatedAt      time.Time `json:"created_at"`
}

type CreateProductionBatchRequest struct {
	ProductID      string    `json:"product_id" binding:"required"`
	Quantity       int       `json:"quantity" binding:"required,gt=0"`
	ProductionDate time.Time `json:"production_date" binding:"required"`
	BatchCode      string    `json:"batch_code"`
	Notes          string    `json:"notes"`
}