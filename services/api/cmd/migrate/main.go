package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	path := os.Args[1]
	sqlBytes, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	db, err := sql.Open("mysql", "root:@tcp(127.0.0.1:3306)/ratu_kriuk?multiStatements=true&parseTime=true")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if _, err := db.Exec(string(sqlBytes)); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	fmt.Println("migration applied:", path)
}
