package handlers

import (
	"beerstore/go/models"
	"beerstore/go/services"

	"github.com/gofiber/fiber/v2"
	"github.com/shopspring/decimal"
)

// GetSales возвращает список продаж с фильтрацией
// GET /api/v1/sales?storeId=store-1&startDate=2024-01-01&endDate=2024-12-31
func GetSales(c *fiber.Ctx) error {
	storeID := c.Query("storeId")
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	var sID, sDate, eDate *string
	if storeID != "" {
		sID = &storeID
	}
	if startDate != "" {
		sDate = &startDate
	}
	if endDate != "" {
		eDate = &endDate
	}

	sales, err := services.ListSales(sID, sDate, eDate)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(sales)
}

// GetSaleByID возвращает информацию о конкретной продаже
// GET /api/v1/sales/:saleId
func GetSaleByID(c *fiber.Ctx) error {
	saleID := c.Params("saleId")
	if saleID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "saleId parameter is required",
		})
	}

	sale, err := services.GetSaleByID(saleID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	if sale == nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Sale not found",
		})
	}
	return c.JSON(sale)
}

// CreateSale создает новую продажу
// POST /api/v1/sales
func CreateSale(c *fiber.Ctx) error {
	var payload models.SaleCreate
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body: " + err.Error(),
		})
	}

	// Валидация
	if payload.StoreID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "storeId is required",
		})
	}
	if payload.SellerID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "sellerId is required",
		})
	}
	if len(payload.Items) == 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "items cannot be empty",
		})
	}
	for _, item := range payload.Items {
		if item.ProductID == "" {
			return c.Status(400).JSON(fiber.Map{
				"error": "productId is required for all items",
			})
		}
		if item.Quantity.LessThanOrEqual(decimal.Zero) {
			return c.Status(400).JSON(fiber.Map{
				"error": "quantity must be greater than 0",
			})
		}
	}

	sale, err := services.CreateSale(payload)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.Status(201).JSON(sale)
}
