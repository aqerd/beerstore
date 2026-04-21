package main

import (
	"beerstore/go/db"
	"log"
)

func main() {
	log.Println("🌱 Starting database seeding...")

	db.InitDB()
	defer db.CloseDB()

	if err := db.InitSchema(); err != nil {
		log.Fatal("❌ Failed to seed database:", err)
	}

	log.Println("✅ Database seeded successfully!")
}
