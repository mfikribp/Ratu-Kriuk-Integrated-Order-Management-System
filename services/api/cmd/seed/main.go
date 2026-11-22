package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/ratu-kriuk/api/internal/auth"
	"github.com/ratu-kriuk/api/internal/platform"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using defaults")
	}

	cfg, err := platform.FromEnv()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4&loc=%s",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName, cfg.DBTimezone,
	)

	db, err := platform.New(dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	seedUsers(db.Conn)
	seedProducts(db.Conn)
	seedCustomers(db.Conn)

	log.Println("✓ Seed data inserted successfully")
}

func seedUsers(db *sql.DB) {
	adminHashedPassword, _ := auth.HashPassword("admin123")
	packingHashedPassword, _ := auth.HashPassword("packing123")
	productionHashedPassword, _ := auth.HashPassword("production123")

	users := []map[string]interface{}{
		{
			"id":       uuid.New().String(),
			"username": "admin",
			"password": adminHashedPassword,
			"role":     "ADMIN",
			"name":     "Admin User",
		},
		{
			"id":       uuid.New().String(),
			"username": "packing",
			"password": packingHashedPassword,
			"role":     "EMPLOYEE_PACKING",
			"name":     "Packing Staff",
		},
		{
			"id":       uuid.New().String(),
			"username": "production",
			"password": productionHashedPassword,
			"role":     "EMPLOYEE_PRODUCTION",
			"name":     "Production Staff",
		},
	}

	query := `INSERT INTO users (id, username, password_hash, role, full_name, is_active, created_at, updated_at)
	VALUES (?, ?, ?, ?, ?, true, NOW(3), NOW(3))`

	for _, user := range users {
		_, err := db.Exec(query, user["id"], user["username"], user["password"], user["role"], user["name"])
		if err != nil {
			db.Exec(`UPDATE users SET password_hash = ?, role = ?, full_name = ? WHERE username = ?`,
				user["password"], user["role"], user["name"], user["username"])
			log.Printf("✓ Updated user: %s", user["username"])
		} else {
			log.Printf("✓ Inserted user: %s", user["username"])
		}
	}
}

func seedProducts(db *sql.DB) {
	products := []map[string]interface{}{
		{"sku": "PROD001", "name": "Kripik Singkong Pedas", "price": 15000.0},
		{"sku": "PROD002", "name": "Kripik Bayam Gurih", "price": 12000.0},
		{"sku": "PROD003", "name": "Keripik Nangka Manis", "price": 18000.0},
		{"sku": "PROD004", "name": "Rengginang Kacang", "price": 10000.0},
		{"sku": "PROD005", "name": "Emping Melinjo", "price": 8000.0},
	}

	query := `INSERT INTO products (id, sku, name, unit_price, is_active, created_at, updated_at)
	VALUES (?, ?, ?, ?, true, NOW(3), NOW(3))`

	for _, product := range products {
		_, err := db.Exec(query, uuid.New().String(), product["sku"], product["name"], product["price"])
		if err != nil {
			log.Printf("Warning: Could not insert product %s: %v", product["sku"], err)
		} else {
			log.Printf("✓ Inserted product: %s", product["name"])
		}
	}
}

func seedCustomers(db *sql.DB) {
	customers := []map[string]interface{}{
		{"name": "Toko Maju Jaya", "phone": "08123456789", "address": "Jl. Merdeka No. 10, Jakarta Pusat"},
		{"name": "Warung Segar", "phone": "08234567890", "address": "Jl. Ahmad Yani No. 25, Bandung"},
		{"name": "Pasar Modern", "phone": "08345678901", "address": "Jl. Sudirman No. 15, Surabaya"},
	}

	query := `INSERT INTO customers (id, name, phone, address, created_at, updated_at)
	VALUES (?, ?, ?, ?, NOW(3), NOW(3))`

	for _, customer := range customers {
		_, err := db.Exec(query, uuid.New().String(), customer["name"], customer["phone"], customer["address"])
		if err != nil {
			log.Printf("Warning: Could not insert customer %s: %v", customer["name"], err)
		} else {
			log.Printf("✓ Inserted customer: %s", customer["name"])
		}
	}
}
