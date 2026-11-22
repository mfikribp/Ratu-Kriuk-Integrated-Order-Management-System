package catalog

import (
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
	query := `INSERT INTO customers (id, name, phone, address, city_region_postal_code, created_at, updated_at)
	VALUES (?, ?, ?, ?, ?, NOW(3), NOW(3))`
	
	_, err := r.DB.Exec(query, c.ID, c.Name, c.Phone, c.Address, c.CityRegionPostalCode)
	return err
}

func scanCustomer(row interface {
	Scan(dest ...any) error
}) (*Customer, error) {
	var c Customer
	var phone, address, city sql.NullString
	err := row.Scan(&c.ID, &c.Name, &phone, &address, &city, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	c.Phone = phone.String
	c.Address = address.String
	c.CityRegionPostalCode = city.String
	return &c, nil
}

func (r *CustomerRepository) GetByID(id string) (*Customer, error) {
	query := `SELECT id, name, phone, address, city_region_postal_code, created_at, updated_at FROM customers WHERE id = ?`
	return scanCustomer(r.DB.QueryRow(query, id))
}

func (r *CustomerRepository) GetByName(name string) (*Customer, error) {
	query := `SELECT id, name, phone, address, city_region_postal_code, created_at, updated_at FROM customers WHERE name = ? LIMIT 1`
	return scanCustomer(r.DB.QueryRow(query, name))
}

func (r *CustomerRepository) GetAll(limit, offset int) ([]Customer, error) {
	query := `SELECT id, name, phone, address, city_region_postal_code, created_at, updated_at 
	FROM customers ORDER BY created_at DESC LIMIT ? OFFSET ?`
	
	rows, err := r.DB.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var customers []Customer
	for rows.Next() {
		c, err := scanCustomer(rows)
		if err != nil {
			return nil, err
		}
		customers = append(customers, *c)
	}

	return customers, rows.Err()
}

func (r *CustomerRepository) Update(c *Customer) error {
	query := `UPDATE customers SET name = ?, phone = ?, address = ?, city_region_postal_code = ?, updated_at = NOW(3) 
	WHERE id = ?`
	
	result, err := r.DB.Exec(query, c.Name, c.Phone, c.Address, c.CityRegionPostalCode, c.ID)
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