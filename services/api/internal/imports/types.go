package imports

import "time"

type ImportJob struct {
	ID           string    `json:"id"`
	Source       string    `json:"source"`
	OriginalFilename string `json:"original_filename"`
	Status       string    `json:"status"` // PENDING, PROCESSING, COMPLETED, FAILED
	TotalRows    int       `json:"total_rows"`
	SuccessCount int       `json:"success_count"`
	FailedCount  int       `json:"failed_count"`
	DuplicateCount int     `json:"duplicate_count"`
	CreatedBy    string    `json:"created_by"`
	CreatedAt    time.Time `json:"created_at"`
	FinishedAt   *time.Time `json:"finished_at,omitempty"`
}

type ImportRowResult struct {
	ID                  string    `json:"id"`
	ImportJobID         string    `json:"import_job_id"`
	RowNumber           int       `json:"row_number"`
	ExternalOrderNumber string    `json:"external_order_number"`
	Result              string    `json:"result"` // SUCCESS, FAILED, DUPLICATE
	Message             string    `json:"message,omitempty"`
	OrderID             string    `json:"order_id,omitempty"`
	CreatedAt           time.Time `json:"created_at"`
}

type ImportRequest struct {
	Source string `form:"source" binding:"required"`
}

type ImportRowData struct {
	OrderNumber string
	CustomerName string
	CustomerPhone string
	CustomerAddress string
	ProductSKU string
	ProductName string
	Quantity int
	UnitPrice float64
	ShippingCost float64
	OrderDate time.Time
}

type ImportResponse struct {
	JobID         string `json:"job_id"`
	TotalRows     int    `json:"total_rows"`
	SuccessCount  int    `json:"success_count"`
	FailedCount   int    `json:"failed_count"`
	DuplicateCount int   `json:"duplicate_count"`
	Message       string `json:"message"`
}