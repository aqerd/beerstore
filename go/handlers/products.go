package handlers

import (
	"beerstore/go/services"

	"github.com/gofiber/fiber/v2"
)

// GetProducts возвращает список всех активных товаров
// GET /api/v1/products
func GetProducts(c *fiber.Ctx) error {
	products, err := services.ListProducts()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(products)
}
