package main

import (
	"beerstore/go/db"
	"beerstore/go/handlers"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	// Загружаем .env
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found, using defaults")
	}

	// Подключаем БД
	db.InitDB()
	defer db.CloseDB()

	// Создаем Fiber приложение
	app := fiber.New(fiber.Config{
		AppName:      "Golden Liquid Go API",
		ErrorHandler: customErrorHandler,
	})

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "*",
	}))

	// Healthcheck
	app.Get("/health", handlers.HealthCheck)

	// API v1 группа
	api := app.Group("/api/v1")

	// Stores
	api.Get("/stores", handlers.GetStores)

	// Products
	api.Get("/products", handlers.GetProducts)

	// Inventory
	api.Get("/inventory", handlers.GetInventory)

	// Sales
	api.Get("/sales", handlers.GetSales)
	api.Get("/sales/:saleId", handlers.GetSaleByID)
	api.Post("/sales", handlers.CreateSale)

	// Reports
	api.Get("/reports/dashboard", handlers.GetDashboard)
	api.Get("/reports/daily-stats", handlers.GetDailyStats)
	api.Get("/reports/financials", handlers.GetFinancials)
	api.Get("/reports/management", handlers.GetManagement)

	// Запуск сервера
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	go func() {
		log.Printf("🚀 Server starting on http://localhost:%s", port)
		log.Printf("📚 API docs: http://localhost:%s/api/v1", port)
		if err := app.Listen(":" + port); err != nil {
			log.Fatal(err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("🛑 Shutting down server...")
	if err := app.Shutdown(); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}
	log.Println("✅ Server exited")
}

func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}
	return c.Status(code).JSON(fiber.Map{
		"error": err.Error(),
	})
}
