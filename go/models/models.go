package models

import (
	"time"

	"github.com/shopspring/decimal"
)

// Store - магазин
type Store struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Address      string `json:"address"`
	Phone        string `json:"phone,omitempty"`
	WorkingHours string `json:"workingHours,omitempty"`
	ManagerID    string `json:"managerId,omitempty"`
	IsActive     bool   `json:"isActive"`
}

// Product - товар
type Product struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Category      string   `json:"category"`
	Manufacturer  string   `json:"manufacturer,omitempty"`
	Country       string   `json:"country,omitempty"`
	ABV           *float64 `json:"abv,omitempty"`
	IBU           *float64 `json:"ibu,omitempty"`
	Description   string   `json:"description,omitempty"`
	PricePerLiter float64  `json:"pricePerLiter"`
	IsActive      bool     `json:"isActive"`
}

// PaymentMethod - способ оплаты
type PaymentMethod string

const (
	PaymentCash     PaymentMethod = "cash"
	PaymentCard     PaymentMethod = "card"
	PaymentTransfer PaymentMethod = "transfer"
)

// SaleItemIn - позиция при создании продажи
type SaleItemIn struct {
	ProductID string          `json:"productId"`
	Quantity  decimal.Decimal `json:"quantity"`
}

// SaleCreate - запрос на создание продажи
type SaleCreate struct {
	StoreID       string          `json:"storeId"`
	SellerID      string          `json:"sellerId"`
	PaymentMethod PaymentMethod   `json:"paymentMethod"`
	Items         []SaleItemIn    `json:"items"`
	CustomerID    *string         `json:"customerId,omitempty"`
	CustomerName  *string         `json:"customerName,omitempty"`
	CustomerPhone *string         `json:"customerPhone,omitempty"`
	BonusToUse    decimal.Decimal `json:"bonusToUse"`
}

// Sale - полная информация о продаже
type Sale struct {
	SaleID        int64           `json:"-"`
	SaleCode      string          `json:"id"`
	StoreCode     string          `json:"storeId"`
	SellerID      *string         `json:"sellerId,omitempty"`
	SellerName    *string         `json:"sellerName,omitempty"`
	CustomerID    *int64          `json:"customerId,omitempty"`
	CustomerName  *string         `json:"customerName,omitempty"`
	SaleAt        time.Time       `json:"createdAt"`
	NetAmount     decimal.Decimal `json:"total"`
	BonusUsed     decimal.Decimal `json:"bonusUsed"`
	BonusEarned   decimal.Decimal `json:"bonusEarned"`
	PaymentMethod string          `json:"paymentMethod"`
	Items         []SaleItem      `json:"items,omitempty"`
}

// SaleItem - позиция в продаже
type SaleItem struct {
	ProductCode string          `json:"productId"`
	Qty         decimal.Decimal `json:"quantity"`
	UnitPrice   decimal.Decimal `json:"pricePerLiter"`
	LineAmount  decimal.Decimal `json:"total"`
}

// DashboardResponse - ответ для дашборда
type DashboardResponse struct {
	TodayStats    map[string]interface{}   `json:"todayStats"`
	WeekStats     map[string]interface{}   `json:"weekStats"`
	LowStockCount int                      `json:"lowStockCount"`
	ChartData     []map[string]interface{} `json:"chartData"`
}

// ManagementReportResponse - ответ для управленческого отчета
type ManagementReportResponse struct {
	Period               map[string]interface{}   `json:"period"`
	Summary              map[string]interface{}   `json:"summary"`
	RevenueByDay         []map[string]interface{} `json:"revenueByDay"`
	TopProducts          []map[string]interface{} `json:"topProducts"`
	StaffPerformance     []map[string]interface{} `json:"staffPerformance"`
	SalesByPaymentMethod []map[string]interface{} `json:"salesByPaymentMethod"`
	Customers            map[string]interface{}   `json:"customers"`
}
