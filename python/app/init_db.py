from app.db import get_conn


DDL = r'''
CREATE TABLE IF NOT EXISTS product_categories (
    category_id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
    employee_id BIGSERIAL PRIMARY KEY,
    user_code VARCHAR(50) UNIQUE NOT NULL,
    store_code VARCHAR(50) NOT NULL REFERENCES stores(id),
    full_name TEXT NOT NULL,
    role_code TEXT NOT NULL,
    hired_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS terminals (
    terminal_id BIGSERIAL PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL REFERENCES stores(id),
    terminal_code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id BIGSERIAL PRIMARY KEY,
    phone TEXT UNIQUE,
    full_name TEXT,
    birth_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    is_loyalty_member BOOLEAN DEFAULT FALSE,
    favorite_category_cache TEXT,
    bonus_balance NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shifts (
    shift_id BIGSERIAL PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL REFERENCES stores(id),
    employee_id BIGINT NOT NULL REFERENCES employees(employee_id),
    terminal_id BIGINT REFERENCES terminals(terminal_id),
    opened_at TIMESTAMP NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'open',
    opening_cash NUMERIC(12,2) DEFAULT 0,
    closing_cash NUMERIC(12,2)
);

CREATE TABLE IF NOT EXISTS inventory_balances (
    balance_id BIGSERIAL PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL REFERENCES stores(id),
    product_code VARCHAR(50) NOT NULL REFERENCES products(id),
    qty_on_hand NUMERIC(12,3) NOT NULL DEFAULT 0,
    min_qty NUMERIC(12,3) NOT NULL DEFAULT 20,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(store_code, product_code)
);

CREATE TABLE IF NOT EXISTS price_history (
    price_id BIGSERIAL PRIMARY KEY,
    product_code VARCHAR(50) NOT NULL REFERENCES products(id),
    price NUMERIC(12,2) NOT NULL,
    valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    sale_id BIGSERIAL PRIMARY KEY,
    sale_code VARCHAR(50) UNIQUE NOT NULL,
    store_code VARCHAR(50) NOT NULL REFERENCES stores(id),
    shift_id BIGINT REFERENCES shifts(shift_id),
    terminal_id BIGINT REFERENCES terminals(terminal_id),
    cashier_id BIGINT REFERENCES employees(employee_id),
    customer_id BIGINT REFERENCES customers(customer_id),
    sale_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'completed',
    gross_amount NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_amount NUMERIC(12,2) NOT NULL,
    item_count INT NOT NULL DEFAULT 0,
    bonus_used NUMERIC(12,2) NOT NULL DEFAULT 0,
    bonus_earned NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sale_items (
    sale_item_id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sales(sale_id) ON DELETE CASCADE,
    product_code VARCHAR(50) NOT NULL REFERENCES products(id),
    qty NUMERIC(12,3) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    line_amount NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sales(sale_id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    bank_rrn TEXT,
    bank_auth_code TEXT,
    status TEXT NOT NULL DEFAULT 'paid',
    paid_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    movement_id BIGSERIAL PRIMARY KEY,
    store_code VARCHAR(50) NOT NULL REFERENCES stores(id),
    product_code VARCHAR(50) NOT NULL REFERENCES products(id),
    movement_type TEXT NOT NULL,
    qty NUMERIC(12,3) NOT NULL,
    reference_id BIGINT,
    reference_type TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    loyalty_txn_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id),
    sale_id BIGINT REFERENCES sales(sale_id),
    txn_type TEXT NOT NULL,
    points NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fiscal_documents (
    fiscal_doc_id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sales(sale_id),
    terminal_id BIGINT REFERENCES terminals(terminal_id),
    document_type TEXT NOT NULL,
    ofd_status TEXT NOT NULL,
    fiscal_number TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS external_sync_logs (
    sync_id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT REFERENCES sales(sale_id),
    system_code TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    external_id TEXT
);

CREATE TABLE IF NOT EXISTS dim_date (
    date_id INT PRIMARY KEY,
    full_date DATE UNIQUE NOT NULL,
    day_num INT NOT NULL,
    week_num INT NOT NULL,
    month_num INT NOT NULL,
    year_num INT NOT NULL,
    weekday_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_hour (
    hour_id INT PRIMARY KEY,
    hour_num INT UNIQUE NOT NULL,
    hour_bucket TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_product (
    product_id VARCHAR(50) PRIMARY KEY,
    product_name TEXT NOT NULL,
    category_name TEXT
);

CREATE TABLE IF NOT EXISTS dim_employee (
    employee_id BIGINT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role_code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_payment_method (
    payment_method_id INT PRIMARY KEY,
    payment_method_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_store (
    store_id VARCHAR(50) PRIMARY KEY,
    store_name TEXT NOT NULL,
    address TEXT
);

CREATE TABLE IF NOT EXISTS dim_customer (
    customer_id BIGINT PRIMARY KEY,
    age_group TEXT,
    is_loyalty_member BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS fact_sales (
    fact_sales_id BIGSERIAL PRIMARY KEY,
    sale_id BIGINT NOT NULL REFERENCES sales(sale_id) ON DELETE CASCADE,
    date_id INT NOT NULL REFERENCES dim_date(date_id),
    hour_id INT NOT NULL REFERENCES dim_hour(hour_id),
    store_id VARCHAR(50) NOT NULL REFERENCES dim_store(store_id),
    employee_id BIGINT REFERENCES dim_employee(employee_id),
    customer_id BIGINT REFERENCES dim_customer(customer_id),
    product_id VARCHAR(50) NOT NULL REFERENCES dim_product(product_id),
    payment_method_id INT NOT NULL REFERENCES dim_payment_method(payment_method_id),
    qty_sold NUMERIC(12,3) NOT NULL,
    gross_amount NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2) NOT NULL,
    net_amount NUMERIC(12,2) NOT NULL,
    receipt_count INT NOT NULL
);

CREATE TABLE IF NOT EXISTS fact_shift_performance (
    fact_shift_id BIGSERIAL PRIMARY KEY,
    shift_id BIGINT UNIQUE NOT NULL REFERENCES shifts(shift_id) ON DELETE CASCADE,
    date_id INT NOT NULL REFERENCES dim_date(date_id),
    store_id VARCHAR(50) NOT NULL REFERENCES dim_store(store_id),
    employee_id BIGINT NOT NULL REFERENCES dim_employee(employee_id),
    revenue_amount NUMERIC(12,2) NOT NULL,
    receipt_count INT NOT NULL,
    items_sold INT NOT NULL,
    worked_hours NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS fact_customer_activity (
    fact_customer_activity_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES dim_customer(customer_id),
    store_id VARCHAR(50) NOT NULL REFERENCES dim_store(store_id),
    date_id INT NOT NULL REFERENCES dim_date(date_id),
    receipt_count INT NOT NULL,
    revenue_amount NUMERIC(12,2) NOT NULL,
    favorite_product_group TEXT,
    visit_hour_bucket INT
);
'''


