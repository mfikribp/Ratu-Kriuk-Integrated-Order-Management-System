package catalog

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
)

type CustomerRepository struct {
	DB *sql.DB
}

func NewCustomerRepository(db *sql.DB) *CustomerRepository {
	return &CustomerRepository{DB: db}
}

func (r *CustomerRepository) Create(c *Customer) error {
	c.ID = uuid.New().String()
	if c.CustomerType == "" {
		c.CustomerType = "REGULAR"
	}
	query := `INSERT INTO customers (id, name, phone, address, city_region_postal_code, customer_type, is_active, imported_by_job_id, created_at, updated_at)
	VALUES (?, ?, ?, ?, ?, ?, true, ?, NOW(3), NOW(3))`

	_, err := r.DB.Exec(query, c.ID, c.Name, c.Phone, c.Address, c.CityRegionPostalCode, c.CustomerType, sql.NullString{String: c.ImportedByJobID, Valid: c.ImportedByJobID != ""})
	return err
}

func scanCustomer(row interface {
	Scan(dest ...any) error
}) (*Customer, error) {
	var c Customer
	var phone, address, city, importedByJobID sql.NullString
	err := row.Scan(&c.ID, &c.Name, &phone, &address, &city, &c.CustomerType, &c.IsActive, &importedByJobID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	c.Phone = phone.String
	c.Address = address.String
	c.CityRegionPostalCode = city.String
	c.ImportedByJobID = importedByJobID.String
	return &c, nil
}

func (r *CustomerRepository) GetByID(id string) (*Customer, error) {
	query := `SELECT id, name, phone, address, city_region_postal_code, customer_type, is_active, imported_by_job_id, created_at, updated_at FROM customers WHERE id = ?`
	return scanCustomer(r.DB.QueryRow(query, id))
}

func (r *CustomerRepository) GetByName(name string) (*Customer, error) {
	query := `SELECT id, name, phone, address, city_region_postal_code, customer_type, is_active, imported_by_job_id, created_at, updated_at
	FROM customers WHERE name = ? AND customer_type = 'REGULAR' AND is_active = true LIMIT 1`
	return scanCustomer(r.DB.QueryRow(query, name))
}

func (r *CustomerRepository) GetAll(limit, offset int, search, customerType string) ([]Customer, int, error) {
	where := " WHERE is_active = true"
	args := make([]any, 0, 4)
	if customerType != "" {
		where += " AND customer_type = ?"
		args = append(args, customerType)
	}
	if search != "" {
		where += " AND (name LIKE ? OR phone LIKE ?)"
		args = append(args, "%"+search+"%", "%"+search+"%")
	}

	var total int
	if err := r.DB.QueryRow("SELECT COUNT(*) FROM customers"+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `SELECT id, name, phone, address, city_region_postal_code, customer_type, is_active, imported_by_job_id, created_at, updated_at
	FROM customers` + where + ` ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`
	queryArgs := append(args, limit, offset)
	rows, err := r.DB.Query(query, queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	customers := make([]Customer, 0)
	for rows.Next() {
		c, err := scanCustomer(rows)
		if err != nil {
			return nil, 0, err
		}
		customers = append(customers, *c)
	}

	return customers, total, rows.Err()
}

func (r *CustomerRepository) QueryAllForExport(ctx context.Context, search, customerType string) (*sql.Rows, error) {
	where := " WHERE is_active = true"
	args := make([]any, 0, 3)
	if customerType != "" {
		where += " AND customer_type = ?"
		args = append(args, customerType)
	}
	if search != "" {
		where += " AND (name LIKE ? OR phone LIKE ?)"
		args = append(args, "%"+search+"%", "%"+search+"%")
	}

	query := `SELECT id, name, phone, address, city_region_postal_code, customer_type, is_active, imported_by_job_id, created_at, updated_at
	FROM customers` + where + ` ORDER BY created_at DESC, id DESC`
	return r.DB.QueryContext(ctx, query, args...)
}

func (r *CustomerRepository) Update(c *Customer) error {
	if c.CustomerType == "" {
		c.CustomerType = "REGULAR"
	}
	query := `UPDATE customers SET name = ?, phone = ?, address = ?, city_region_postal_code = ?, customer_type = ?, updated_at = NOW(3)
	WHERE id = ? AND is_active = true`

	result, err := r.DB.Exec(query, c.Name, c.Phone, c.Address, c.CityRegionPostalCode, c.CustomerType, c.ID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}

func (r *CustomerRepository) ArchiveImportedByJob(jobID string) (int64, error) {
	result, err := r.DB.Exec(
		`UPDATE customers SET is_active = false, updated_at = NOW(3)
		WHERE imported_by_job_id = ? AND customer_type = 'REGULAR' AND is_active = true`,
		jobID,
	)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

func (r *CustomerRepository) ArchiveRegularCustomers(search string) (int64, error) {
	query := `UPDATE customers SET is_active = false, updated_at = NOW(3)
		WHERE customer_type = 'REGULAR' AND is_active = true`
	args := make([]any, 0, 2)
	if search != "" {
		query += ` AND (name LIKE ? OR phone LIKE ?)`
		args = append(args, "%"+search+"%", "%"+search+"%")
	}

	result, err := r.DB.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}
