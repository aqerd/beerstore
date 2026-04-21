package services

import (
	"beerstore/go/db"
	"beerstore/go/models"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/shopspring/decimal"
)

// findOrCreateCustomer находит или создает клиента
func findOrCreateCustomer(tx *sql.Tx, payload models.SaleCreate) (*int64, error) {
	if payload.CustomerID != nil {
		var id int64
		err := tx.QueryRow(`SELECT customer_id FROM customers WHERE customer_id = ?`, *payload.CustomerID).Scan(&id)
		if err == sql.ErrNoRows {
			return nil, nil
		}
		if err != nil {
			return nil, err
		}
		return &id, nil
	}

	if payload.CustomerPhone != nil {
		var id int64
		err := tx.QueryRow(`SELECT customer_id FROM customers WHERE phone = ?`, *payload.CustomerPhone).Scan(&id)
		if err == nil {
			if payload.CustomerName != nil {
				tx.Exec(`UPDATE customers SET full_name = COALESCE(full_name, ?), is_loyalty_member = TRUE WHERE customer_id = ?`,
					*payload.CustomerName, id)
			}
			return &id, nil
		}
		if err != sql.ErrNoRows {
			return nil, err
		}

		name := "Гость"
		if payload.CustomerName != nil {
			name = *payload.CustomerName
		}
		result, err := tx.Exec(
			`INSERT INTO customers(phone, full_name, is_loyalty_member) VALUES (?, ?, ?)`,
			*payload.CustomerPhone, name, true,
		)
		if err != nil {
			return nil, err
		}
		newID, err := result.LastInsertId()
		if err != nil {
			return nil, err
		}
		return &newID, nil
	}

	return nil, nil
}

// shiftInfo содержит информацию о смене
type shiftInfo struct {
	ShiftID    int64
	TerminalID int64
	EmployeeID int64
}

// getOpenShift получает или создает открытую смену
func getOpenShift(tx *sql.Tx, storeID, sellerCode string) (*shiftInfo, error) {
	var info shiftInfo
	var shiftID, terminalID sql.NullInt64

	query := `
        SELECT sh.shift_id, sh.terminal_id, e.employee_id
        FROM employees e
        LEFT JOIN shifts sh ON sh.employee_id = e.employee_id 
            AND sh.store_code = e.store_code AND sh.status = 'open'
        WHERE e.user_code = ? AND e.store_code = ?
        ORDER BY sh.opened_at DESC
        LIMIT 1
    `
	err := tx.QueryRow(query, sellerCode, storeID).Scan(&shiftID, &terminalID, &info.EmployeeID)

	if err == sql.ErrNoRows {
		// Создаем сотрудника
		result, err := tx.Exec(
			`INSERT INTO employees(user_code, store_code, full_name, role_code) VALUES (?, ?, ?, ?)`,
			sellerCode, storeID, "Авто-кассир", "bartender",
		)
		if err != nil {
			return nil, err
		}
		info.EmployeeID, _ = result.LastInsertId()

		// Получаем терминал
		err = tx.QueryRow(`SELECT terminal_id FROM terminals WHERE store_code = ? ORDER BY terminal_id LIMIT 1`, storeID).Scan(&terminalID)
		if err != nil {
			return nil, err
		}

		// Создаем смену
		result, err = tx.Exec(
			`INSERT INTO shifts(store_code, employee_id, terminal_id, opened_at, status, opening_cash) 
             VALUES (?, ?, ?, NOW(), 'open', 5000)`,
			storeID, info.EmployeeID, terminalID,
		)
		if err != nil {
			return nil, err
		}
		info.ShiftID, _ = result.LastInsertId()
		info.TerminalID = terminalID.Int64
		return &info, nil
	}

	if err != nil {
		return nil, err
	}

	if shiftID.Valid {
		info.ShiftID = shiftID.Int64
		info.TerminalID = terminalID.Int64
		return &info, nil
	}

	// Есть сотрудник, но нет открытой смены
	err = tx.QueryRow(`SELECT terminal_id FROM terminals WHERE store_code = ? ORDER BY terminal_id LIMIT 1`, storeID).Scan(&terminalID)
	if err != nil {
		return nil, err
	}

	result, err := tx.Exec(
		`INSERT INTO shifts(store_code, employee_id, terminal_id, opened_at, status, opening_cash) 
         VALUES (?, ?, ?, NOW(), 'open', 5000)`,
		storeID, info.EmployeeID, terminalID,
	)
	if err != nil {
		return nil, err
	}
	info.ShiftID, _ = result.LastInsertId()
	info.TerminalID = terminalID.Int64
	return &info, nil
}