SEED_SQL = r'''
INSERT INTO product_categories(name)
SELECT DISTINCT COALESCE(category, 'other') FROM products
ON CONFLICT DO NOTHING;

INSERT INTO employees(user_code, store_code, full_name, role_code)
SELECT u.id, COALESCE(u.store_id, 'store-1'), u.name, u.role
FROM users u
ON CONFLICT (user_code) DO NOTHING;

INSERT INTO terminals(store_code, terminal_code)
SELECT s.id, CONCAT('TERM-', UPPER(REPLACE(s.id, 'store-', '')))
FROM stores s
ON CONFLICT (terminal_code) DO NOTHING;

INSERT INTO inventory_balances(store_code, product_code, qty_on_hand, min_qty)
SELECT s.id, p.id,
       CASE p.id WHEN 'prod-1' THEN 180 WHEN 'prod-2' THEN 140 ELSE 90 END,
       25
FROM stores s CROSS JOIN products p
ON CONFLICT (store_code, product_code) DO NOTHING;

INSERT INTO price_history(product_code, price, valid_from)
SELECT p.id, p.price_per_liter, NOW() - INTERVAL '30 days'
FROM products p
ON CONFLICT DO NOTHING;

INSERT INTO dim_hour(hour_id, hour_num, hour_bucket)
SELECT h, h,
       CASE WHEN h < 12 THEN 1 WHEN h < 18 THEN 2 ELSE 3 END::text
FROM generate_series(0,23) h
ON CONFLICT (hour_id) DO NOTHING;

INSERT INTO dim_payment_method(payment_method_id, payment_method_name) VALUES
(1, 'cash'), (2, 'card'), (3, 'transfer')
ON CONFLICT (payment_method_id) DO NOTHING;

INSERT INTO dim_store(store_id, store_name, address)
SELECT id, name, address FROM stores
ON CONFLICT (store_id) DO UPDATE SET store_name = EXCLUDED.store_name, address = EXCLUDED.address;

INSERT INTO dim_product(product_id, product_name, category_name)
SELECT id, name, category FROM products
ON CONFLICT (product_id) DO UPDATE SET product_name = EXCLUDED.product_name, category_name = EXCLUDED.category_name;

INSERT INTO dim_employee(employee_id, full_name, role_code)
SELECT employee_id, full_name, role_code FROM employees
ON CONFLICT (employee_id) DO UPDATE SET full_name = EXCLUDED.full_name, role_code = EXCLUDED.role_code;
'''


