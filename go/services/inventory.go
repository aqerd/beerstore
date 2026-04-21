package services

import (
	"beerstore/go/db"
	"beerstore/go/models"
	"database/sql"
	"strconv"
	"time"
)

// InventoryItem представляет остаток товара в магазине
type InventoryItem struct {
	ID          string         `json:"id"`
	ProductID   string         `json:"productId"`
	StoreID     string         `json:"storeId"`
	Quantity    float64        `json:"quantity"`
	MinQuantity float64        `json:"minQuantity"`
	LastUpdated string         `json:"lastUpdated"`
	Product     models.Product `json:"product"`
	Store       models.Store   `json:"store"`
}

// ListInventory возвращает остатки товаров в конкретном магазине
func ListInventory(storeID string) ([]InventoryItem, error) {
	query := `
        SELECT 
            ib.balance_id, ib.product_code, ib.store_code, 
            ib.qty_on_hand, ib.min_qty, ib.updated_at,
            p.id, p.name, p.category, p.manufacturer, p.country, 
            p.abv, p.ibu, p.description, p.price_per_liter, p.is_active,
            s.id, s.name, s.address, s.phone, s.working_hours, s.manager_id, s.is_active
        FROM inventory_balances ib
        JOIN products p ON p.id = ib.product_code
        JOIN stores s ON s.id = ib.store_code
        WHERE ib.store_code = ?
        ORDER BY p.name
    `
	rows, err := db.DB.Query(query, storeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []InventoryItem{}
	for rows.Next() {
		var item InventoryItem
		var balanceID int64
		var qtyOnHand, minQty, pricePerLiter float64
		var updatedAt time.Time
		var manufacturer, country, description sql.NullString
		var abv, ibu sql.NullFloat64
		var storePhone, workingHours, managerID sql.NullString

		err := rows.Scan(
			&balanceID, &item.ProductID, &item.StoreID,
			&qtyOnHand, &minQty, &updatedAt,
			&item.Product.ID, &item.Product.Name, &item.Product.Category,
			&manufacturer, &country, &abv, &ibu, &description,
			&pricePerLiter, &item.Product.IsActive,
			&item.Store.ID, &item.Store.Name, &item.Store.Address,
			&storePhone, &workingHours, &managerID, &item.Store.IsActive,
		)
		if err != nil {
			return nil, err
		}

		item.ID = strconv.FormatInt(balanceID, 10)
		item.Quantity = qtyOnHand
		item.MinQuantity = minQty
		item.LastUpdated = updatedAt.Format(time.RFC3339)

		if manufacturer.Valid {
			item.Product.Manufacturer = manufacturer.String
		}
		if country.Valid {
			item.Product.Country = country.String
		}
		if description.Valid {
			item.Product.Description = description.String
		}
		if abv.Valid {
			val := abv.Float64
			item.Product.ABV = &val
		}
		if ibu.Valid {
			val := ibu.Float64
			item.Product.IBU = &val
		}
		item.Product.PricePerLiter = pricePerLiter

		if storePhone.Valid {
			item.Store.Phone = storePhone.String
		}
		if workingHours.Valid {
			item.Store.WorkingHours = workingHours.String
		}
		if managerID.Valid {
			item.Store.ManagerID = managerID.String
		}

		items = append(items, item)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

// CheckStock проверяет наличие товара на складе
func CheckStock(storeID, productID string, quantity float64) (bool, error) {
	var qtyOnHand float64
	query := `
        SELECT qty_on_hand 
        FROM inventory_balances 
        WHERE store_code = ? AND product_code = ?
    `
	err := db.DB.QueryRow(query, storeID, productID).Scan(&qtyOnHand)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return qtyOnHand >= quantity, nil
}
