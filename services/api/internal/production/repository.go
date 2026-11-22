package production

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"github.com/ratu-kriuk/api/internal/catalog"
)

type Repository struct {
	DB          *sql.DB
	ProductRepo *catalog.ProductRepository
}

func NewRepository(db *sql.DB, productRepo *catalog.ProductRepository) *Repository {
	return &Repository{
		DB:          db,
		ProductRepo: productRepo,
	}
}

func (r *Repository) Create(ctx context.Context, batch *ProductionBatch) error {
	batch.ID = uuid.New().String()
	query := `INSERT INTO production_batches (id, product_id, quantity, production_date, batch_code, notes, recorded_by, created_at)
	VALUES (?, ?, ?, ?, ?, ?, ?, NOW(3))`
	
	_, err := r.DB.ExecContext(ctx, query, batch.ID, batch.ProductID, batch.Quantity, batch.ProductionDate, batch.BatchCode, batch.Notes, batch.RecordedBy)
	return err
}

func (r *Repository) GetAll(ctx context.Context, limit, offset int) ([]ProductionBatch, error) {
	query := `
	SELECT pb.id, pb.product_id, p.name, pb.quantity, pb.production_date, pb.batch_code, pb.notes, pb.recorded_by, u.full_name, pb.created_at
	FROM production_batches pb
	JOIN products p ON pb.product_id = p.id
	JOIN users u ON pb.recorded_by = u.id
	ORDER BY pb.created_at DESC
	LIMIT ? OFFSET ?
	`

	rows, err := r.DB.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var batches []ProductionBatch
	for rows.Next() {
		b, err := scanBatch(rows)
		if err != nil {
			return nil, err
		}
		batches = append(batches, *b)
	}

	return batches, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*ProductionBatch, error) {
	query := `
	SELECT pb.id, pb.product_id, p.name, pb.quantity, pb.production_date, pb.batch_code, pb.notes, pb.recorded_by, u.full_name, pb.created_at
	FROM production_batches pb
	JOIN products p ON pb.product_id = p.id
	JOIN users u ON pb.recorded_by = u.id
	WHERE pb.id = ?
	`

	return scanBatch(r.DB.QueryRowContext(ctx, query, id))
}

func scanBatch(row interface {
	Scan(dest ...any) error
}) (*ProductionBatch, error) {
	var b ProductionBatch
	var batchCode, notes sql.NullString
	err := row.Scan(&b.ID, &b.ProductID, &b.ProductName, &b.Quantity, &b.ProductionDate, &batchCode, &notes, &b.RecordedBy, &b.RecordedByName, &b.CreatedAt)
	if err != nil {
		return nil, err
	}
	b.BatchCode = batchCode.String
	b.Notes = notes.String
	return &b, nil
}