def ensure_dates(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO dim_date(date_id, full_date, day_num, week_num, month_num, year_num, weekday_name)
            SELECT TO_CHAR(d::date, 'YYYYMMDD')::int,
                   d::date,
                   EXTRACT(DAY FROM d)::int,
                   EXTRACT(WEEK FROM d)::int,
                   EXTRACT(MONTH FROM d)::int,
                   EXTRACT(YEAR FROM d)::int,
                   TO_CHAR(d::date, 'TMDay')
            FROM generate_series(CURRENT_DATE - INTERVAL '365 day', CURRENT_DATE + INTERVAL '30 day', INTERVAL '1 day') d
            ON CONFLICT (date_id) DO NOTHING
            """
        )


def seed_demo_sales(conn):
    with conn.cursor() as cur:
        cur.execute('SELECT COUNT(*) AS cnt FROM sales')
        if cur.fetchone()['cnt'] > 0:
            return
        cur.execute('SELECT employee_id, store_code FROM employees ORDER BY employee_id LIMIT 2')
        employees = cur.fetchall()
        cur.execute('SELECT terminal_id, store_code FROM terminals ORDER BY terminal_id LIMIT 2')
        terminals = cur.fetchall()
        cur.execute("INSERT INTO customers(phone, full_name, is_loyalty_member, bonus_balance, favorite_category_cache) VALUES (%s,%s,%s,%s,%s),(%s,%s,%s,%s,%s) RETURNING customer_id", (
            '+79990000001', 'Антон Гость', True, 120, 'lager',
            '+79990000002', 'Елена Постоянная', True, 60, 'dark',
        ))
        customers = [r['customer_id'] for r in cur.fetchall()]

        for day_shift in range(1, 8):
            emp = employees[(day_shift - 1) % len(employees)]
            term = next(t for t in terminals if t['store_code'] == emp['store_code'])
            cur.execute(
                """
                INSERT INTO shifts(store_code, employee_id, terminal_id, opened_at, closed_at, status, opening_cash, closing_cash)
                VALUES (%s, %s, %s, NOW() - (%s || ' days')::interval - INTERVAL '10 hours', NOW() - (%s || ' days')::interval - INTERVAL '2 hours', 'closed', 5000, 9000)
                RETURNING shift_id
                """,
                (emp['store_code'], emp['employee_id'], term['terminal_id'], day_shift, day_shift)
            )
            shift_id = cur.fetchone()['shift_id']
            cur.execute('SELECT id, price_per_liter FROM products ORDER BY id')
            products = cur.fetchall()
            for idx, product in enumerate(products, start=1):
                qty = 2 + idx + (day_shift % 3)
                unit_price = product['price_per_liter']
                gross = qty * unit_price
                sale_code = f'S-{day_shift}{idx:02d}'
                customer_id = customers[idx % len(customers)]
                cur.execute(
                    """
                    INSERT INTO sales(sale_code, store_code, shift_id, terminal_id, cashier_id, customer_id, sale_at, gross_amount, discount_amount, net_amount, item_count, bonus_used, bonus_earned)
                    VALUES (%s,%s,%s,%s,%s,%s, NOW() - (%s || ' days')::interval - (%s || ' hours')::interval, %s, 0, %s, 1, 0, %s)
                    RETURNING sale_id
                    """,
                    (sale_code, emp['store_code'], shift_id, term['terminal_id'], emp['employee_id'], customer_id, day_shift, 12 + idx, gross, gross, round(float(gross) * 0.03, 2))
                )
                sale_id = cur.fetchone()['sale_id']
                cur.execute(
                    'INSERT INTO sale_items(sale_id, product_code, qty, unit_price, line_amount) VALUES (%s,%s,%s,%s,%s)',
                    (sale_id, product['id'], qty, unit_price, gross)
                )
                cur.execute(
                    'INSERT INTO payments(sale_id, payment_method, amount, status) VALUES (%s,%s,%s,%s)',
                    (sale_id, 'card' if idx % 2 == 0 else 'cash', gross, 'paid')
                )
                cur.execute(
                    'UPDATE inventory_balances SET qty_on_hand = qty_on_hand - %s, updated_at = NOW() WHERE store_code = %s AND product_code = %s',
                    (qty, emp['store_code'], product['id'])
                )
                cur.execute(
                    'INSERT INTO inventory_movements(store_code, product_code, movement_type, qty, reference_id, reference_type) VALUES (%s,%s,%s,%s,%s,%s)',
                    (emp['store_code'], product['id'], 'sale', -qty, sale_id, 'sale')
                )
                cur.execute(
                    'INSERT INTO fiscal_documents(sale_id, terminal_id, document_type, ofd_status, fiscal_number) VALUES (%s,%s,%s,%s,%s)',
                    (sale_id, term['terminal_id'], 'receipt', 'sent', f'FD-{sale_id}')
                )
                cur.execute(
                    'INSERT INTO external_sync_logs(sale_id, system_code, operation_type, status, external_id) VALUES (%s,%s,%s,%s,%s)',
                    (sale_id, 'egais', 'sale_sync', 'success', f'egais-{sale_id}')
                )


def ensure_fact_sales_grain(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT con.conname
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            WHERE rel.relname = 'fact_sales' AND con.contype = 'u'
            """
        )
        for row in cur.fetchall():
            cur.execute(f'ALTER TABLE fact_sales DROP CONSTRAINT IF EXISTS {row["conname"]}')


