package catalog

import (
	"database/sql"

	"github.com/google/uuid"
)

type ProductRepository struct {
	DB *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{DB: db}
}

func (r *ProductRepository) Create(p *Product) error {
	p.ID = uuid.New().String()
	query := `INSERT INTO products (id, sku, name, category, description, unit_price, is_active, created_at, updated_at)
	VALUES (?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`

	_, err := r.DB.Exec(query, p.ID, p.SKU, p.Name, p.Category, p.Description, p.UnitPrice, p.IsActive)
	return err
}

func scanProduct(row interface {
	Scan(dest ...any) error
}) (*Product, error) {
	var p Product
	var category, description sql.NullString
	err := row.Scan(&p.ID, &p.SKU, &p.Name, &category, &description, &p.UnitPrice, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	p.Category = category.String
	p.Description = description.String
	return &p, nil
}

func (r *ProductRepository) GetByID(id string) (*Product, error) {
	query := `SELECT id, sku, name, category, description, unit_price, is_active, created_at, updated_at FROM products WHERE id = ?`
	return scanProduct(r.DB.QueryRow(query, id))
}

func (r *ProductRepository) GetBySKU(sku string) (*Product, error) {
	query := `SELECT id, sku, name, category, description, unit_price, is_active, created_at, updated_at FROM products WHERE sku = ? LIMIT 1`
	return scanProduct(r.DB.QueryRow(query, sku))
}

func (r *ProductRepository) GetAll(limit, offset int) ([]Product, error) {
	query := `SELECT id, sku, name, category, description, unit_price, is_active, created_at, updated_at 
	FROM products WHERE is_active = true ORDER BY category ASC, name ASC LIMIT ? OFFSET ?`

	rows, err := r.DB.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, *p)
	}

	return products, rows.Err()
}

func (r *ProductRepository) Update(p *Product) error {
	query := `UPDATE products SET sku = ?, name = ?, category = ?, description = ?, unit_price = ?, is_active = ?, updated_at = NOW(3) 
	WHERE id = ?`

	result, err := r.DB.Exec(query, p.SKU, p.Name, p.Category, p.Description, p.UnitPrice, p.IsActive, p.ID)
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
