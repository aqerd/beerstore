package services

import (
	"beerstore/go/db"
	"beerstore/go/models"
	"database/sql"
)

// ListProducts возвращает список всех активных товаров
func ListProducts() ([]models.Product, error) {
	query := `
        SELECT id, name, category, manufacturer, country, 
               abv, ibu, description, price_per_liter, is_active 
        FROM products 
        WHERE is_active = TRUE 
        ORDER BY name
    `
	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		var manufacturer, country, description sql.NullString
		var abv, ibu sql.NullFloat64
		var pricePerLiter float64

		err := rows.Scan(
			&p.ID, &p.Name, &p.Category,
			&manufacturer, &country, &abv, &ibu, &description,
			&pricePerLiter, &p.IsActive,
		)
		if err != nil {
			return nil, err
		}

		if manufacturer.Valid {
			p.Manufacturer = manufacturer.String
		}
		if country.Valid {
			p.Country = country.String
		}
		if description.Valid {
			p.Description = description.String
		}
		if abv.Valid {
			val := abv.Float64
			p.ABV = &val
		}
		if ibu.Valid {
			val := ibu.Float64
			p.IBU = &val
		}
		p.PricePerLiter = pricePerLiter

		products = append(products, p)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

// GetProductByID возвращает товар по ID
func GetProductByID(id string) (*models.Product, error) {
	query := `
        SELECT id, name, category, manufacturer, country, 
               abv, ibu, description, price_per_liter, is_active 
        FROM products 
        WHERE id = ?
    `
	var p models.Product
	var manufacturer, country, description sql.NullString
	var abv, ibu sql.NullFloat64
	var pricePerLiter float64

	err := db.DB.QueryRow(query, id).Scan(
		&p.ID, &p.Name, &p.Category,
		&manufacturer, &country, &abv, &ibu, &description,
		&pricePerLiter, &p.IsActive,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if manufacturer.Valid {
		p.Manufacturer = manufacturer.String
	}
	if country.Valid {
		p.Country = country.String
	}
	if description.Valid {
		p.Description = description.String
	}
	if abv.Valid {
		val := abv.Float64
		p.ABV = &val
	}
	if ibu.Valid {
		val := ibu.Float64
		p.IBU = &val
	}
	p.PricePerLiter = pricePerLiter

	return &p, nil
}