// CreateSale создает новую продажу
func CreateSale(payload models.SaleCreate) (*models.Sale, error) {
	tx, err := db.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// 1. Получаем или создаем смену
	shiftInfo, err := getOpenShift(tx, payload.StoreID, payload.SellerID)
	if err != nil {
		return nil, err
	}

	// 2. Находим или создаем клиента
	customerIDPtr, err := findOrCreateCustomer(tx, payload)
	if err != nil {
		return nil, err
	}

	// 3. Проверяем остатки и считаем сумму
	gross := decimal.Zero
	type line struct {
		productID string
		quantity  decimal.Decimal
		unitPrice decimal.Decimal
		lineTotal decimal.Decimal
	}
	lines := []line{}

	for _, item := range payload.Items {
		var productID string
		var pricePerLiter, qtyOnHand float64

		err := tx.QueryRow(`
            SELECT p.id, p.price_per_liter, ib.qty_on_hand
            FROM products p
            JOIN inventory_balances ib ON ib.product_code = p.id AND ib.store_code = ?
            WHERE p.id = ?
        `, payload.StoreID, item.ProductID).Scan(&productID, &pricePerLiter, &qtyOnHand)

		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("товар %s не найден в остатках магазина", item.ProductID)
		}
		if err != nil {
			return nil, err
		}

		qty := item.Quantity
		if decimal.NewFromFloat(qtyOnHand).LessThan(qty) {
			return nil, fmt.Errorf("недостаточно остатка по товару %s", item.ProductID)
		}

		unitPrice := decimal.NewFromFloat(pricePerLiter)
		lineTotal := unitPrice.Mul(qty).Round(2)
		gross = gross.Add(lineTotal)

		lines = append(lines, line{
			productID: item.ProductID,
			quantity:  qty,
			unitPrice: unitPrice,
			lineTotal: lineTotal,
		})
	}

	// 4. Расчет бонусов
	bonusToUse := payload.BonusToUse
	if bonusToUse.GreaterThan(gross) {
		bonusToUse = gross
	}

	var customerID int64
	if customerIDPtr != nil {
		customerID = *customerIDPtr
		if bonusToUse.GreaterThan(decimal.Zero) {
			var balance float64
			err := tx.QueryRow(`SELECT bonus_balance FROM customers WHERE customer_id = ?`, customerID).Scan(&balance)
			if err != nil {
				return nil, err
			}
			if decimal.NewFromFloat(balance).LessThan(bonusToUse) {
				return nil, errors.New("недостаточно бонусов у клиента")
			}
		}
	}

	net := gross.Sub(bonusToUse).Round(2)

	bonusEarned := decimal.Zero
	if customerIDPtr != nil {
		bonusEarned = net.Mul(decimal.NewFromFloat(0.03)).Round(2)
	}

	// 5. Создаем запись о продаже
	saleCode := fmt.Sprintf("sale-%d", time.Now().Unix())

	result, err := tx.Exec(`
        INSERT INTO sales(sale_code, store_code, shift_id, terminal_id, cashier_id, customer_id, 
                          gross_amount, discount_amount, net_amount, item_count, bonus_used, bonus_earned, sale_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
		saleCode, payload.StoreID, shiftInfo.ShiftID, shiftInfo.TerminalID, shiftInfo.EmployeeID,
		customerIDPtr, gross, bonusToUse, net, len(lines), bonusToUse, bonusEarned,
	)
	if err != nil {
		return nil, err
	}

	saleID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	// 6. Добавляем позиции и обновляем остатки
	for _, l := range lines {
		_, err = tx.Exec(`
            INSERT INTO sale_items(sale_id, product_code, qty, unit_price, discount_amount, line_amount) 
            VALUES (?, ?, ?, ?, 0, ?)
        `, saleID, l.productID, l.quantity, l.unitPrice, l.lineTotal)
		if err != nil {
			return nil, err
		}

		_, err = tx.Exec(`
            UPDATE inventory_balances 
            SET qty_on_hand = qty_on_hand - ?, updated_at = NOW() 
            WHERE store_code = ? AND product_code = ?
        `, l.quantity, payload.StoreID, l.productID)
		if err != nil {
			return nil, err
		}

		_, err = tx.Exec(`
            INSERT INTO inventory_movements(store_code, product_code, movement_type, qty, reference_id, reference_type) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, payload.StoreID, l.productID, "sale", l.quantity.Neg(), saleID, "sale")
		if err != nil {
			return nil, err
		}
	}

	// 7. Добавляем платеж
	var bankRRN, bankAuthCode sql.NullString
	if payload.PaymentMethod == models.PaymentCard {
		bankRRN.String = fmt.Sprintf("RRN-%d", saleID)
		bankRRN.Valid = true
		bankAuthCode.String = fmt.Sprintf("AUTH-%d", saleID)
		bankAuthCode.Valid = true
	}

	_, err = tx.Exec(`
        INSERT INTO payments(sale_id, payment_method, amount, bank_rrn, bank_auth_code, status, paid_at) 
        VALUES (?, ?, ?, ?, ?, 'paid', NOW())
    `, saleID, payload.PaymentMethod, net, bankRRN, bankAuthCode)
	if err != nil {
		return nil, err
	}

	// 8. Фискальный документ
	_, err = tx.Exec(`
        INSERT INTO fiscal_documents(sale_id, terminal_id, document_type, ofd_status, fiscal_number, created_at) 
        VALUES (?, ?, 'receipt', 'sent', ?, NOW())
    `, saleID, shiftInfo.TerminalID, fmt.Sprintf("FD-%d", saleID))
	if err != nil {
		return nil, err
	}

	// 9. Логи синхронизации
	_, err = tx.Exec(`
        INSERT INTO external_sync_logs(sale_id, system_code, operation_type, status, external_id, created_at) 
        VALUES (?, 'ofd', 'sale_sync', 'success', ?, NOW()),
               (?, 'egais', 'sale_sync', 'success', ?, NOW())
    `, saleID, fmt.Sprintf("ofd-%d", saleID), saleID, fmt.Sprintf("egais-%d", saleID))
	if err != nil {
		return nil, err
	}

	// 10. Бонусы клиента
	if customerIDPtr != nil {
		if bonusToUse.GreaterThan(decimal.Zero) {
			_, err = tx.Exec(`UPDATE customers SET bonus_balance = bonus_balance - ? WHERE customer_id = ?`,
				bonusToUse, customerID)
			if err != nil {
				return nil, err
			}
			_, err = tx.Exec(`INSERT INTO loyalty_transactions(customer_id, sale_id, txn_type, points, created_at) VALUES (?, ?, 'redeem', ?, NOW())`,
				customerID, saleID, bonusToUse.Neg())
			if err != nil {
				return nil, err
			}
		}
		if bonusEarned.GreaterThan(decimal.Zero) {
			_, err = tx.Exec(`UPDATE customers SET bonus_balance = bonus_balance + ? WHERE customer_id = ?`,
				bonusEarned, customerID)
			if err != nil {
				return nil, err
			}
			_, err = tx.Exec(`INSERT INTO loyalty_transactions(customer_id, sale_id, txn_type, points, created_at) VALUES (?, ?, 'earn', ?, NOW())`,
				customerID, saleID, bonusEarned)
			if err != nil {
				return nil, err
			}
		}
	}

	// 11. Коммит
	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return GetSaleByID(fmt.Sprintf("sale-%d", saleID))
}

