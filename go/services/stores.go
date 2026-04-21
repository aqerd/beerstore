package services

import (
	"beerstore/go/db"
	"beerstore/go/models"
	"database/sql"
)

// ListStores возвращает список всех магазинов
func ListStores() ([]models.Store, error) {
	query := `
        SELECT id, name, address, phone, working_hours, manager_id, is_active 
        FROM stores 
        ORDER BY name
    `
	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stores := []models.Store{}
	for rows.Next() {
		var s models.Store
		var phone, workingHours, managerID sql.NullString

		err := rows.Scan(
			&s.ID, &s.Name, &s.Address,
			&phone, &workingHours, &managerID, &s.IsActive,
		)
		if err != nil {
			return nil, err
		}

		if phone.Valid {
			s.Phone = phone.String
		}
		if workingHours.Valid {
			s.WorkingHours = workingHours.String
		}
		if managerID.Valid {
			s.ManagerID = managerID.String
		}

		stores = append(stores, s)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return stores, nil
}

// GetStoreByID возвращает магазин по ID
func GetStoreByID(id string) (*models.Store, error) {
	query := `
        SELECT id, name, address, phone, working_hours, manager_id, is_active 
        FROM stores 
        WHERE id = ?
    `
	var s models.Store
	var phone, workingHours, managerID sql.NullString

	err := db.DB.QueryRow(query, id).Scan(
		&s.ID, &s.Name, &s.Address,
		&phone, &workingHours, &managerID, &s.IsActive,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if phone.Valid {
		s.Phone = phone.String
	}
	if workingHours.Valid {
		s.WorkingHours = workingHours.String
	}
	if managerID.Valid {
		s.ManagerID = managerID.String
	}

	return &s, nil
}
