package db

import "log"

// DDL для MySQL (конвертировано из PostgreSQL)
const DDL = `
-- Таблица магазинов (должна существовать)
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    working_hours VARCHAR(100),
    manager_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Товары
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    manufacturer VARCHAR(255),
    country VARCHAR(100),
    abv DECIMAL(5,2),
    ibu INT,
    description TEXT,
    price_per_liter DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Категории товаров
CREATE TABLE IF NOT EXISTS product_categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Сотрудники
CREATE TABLE IF NOT EXISTS employees (
    employee_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_code VARCHAR(50) UNIQUE NOT NULL,
    store_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_code VARCHAR(50) NOT NULL,
    hired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (store_code) REFERENCES stores(id)
);

-- Терминалы
CREATE TABLE IF NOT EXISTS terminals (
    terminal_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL,
    terminal_code VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (store_code) REFERENCES stores(id)
);

-- Клиенты
CREATE TABLE IF NOT EXISTS customers (
    customer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) UNIQUE,
    full_name VARCHAR(255),
    birth_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_loyalty_member BOOLEAN DEFAULT FALSE,
    favorite_category_cache VARCHAR(255),
    bonus_balance DECIMAL(12,2) DEFAULT 0
);

-- Смены
CREATE TABLE IF NOT EXISTS shifts (
    shift_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL,
    employee_id BIGINT NOT NULL,
    terminal_id BIGINT,
    opened_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    opening_cash DECIMAL(12,2) DEFAULT 0,
    closing_cash DECIMAL(12,2),
    FOREIGN KEY (store_code) REFERENCES stores(id),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (terminal_id) REFERENCES terminals(terminal_id)
);

-- Остатки товаров
CREATE TABLE IF NOT EXISTS inventory_balances (
    balance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL,
    product_code VARCHAR(50) NOT NULL,
    qty_on_hand DECIMAL(12,3) NOT NULL DEFAULT 0,
    min_qty DECIMAL(12,3) NOT NULL DEFAULT 20,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_store_product (store_code, product_code),
    FOREIGN KEY (store_code) REFERENCES stores(id),
    FOREIGN KEY (product_code) REFERENCES products(id)
);

-- История цен
CREATE TABLE IF NOT EXISTS price_history (
    price_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(50) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    valid_from DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_to DATETIME,
    FOREIGN KEY (product_code) REFERENCES products(id)
);

-- Продажи
CREATE TABLE IF NOT EXISTS sales (
    sale_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_code VARCHAR(50) UNIQUE NOT NULL,
    store_code VARCHAR(50) NOT NULL,
    shift_id BIGINT,
    terminal_id BIGINT,
    cashier_id BIGINT,
    customer_id BIGINT,
    sale_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    gross_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,
    item_count INT NOT NULL DEFAULT 0,
    bonus_used DECIMAL(12,2) NOT NULL DEFAULT 0,
    bonus_earned DECIMAL(12,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (store_code) REFERENCES stores(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(shift_id),
    FOREIGN KEY (terminal_id) REFERENCES terminals(terminal_id),
    FOREIGN KEY (cashier_id) REFERENCES employees(employee_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Позиции в чеке
CREATE TABLE IF NOT EXISTS sale_items (
    sale_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    product_code VARCHAR(50) NOT NULL,
    qty DECIMAL(12,3) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    line_amount DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
    FOREIGN KEY (product_code) REFERENCES products(id)
);

-- Платежи
CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    bank_rrn VARCHAR(100),
    bank_auth_code VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'paid',
    paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE
);

-- Движения товаров
CREATE TABLE IF NOT EXISTS inventory_movements (
    movement_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL,
    product_code VARCHAR(50) NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    qty DECIMAL(12,3) NOT NULL,
    reference_id BIGINT,
    reference_type VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_code) REFERENCES stores(id),
    FOREIGN KEY (product_code) REFERENCES products(id)
);

-- Транзакции лояльности
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    loyalty_txn_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    sale_id BIGINT,
    txn_type VARCHAR(20) NOT NULL,
    points DECIMAL(12,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id)
);

-- Фискальные документы
CREATE TABLE IF NOT EXISTS fiscal_documents (
    fiscal_doc_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    terminal_id BIGINT,
    document_type VARCHAR(50) NOT NULL,
    ofd_status VARCHAR(50) NOT NULL,
    fiscal_number VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id),
    FOREIGN KEY (terminal_id) REFERENCES terminals(terminal_id)
);

-- Логи синхронизации
CREATE TABLE IF NOT EXISTS external_sync_logs (
    sync_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT,
    system_code VARCHAR(50) NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    external_id VARCHAR(255),
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id)
);

-- Измерения для аналитики
CREATE TABLE IF NOT EXISTS dim_date (
    date_id INT PRIMARY KEY,
    full_date DATE UNIQUE NOT NULL,
    day_num INT NOT NULL,
    week_num INT NOT NULL,
    month_num INT NOT NULL,
    year_num INT NOT NULL,
    weekday_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_hour (
    hour_id INT PRIMARY KEY,
    hour_num INT UNIQUE NOT NULL,
    hour_bucket VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_product (
    product_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS dim_employee (
    employee_id BIGINT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    role_code VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_payment_method (
    payment_method_id INT PRIMARY KEY,
    payment_method_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_store (
    store_id VARCHAR(50) PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    address TEXT
);

CREATE TABLE IF NOT EXISTS dim_customer (
    customer_id BIGINT PRIMARY KEY,
    age_group VARCHAR(50),
    is_loyalty_member BOOLEAN NOT NULL DEFAULT FALSE
);

-- Факты продаж
CREATE TABLE IF NOT EXISTS fact_sales (
    fact_sales_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT NOT NULL,
    date_id INT NOT NULL,
    hour_id INT NOT NULL,
    store_id VARCHAR(50) NOT NULL,
    employee_id BIGINT,
    customer_id BIGINT,
    product_id VARCHAR(50) NOT NULL,
    payment_method_id INT NOT NULL,
    qty_sold DECIMAL(12,3) NOT NULL,
    gross_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    receipt_count INT NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id),
    FOREIGN KEY (hour_id) REFERENCES dim_hour(hour_id),
    FOREIGN KEY (store_id) REFERENCES dim_store(store_id),
    FOREIGN KEY (employee_id) REFERENCES dim_employee(employee_id),
    FOREIGN KEY (customer_id) REFERENCES dim_customer(customer_id),
    FOREIGN KEY (product_id) REFERENCES dim_product(product_id),
    FOREIGN KEY (payment_method_id) REFERENCES dim_payment_method(payment_method_id)
);

CREATE TABLE IF NOT EXISTS fact_shift_performance (
    fact_shift_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shift_id BIGINT UNIQUE NOT NULL,
    date_id INT NOT NULL,
    store_id VARCHAR(50) NOT NULL,
    employee_id BIGINT NOT NULL,
    revenue_amount DECIMAL(12,2) NOT NULL,
    receipt_count INT NOT NULL,
    items_sold INT NOT NULL,
    worked_hours DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (shift_id) REFERENCES shifts(shift_id) ON DELETE CASCADE,
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id),
    FOREIGN KEY (store_id) REFERENCES dim_store(store_id),
    FOREIGN KEY (employee_id) REFERENCES dim_employee(employee_id)
);

CREATE TABLE IF NOT EXISTS fact_customer_activity (
    fact_customer_activity_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    store_id VARCHAR(50) NOT NULL,
    date_id INT NOT NULL,
    receipt_count INT NOT NULL,
    revenue_amount DECIMAL(12,2) NOT NULL,
    favorite_product_group VARCHAR(255),
    visit_hour_bucket INT,
    FOREIGN KEY (customer_id) REFERENCES dim_customer(customer_id),
    FOREIGN KEY (store_id) REFERENCES dim_store(store_id),
    FOREIGN KEY (date_id) REFERENCES dim_date(date_id)
);
`