// GetSaleByID возвращает продажу по ID или sale_code
func GetSaleByID(saleCode string) (*models.Sale, error) {
	code := saleCode
	idStr := saleCode
	if strings.HasPrefix(saleCode, "sale-") {
		idStr = strings.TrimPrefix(saleCode, "sale-")
	}

	var sale models.Sale
	var customerID sql.NullInt64
	var customerName, sellerID, sellerName, paymentMethod sql.NullString
	var netAmount, bonusUsed, bonusEarned float64

	query := `
        SELECT s.sale_id, s.sale_code, s.store_code, e.user_code, e.full_name,
               c.customer_id, c.full_name, s.sale_at, s.net_amount, 
               s.bonus_used, s.bonus_earned, p.payment_method
        FROM sales s
        LEFT JOIN employees e ON e.employee_id = s.cashier_id
        LEFT JOIN customers c ON c.customer_id = s.customer_id
        LEFT JOIN payments p ON p.sale_id = s.sale_id
        WHERE s.sale_code = ? OR s.sale_id = ?
        LIMIT 1
    `
	err := db.DB.QueryRow(query, code, idStr).Scan(
		&sale.SaleID, &sale.SaleCode, &sale.StoreCode, &sellerID, &sellerName,
		&customerID, &customerName, &sale.SaleAt, &netAmount,
		&bonusUsed, &bonusEarned, &paymentMethod,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if customerID.Valid {
		id := customerID.Int64
		sale.CustomerID = &id
	}
	if customerName.Valid {
		name := customerName.String
		sale.CustomerName = &name
	}
	if sellerID.Valid {
		id := sellerID.String
		sale.SellerID = &id
	}
	if sellerName.Valid {
		name := sellerName.String
		sale.SellerName = &name
	}

	sale.NetAmount = decimal.NewFromFloat(netAmount)
	sale.BonusUsed = decimal.NewFromFloat(bonusUsed)
	sale.BonusEarned = decimal.NewFromFloat(bonusEarned)

	if paymentMethod.Valid {
		sale.PaymentMethod = paymentMethod.String
	} else {
		sale.PaymentMethod = "cash"
	}

	// Загружаем позиции
	rows, err := db.DB.Query(`
        SELECT product_code, qty, unit_price, line_amount 
        FROM sale_items 
        WHERE sale_id = ? 
        ORDER BY sale_item_id
    `, sale.SaleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item models.SaleItem
		var qty, unitPrice, lineAmount float64

		err := rows.Scan(&item.ProductCode, &qty, &unitPrice, &lineAmount)
		if err != nil {
			return nil, err
		}

		item.Qty = decimal.NewFromFloat(qty)
		item.UnitPrice = decimal.NewFromFloat(unitPrice)
		item.LineAmount = decimal.NewFromFloat(lineAmount)

		sale.Items = append(sale.Items, item)
	}

	return &sale, nil
}

// ListSales возвращает список продаж с фильтрацией
func ListSales(storeID, startDate, endDate *string) ([]models.Sale, error) {
	where := []string{"1=1"}
	params := []interface{}{}

	if storeID != nil && *storeID != "" {
		where = append(where, "s.store_code = ?")
		params = append(params, *storeID)
	}
	if startDate != nil && *startDate != "" {
		where = append(where, "DATE(s.sale_at) >= ?")
		params = append(params, *startDate)
	}
	if endDate != nil && *endDate != "" {
		where = append(where, "DATE(s.sale_at) <= ?")
		params = append(params, *endDate)
	}

	query := fmt.Sprintf(`
        SELECT s.sale_id, s.sale_code, s.store_code, s.sale_at, 
               s.net_amount, s.bonus_used, s.bonus_earned,
               e.user_code, e.full_name, c.customer_id, c.full_name, p.payment_method
        FROM sales s
        LEFT JOIN employees e ON e.employee_id = s.cashier_id
        LEFT JOIN customers c ON c.customer_id = s.customer_id
        LEFT JOIN payments p ON p.sale_id = s.sale_id
        WHERE %s
        ORDER BY s.sale_at DESC
        LIMIT 100
    `, strings.Join(where, " AND "))

	rows, err := db.DB.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	sales := []models.Sale{}
	for rows.Next() {
		var s models.Sale
		var sellerID, sellerName, paymentMethod sql.NullString
		var customerID sql.NullInt64
		var customerName sql.NullString
		var netAmount, bonusUsed, bonusEarned float64

		err := rows.Scan(
			&s.SaleID, &s.SaleCode, &s.StoreCode, &s.SaleAt,
			&netAmount, &bonusUsed, &bonusEarned,
			&sellerID, &sellerName, &customerID, &customerName, &paymentMethod,
		)
		if err != nil {
			return nil, err
		}

		s.NetAmount = decimal.NewFromFloat(netAmount)
		s.BonusUsed = decimal.NewFromFloat(bonusUsed)
		s.BonusEarned = decimal.NewFromFloat(bonusEarned)

		if sellerID.Valid {
			id := sellerID.String
			s.SellerID = &id
		}
		if sellerName.Valid {
			name := sellerName.String
			s.SellerName = &name
		}
		if customerID.Valid {
			id := customerID.Int64
			s.CustomerID = &id
		}
		if customerName.Valid {
			name := customerName.String
			s.CustomerName = &name
		}
		if paymentMethod.Valid {
			s.PaymentMethod = paymentMethod.String
		} else {
			s.PaymentMethod = "cash"
		}

		sales = append(sales, s)
	}

	return sales, nil
}
