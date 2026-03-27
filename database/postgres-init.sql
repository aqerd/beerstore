CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    working_hours VARCHAR(100),
    manager_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO stores (id, name, address, phone, working_hours, manager_id) VALUES
('store-1', 'Жидкое Золото - Центр', 'ул. Ленина, 42', '+7 (495) 123-45-67', '10:00 - 22:00', 'user-2');

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL,
    store_id VARCHAR(50) REFERENCES stores(id)
);

INSERT INTO users (id, name, email, role, store_id) VALUES
('user-1', 'Иван Петров', 'manager1@goldenliquid.ru', 'manager', 'store-1');

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    manufacturer VARCHAR(255),
    country VARCHAR(100),
    abv DECIMAL(4,2),
    ibu INT,
    description TEXT,
    price_per_liter DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO products (id, name, category, manufacturer, country, abv, ibu, description, price_per_liter) VALUES
('prod-1', 'Жигулёвское Классическое', 'light', 'Жигулёвский ПЗ', 'Россия', 4.5, 18, 'Классический лагер с мягким вкусом', 120);
