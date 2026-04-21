package handlers

import (
	"beerstore/go/services"

	"github.com/gofiber/fiber/v2"
)

// GetInventory возвращает остатки товаров в магазине
// GET /api/v1/inventory?storeId=store-1
func GetInventory(c *fiber.Ctx) error {
	storeID := c.Query("storeId")
	if storeID == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "storeId query parameter is required",
		})
	}

	inventory, err := services.ListInventory(storeID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(inventory)
}
