package services

import (
	"beerstore/go/db"
	"beerstore/go/models"
	"database/sql"
	"time"
)

// GetDashboard возвращает данные для главного дашборда
func GetDashboard(storeID *string) (*models.DashboardResponse, error) {
	var storeClause string
	var params []interface{}

	if storeID != nil && *storeID != "" {
		storeClause = "AND fs.store_id = ?"
		params = append(params, *storeID)
	}

	// Today stats
	var todayRevenue, todayAvgCheck float64
	var todaySalesCount, todayActiveCustomers int

	query := `
        SELECT 
            COALESCE(SUM(net_amount), 0) AS revenue,
            COALESCE(SUM(receipt_count), 0) AS sales_count,
            COALESCE(ROUND(SUM(net_amount) / NULLIF(SUM(receipt_count), 0), 2), 0) AS average_check,
            COUNT(DISTINCT customer_id) AS active_customers
        FROM fact_sales fs
        JOIN dim_date dd ON dd.date_id = fs.date_id
        WHERE dd.full_date = CURDATE() ` + storeClause

	err := db.DB.QueryRow(query, params...).Scan(
		&todayRevenue, &todaySalesCount, &todayAvgCheck, &todayActiveCustomers,
	)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Week stats
	var weekRevenue, weekAvgCheck float64
	var weekSalesCount int

	query = `
        SELECT 
            COALESCE(SUM(net_amount), 0) AS revenue,
            COALESCE(SUM(receipt_count), 0) AS sales_count,
            COALESCE(ROUND(SUM(net_amount) / NULLIF(SUM(receipt_count), 0), 2), 0) AS average_check
        FROM fact_sales fs
        JOIN dim_date dd ON dd.date_id = fs.date_id
        WHERE dd.full_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) ` + storeClause

	err = db.DB.QueryRow(query, params...).Scan(
		&weekRevenue, &weekSalesCount, &weekAvgCheck,
	)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Low stock count
	var lowStockCount int
	lowQuery := `SELECT COUNT(*) FROM inventory_balances WHERE qty_on_hand <= min_qty`
	if storeID != nil && *storeID != "" {
		lowQuery += " AND store_code = ?"
		db.DB.QueryRow(lowQuery, *storeID).Scan(&lowStockCount)
	} else {
		db.DB.QueryRow(lowQuery).Scan(&lowStockCount)
	}

	// Chart data (последние 7 дней)
	chartQuery := `
        SELECT 
            DATE_FORMAT(dd.full_date, '%d.%m') AS name,
            COALESCE(SUM(fs.net_amount), 0) AS revenue
        FROM dim_date dd
        LEFT JOIN fact_sales fs ON fs.date_id = dd.date_id `
	if storeID != nil && *storeID != "" {
		chartQuery += " AND fs.store_id = ?"
	}
	chartQuery += `
        WHERE dd.full_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE()
        GROUP BY dd.full_date
        ORDER BY dd.full_date
    `

	var rows *sql.Rows
	if storeID != nil && *storeID != "" {
		rows, err = db.DB.Query(chartQuery, *storeID)
	} else {
		rows, err = db.DB.Query(chartQuery)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	chartData := []map[string]interface{}{}
	for rows.Next() {
		var name string
		var revenue float64
		rows.Scan(&name, &revenue)
		chartData = append(chartData, map[string]interface{}{
			"name":    name,
			"revenue": revenue,
		})
	}

	return &models.DashboardResponse{
		TodayStats: map[string]interface{}{
			"revenue":         todayRevenue,
			"salesCount":      todaySalesCount,
			"averageCheck":    todayAvgCheck,
			"activeCustomers": todayActiveCustomers,
		},
		WeekStats: map[string]interface{}{
			"revenue":      weekRevenue,
			"salesCount":   weekSalesCount,
			"averageCheck": weekAvgCheck,
		},
		LowStockCount: lowStockCount,
		ChartData:     chartData,
	}, nil
}

// GetDailyStats возвращает статистику по дням
func GetDailyStats(storeID *string) ([]map[string]interface{}, error) {
	var whereClause string
	var params []interface{}

	if storeID != nil && *storeID != "" {
		whereClause = "AND fs.store_id = ?"
		params = append(params, *storeID)
	}

	query := `
        SELECT 
            dd.full_date AS date,
            COALESCE(MAX(fs.store_id), ?) AS store_id,
            COALESCE(SUM(fs.net_amount), 0) AS revenue,
            COALESCE(SUM(fs.receipt_count), 0) AS sales_count,
            COALESCE(ROUND(SUM(fs.net_amount) / NULLIF(SUM(fs.receipt_count), 0), 2), 0) AS average_check,
            COUNT(DISTINCT fs.customer_id) AS new_customers
        FROM dim_date dd
        LEFT JOIN fact_sales fs ON fs.date_id = dd.date_id ` + whereClause + `
        WHERE dd.full_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 13 DAY) AND CURDATE()
        GROUP BY dd.full_date
        ORDER BY dd.full_date
    `

	allParams := []interface{}{}
	if storeID != nil && *storeID != "" {
		allParams = append(allParams, *storeID)
	} else {
		allParams = append(allParams, "all")
	}
	allParams = append(allParams, params...)

	rows, err := db.DB.Query(query, allParams...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stats := []map[string]interface{}{}
	for rows.Next() {
		var date time.Time
		var storeIDVal string
		var revenue, avgCheck float64
		var salesCount, newCustomers int

		rows.Scan(&date, &storeIDVal, &revenue, &salesCount, &avgCheck, &newCustomers)

		stats = append(stats, map[string]interface{}{
			"date":         date.Format("2006-01-02"),
			"storeId":      storeIDVal,
			"revenue":      revenue,
			"salesCount":   salesCount,
			"averageCheck": avgCheck,
			"newCustomers": newCustomers,
		})
	}

	return stats, nil
}

// GetManagementReport возвращает управленческий отчет
func GetManagementReport(startDate, endDate, storeID *string) (*models.ManagementReportResponse, error) {
	now := time.Now()
	if startDate == nil || *startDate == "" {
		d := now.AddDate(0, 0, -29).Format("2006-01-02")
		startDate = &d
	}
	if endDate == nil || *endDate == "" {
		d := now.Format("2006-01-02")
		endDate = &d
	}

	params := []interface{}{*startDate, *endDate}
	storeSQL := ""
	if storeID != nil && *storeID != "" {
		storeSQL = "AND fs.store_id = ?"
		params = append(params, *storeID)
	}

	// Summary
	var revenue, avgCheck, liters float64
	var receipts, customers int

	query := `
        SELECT 
            COALESCE(SUM(fs.net_amount), 0) AS revenue,
            COALESCE(SUM(fs.receipt_count), 0) AS receipts,
            COALESCE(ROUND(SUM(fs.net_amount) / NULLIF(SUM(fs.receipt_count), 0), 2), 0) AS avg_check,
            COALESCE(SUM(fs.qty_sold), 0) AS liters,
            COUNT(DISTINCT fs.customer_id) AS customers
        FROM fact_sales fs
        JOIN dim_date dd ON dd.date_id = fs.date_id
        WHERE dd.full_date BETWEEN ? AND ? ` + storeSQL

	db.DB.QueryRow(query, params...).Scan(&revenue, &receipts, &avgCheck, &liters, &customers)

	return &models.ManagementReportResponse{
		Period: map[string]interface{}{
			"startDate": *startDate,
			"endDate":   *endDate,
			"storeId":   storeID,
		},
		Summary: map[string]interface{}{
			"revenue":         revenue,
			"receipts":        receipts,
			"averageCheck":    avgCheck,
			"litersSold":      liters,
			"activeCustomers": customers,
		},
		RevenueByDay:         []map[string]interface{}{},
		TopProducts:          []map[string]interface{}{},
		StaffPerformance:     []map[string]interface{}{},
		SalesByPaymentMethod: []map[string]interface{}{},
		Customers:            map[string]interface{}{},
	}, nil
}
