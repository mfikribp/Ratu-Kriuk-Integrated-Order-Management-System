package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	db, err := sql.Open("mysql", "root:@tcp(127.0.0.1:3306)/ratu_kriuk?parseTime=true")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	var orderCount int
	db.QueryRow("SELECT COUNT(*) FROM orders").Scan(&orderCount)
	fmt.Println("orders count:", orderCount)

	fmt.Println("\n-- import_jobs --")
	rows, err := db.Query("SELECT id, source, status, total_rows, success_count, failed_count, duplicate_count FROM import_jobs ORDER BY created_at DESC LIMIT 5")
	if err != nil {
		log.Fatal(err)
	}
	for rows.Next() {
		var id, source, status string
		var total, succ, fail, dup int
		rows.Scan(&id, &source, &status, &total, &succ, &fail, &dup)
		fmt.Printf("%s src=%s status=%s total=%d success=%d failed=%d dup=%d\n", id, source, status, total, succ, fail, dup)
	}
	rows.Close()

	fmt.Println("\n-- recent orders --")
	orows, err := db.Query("SELECT order_number, source, status, grand_total, created_at FROM orders ORDER BY created_at DESC LIMIT 10")
	if err != nil {
		log.Fatal(err)
	}
	for orows.Next() {
		var num, source, status string
		var total float64
		var created interface{}
		orows.Scan(&num, &source, &status, &total, &created)
		fmt.Printf("%s src=%s status=%s total=%.0f created=%v\n", num, source, status, total, created)
	}
	orows.Close()

	fmt.Println("\n-- recent row results --")
	rrows, err := db.Query("SELECT " + "`row_number`" + ", external_order_number, result, message FROM import_row_results ORDER BY created_at DESC LIMIT 15")
	if err != nil {
		log.Fatal(err)
	}
	for rrows.Next() {
		var rn int
		var ext, res, msg sql.NullString
		rrows.Scan(&rn, &ext, &res, &msg)
		fmt.Printf("row=%d order=%q result=%s msg=%q\n", rn, ext.String, res.String, msg.String)
	}
	rrows.Close()
}