def refresh_marts(conn):
    with conn.cursor() as cur:
        cur.execute('TRUNCATE fact_sales, fact_shift_performance, fact_customer_activity')
        cur.execute(
            """
            INSERT INTO dim_store(store_id, store_name, address)
            SELECT id, name, address FROM stores
            ON CONFLICT (store_id) DO UPDATE SET store_name = EXCLUDED.store_name, address = EXCLUDED.address
            """
        )
        cur.execute(
            """
            INSERT INTO dim_product(product_id, product_name, category_name)
            SELECT id, name, category FROM products
            ON CONFLICT (product_id) DO UPDATE SET product_name = EXCLUDED.product_name, category_name = EXCLUDED.category_name
            """
        )
        cur.execute(
            """
            INSERT INTO dim_employee(employee_id, full_name, role_code)
            SELECT employee_id, full_name, role_code FROM employees
            ON CONFLICT (employee_id) DO UPDATE SET full_name = EXCLUDED.full_name, role_code = EXCLUDED.role_code
            """
        )
        cur.execute(
            """
            INSERT INTO dim_customer(customer_id, age_group, is_loyalty_member)
            SELECT customer_id,
                   CASE
                     WHEN birth_date IS NULL THEN 'unknown'
                     WHEN DATE_PART('year', AGE(birth_date)) < 25 THEN '18-24'
                     WHEN DATE_PART('year', AGE(birth_date)) < 35 THEN '25-34'
                     WHEN DATE_PART('year', AGE(birth_date)) < 45 THEN '35-44'
                     ELSE '45+'
                   END,
                   is_loyalty_member
            FROM customers
            ON CONFLICT (customer_id) DO UPDATE SET age_group = EXCLUDED.age_group, is_loyalty_member = EXCLUDED.is_loyalty_member
            """
        )
        cur.execute(
            """
            INSERT INTO fact_sales(sale_id, date_id, hour_id, store_id, employee_id, customer_id, product_id, payment_method_id, qty_sold, gross_amount, discount_amount, net_amount, receipt_count)
            SELECT s.sale_id,
                   TO_CHAR(s.sale_at::date, 'YYYYMMDD')::int,
                   EXTRACT(HOUR FROM s.sale_at)::int,
                   s.store_code,
                   s.cashier_id,
                   s.customer_id,
                   si.product_code,
                   CASE COALESCE(p.payment_method, 'cash') WHEN 'cash' THEN 1 WHEN 'card' THEN 2 ELSE 3 END,
                   si.qty,
                   si.line_amount,
                   si.discount_amount,
                   si.line_amount - si.discount_amount,
                   CASE WHEN ROW_NUMBER() OVER (PARTITION BY s.sale_id ORDER BY si.sale_item_id) = 1 THEN 1 ELSE 0 END
            FROM sales s
            JOIN sale_items si ON si.sale_id = s.sale_id
            LEFT JOIN payments p ON p.sale_id = s.sale_id
            WHERE s.status = 'completed'
            """
        )
        cur.execute(
            """
            INSERT INTO fact_shift_performance(shift_id, date_id, store_id, employee_id, revenue_amount, receipt_count, items_sold, worked_hours)
            SELECT sh.shift_id,
                   TO_CHAR(sh.opened_at::date, 'YYYYMMDD')::int,
                   sh.store_code,
                   sh.employee_id,
                   COALESCE(SUM(s.net_amount), 0),
                   COUNT(s.sale_id),
                   COALESCE(SUM(s.item_count), 0),
                   ROUND(EXTRACT(EPOCH FROM (COALESCE(sh.closed_at, NOW()) - sh.opened_at)) / 3600.0, 2)
            FROM shifts sh
            LEFT JOIN sales s ON s.shift_id = sh.shift_id AND s.status = 'completed'
            GROUP BY sh.shift_id
            """
        )
        cur.execute(
            """
            WITH sales_agg AS (
                SELECT s.customer_id,
                       s.store_code,
                       TO_CHAR(s.sale_at::date, 'YYYYMMDD')::int AS date_id,
                       COUNT(*) AS receipt_count,
                       SUM(s.net_amount) AS revenue_amount,
                       EXTRACT(HOUR FROM MIN(s.sale_at))::int AS visit_hour_bucket
                FROM sales s
                WHERE s.customer_id IS NOT NULL AND s.status = 'completed'
                GROUP BY s.customer_id, s.store_code, TO_CHAR(s.sale_at::date, 'YYYYMMDD')::int
            ),
            favorite_category AS (
                SELECT s.customer_id,
                       s.store_code,
                       TO_CHAR(s.sale_at::date, 'YYYYMMDD')::int AS date_id,
                       p.category,
                       ROW_NUMBER() OVER (
                           PARTITION BY s.customer_id, s.store_code, TO_CHAR(s.sale_at::date, 'YYYYMMDD')::int
                           ORDER BY SUM(si.qty) DESC, p.category
                       ) AS rn
                FROM sales s
                JOIN sale_items si ON si.sale_id = s.sale_id
                JOIN products p ON p.id = si.product_code
                WHERE s.customer_id IS NOT NULL AND s.status = 'completed'
                GROUP BY s.customer_id, s.store_code, TO_CHAR(s.sale_at::date, 'YYYYMMDD')::int, p.category
            )
            INSERT INTO fact_customer_activity(customer_id, store_id, date_id, receipt_count, revenue_amount, favorite_product_group, visit_hour_bucket)
            SELECT sa.customer_id,
                   sa.store_code,
                   sa.date_id,
                   sa.receipt_count,
                   sa.revenue_amount,
                   fc.category,
                   sa.visit_hour_bucket
            FROM sales_agg sa
            LEFT JOIN favorite_category fc
              ON fc.customer_id = sa.customer_id
             AND fc.store_code = sa.store_code
             AND fc.date_id = sa.date_id
             AND fc.rn = 1
            """
        )


def init_db():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(DDL)
            cur.execute(SEED_SQL)
        ensure_dates(conn)
        ensure_fact_sales_grain(conn)
        seed_demo_sales(conn)
        refresh_marts(conn)
        conn.commit()
