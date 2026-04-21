package handlers

import (
	"beerstore/go/services"

	"github.com/gofiber/fiber/v2"
)

// GetDashboard возвращает данные для дашборда
// GET /api/v1/reports/dashboard?storeId=store-1
func GetDashboard(c *fiber.Ctx) error {
	storeID := c.Query("storeId")
	var sID *string
	if storeID != "" {
		sID = &storeID
	}

	dashboard, err := services.GetDashboard(sID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(dashboard)
}

// GetDailyStats возвращает ежедневную статистику
// GET /api/v1/reports/daily-stats?storeId=store-1
func GetDailyStats(c *fiber.Ctx) error {
	storeID := c.Query("storeId")
	var sID *string
	if storeID != "" {
		sID = &storeID
	}

	stats, err := services.GetDailyStats(sID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(stats)
}

// GetFinancials возвращает финансовый отчет
// GET /api/v1/reports/financials?startDate=2024-01-01&endDate=2024-12-31&storeId=store-1
func GetFinancials(c *fiber.Ctx) error {
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")
	storeID := c.Query("storeId")

	var sDate, eDate, sID *string
	if startDate != "" {
		sDate = &startDate
	}
	if endDate != "" {
		eDate = &endDate
	}
	if storeID != "" {
		sID = &storeID
	}

	report, err := services.GetManagementReport(sDate, eDate, sID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(report)
}

// GetManagement возвращает управленческий отчет (аналогичен financials)
// GET /api/v1/reports/management?startDate=2024-01-01&endDate=2024-12-31&storeId=store-1
func GetManagement(c *fiber.Ctx) error {
	return GetFinancials(c)
}
