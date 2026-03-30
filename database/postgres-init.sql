-- PostgreSQL (python profile): schema + idempotent demo seed (ON CONFLICT)

CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    working_hours VARCHAR(100),
    manager_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL,
    store_id VARCHAR(50) REFERENCES stores(id)
);

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

INSERT INTO stores (id, name, address, phone, working_hours, manager_id, is_active) VALUES
('store-1', 'Жидкое Золото - Центр', 'ул. Ленина, 42', '+7 (495) 123-45-67', '10:00 - 22:00', 'user-2', TRUE),
('store-2', 'Жидкое Золото - Север', 'пр. Мира, 128', '+7 (495) 234-56-78', '10:00 - 23:00', 'user-3', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, role, store_id) VALUES
('user-1', 'Иван Петров', 'manager1@goldenliquid.ru', 'manager', 'store-1'),
('user-2', 'Мария Сидорова', 'purchaser1@goldenliquid.ru', 'purchaser', NULL),
('user-3', 'Алексей Козлов', 'bartender1@goldenliquid.ru', 'bartender', 'store-1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, category, manufacturer, country, abv, ibu, description, price_per_liter, is_active) VALUES
('prod-1', 'Жигулёвское Классическое', 'light', 'Жигулёвский ПЗ', 'Россия', 4.5, 18, 'Классический лагер с мягким вкусом', 120, TRUE),
('prod-2', 'Балтика 7 Экспортное', 'lager', 'Балтика', 'Россия', 5.4, 22, 'Премиальный лагер', 150, TRUE),
('prod-3', 'Guinness Draught', 'dark', 'Diageo', 'Ирландия', 4.2, 45, 'Ирландский стаут', 320, TRUE)
ON CONFLICT (id) DO NOTHING;
