package imports

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/ratu-kriuk/api/internal/catalog"
)

type Repository struct {
	DB           *sql.DB
	ProductRepo  *catalog.ProductRepository
	CustomerRepo *catalog.CustomerRepository
}

func NewRepository(db *sql.DB, productRepo *catalog.ProductRepository, customerRepo *catalog.CustomerRepository) *Repository {
	return &Repository{
		DB:           db,
		ProductRepo:  productRepo,
		CustomerRepo: customerRepo,
	}
}

func (r *Repository) CreateJob(ctx context.Context, job *ImportJob) error {
	query := `INSERT INTO import_jobs (id, source, original_filename, status, total_rows, success_count, failed_count, duplicate_count, created_by, created_at)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3))`
	
	job.ID = uuid.New().String()
	_, err := r.DB.ExecContext(ctx, query, job.ID, job.Source, job.OriginalFilename, job.Status, job.TotalRows, job.SuccessCount, job.FailedCount, job.DuplicateCount, job.CreatedBy)
	return err
}

func (r *Repository) UpdateJobStatus(ctx context.Context, jobID, status string, successCount, failedCount, duplicateCount int) error {
	query := `UPDATE import_jobs SET status = ?, success_count = ?, failed_count = ?, duplicate_count = ?, finished_at = NOW(3) WHERE id = ?`
	_, err := r.DB.ExecContext(ctx, query, status, successCount, failedCount, duplicateCount, jobID)
	return err
}

func (r *Repository) SaveRowResult(ctx context.Context, result *ImportRowResult) error {
	query := `INSERT INTO import_row_results (id, import_job_id, row_number, external_order_number, result, message, order_id, created_at)
	VALUES (?, ?, ?, ?, ?, ?, ?, NOW(3))`
	
	result.ID = uuid.New().String()
	_, err := r.DB.ExecContext(ctx, query, result.ID, result.ImportJobID, result.RowNumber, result.ExternalOrderNumber, result.Result, result.Message, sql.NullString{String: result.OrderID, Valid: result.OrderID != ""})
	return err
}

func (r *Repository) IsOrderNumberExists(ctx context.Context, orderNumber string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = ?)`
	err := r.DB.QueryRowContext(ctx, query, orderNumber).Scan(&exists)
	return exists, err
}

func (r *Repository) ProcessImportRow(ctx context.Context, jobID string, rowNum int, rowData ImportRowData) (*ImportRowResult, error) {
	result := &ImportRowResult{
		ImportJobID:         jobID,
		RowNumber:           rowNum,
		ExternalOrderNumber: rowData.OrderNumber,
	}

	if rowData.OrderNumber == "" {
		result.Result = "FAILED"
		result.Message = "Order number is required"
		return result, nil
	}

	exists, err := r.IsOrderNumberExists(ctx, rowData.OrderNumber)
	if err != nil {
		result.Result = "FAILED"
		result.Message = "Database error checking order number"
		return result, nil
	}
	if exists {
		result.Result = "DUPLICATE"
		result.Message = "Order number already exists"
		return result, nil
	}

	product, err := r.ProductRepo.GetBySKU(rowData.ProductSKU)
	if err != nil {
		result.Result = "FAILED"
		result.Message = fmt.Sprintf("Product not found: %s", rowData.ProductSKU)
		return result, nil
	}

	if rowData.Quantity <= 0 {
		result.Result = "FAILED"
		result.Message = "Quantity must be positive"
		return result, nil
	}

	customer, err := r.CustomerRepo.GetByName(rowData.CustomerName)
	if err != nil {
		newCustomer := &catalog.Customer{
			Name:    rowData.CustomerName,
			Phone:   rowData.CustomerPhone,
			Address: rowData.CustomerAddress,
		}
		if err := r.CustomerRepo.Create(newCustomer); err != nil {
			result.Result = "FAILED"
			result.Message = "Failed to create customer"
			return result, nil
		}
		customer = newCustomer
	}

	subtotal := product.UnitPrice * float64(rowData.Quantity)
	productTotal := subtotal
	grandTotal := productTotal + rowData.ShippingCost

	order := &sql.NullString{}
	order.String = uuid.New().String()
	order.Valid = true

	query := `INSERT INTO orders (id, order_number, source, customer_id, order_date, status, product_total, shipping_cost, grand_total, created_by, updated_by, created_at, updated_at)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`
	
	_, err = r.DB.ExecContext(ctx, query, order.String, rowData.OrderNumber, "MARKETPLACE", customer.ID, rowData.OrderDate, "Diproses", productTotal, rowData.ShippingCost, grandTotal, jobID, jobID)
	if err != nil {
		result.Result = "FAILED"
		result.Message = "Failed to create order"
		return result, nil
	}

	itemQuery := `INSERT INTO order_items (id, order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, subtotal)
	VALUES (?, ?, ?, ?, ?, ?, ?)`
	
	_, err = r.DB.ExecContext(ctx, itemQuery, uuid.New().String(), order.String, product.ID, product.Name, product.UnitPrice, rowData.Quantity, subtotal)
	if err != nil {
		result.Result = "FAILED"
		result.Message = "Failed to create order item"
		return result, nil
	}

	result.Result = "SUCCESS"
	result.OrderID = order.String
	return result, nil
}