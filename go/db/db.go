package db

import (
	"database/sql"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

var DB *sql.DB

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using defaults")
	}
}

func getDSN() string {
	// MySQL DSN формат: username:password@tcp(host:port)/dbname?parseTime=true
	dsn := os.Getenv("DB_URL")
	if dsn == "" {
		dsn = "root:root@tcp(localhost:3306)/golden_liquid?parseTime=true&loc=Local"
	}
	return dsn
}

func InitDB() {
	var err error
	DB, err = sql.Open("mysql", getDSN())
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	// Настройка пула соединений
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(5 * time.Minute)

	// Проверка соединения
	if err = DB.Ping(); err != nil {
		log.Fatal("❌ Database unreachable:", err)
	}

	log.Println("✅ Connected to MySQL successfully")
}

func CloseDB() {
	if DB != nil {
		DB.Close()
		log.Println("✅ Database connection closed")
	}
}