const SEED_SQL = `
-- Начальные данные
INSERT IGNORE INTO product_categories(name)
SELECT DISTINCT COALESCE(category, 'other') FROM products;

INSERT IGNORE INTO employees(user_code, store_code, full_name, role_code)
SELECT u.id, COALESCE(u.store_id, 'store-1'), u.name, u.role
FROM users u;

INSERT IGNORE INTO terminals(store_code, terminal_code)
SELECT s.id, CONCAT('TERM-', UPPER(REPLACE(s.id, 'store-', '')))
FROM stores s;

INSERT IGNORE INTO dim_hour(hour_id, hour_num, hour_bucket)
VALUES 
(0,0,'1'),(1,1,'1'),(2,2,'1'),(3,3,'1'),(4,4,'1'),(5,5,'1'),
(6,6,'1'),(7,7,'1'),(8,8,'1'),(9,9,'1'),(10,10,'1'),(11,11,'1'),
(12,12,'2'),(13,13,'2'),(14,14,'2'),(15,15,'2'),(16,16,'2'),(17,17,'2'),
(18,18,'3'),(19,19,'3'),(20,20,'3'),(21,21,'3'),(22,22,'3'),(23,23,'3');

INSERT IGNORE INTO dim_payment_method(payment_method_id, payment_method_name) 
VALUES (1, 'cash'), (2, 'card'), (3, 'transfer');
`

func InitSchema() error {
	log.Println("🔄 Creating tables...")
	_, err := DB.Exec(DDL)
	if err != nil {
		return err
	}

	log.Println("🌱 Seeding data...")
	_, err = DB.Exec(SEED_SQL)
	if err != nil {
		log.Printf("⚠️ Seed warning: %v", err)
	}

	log.Println("✅ Schema ready")
	return nil
}
