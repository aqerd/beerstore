package handlers

import (
	"beerstore/go/services"

	"github.com/gofiber/fiber/v2"
)

func GetStores(c *fiber.Ctx) error {
	stores, err := services.ListStores()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(stores)
}
