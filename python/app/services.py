from __future__ import annotations

from datetime import date, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from psycopg2.extras import RealDictCursor

from app.db import get_conn
from app.init_db import refresh_marts
from app.schemas import SaleCreate


TWOPLACES = Decimal('0.01')


def _q(value: Decimal) -> Decimal:
    return value.quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def list_stores():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute('SELECT id, name, address, phone, working_hours, manager_id, is_active FROM stores ORDER BY name')
        rows = cur.fetchall()
        return [
            {
                'id': r['id'], 'name': r['name'], 'address': r['address'], 'phone': r['phone'],
                'workingHours': r['working_hours'], 'managerId': r['manager_id'], 'isActive': r['is_active']
            }
            for r in rows
        ]


def list_products():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute('SELECT id, name, category, manufacturer, country, abv, ibu, description, price_per_liter, is_active FROM products WHERE is_active = TRUE ORDER BY name')
        rows = cur.fetchall()
        return [
            {
                'id': r['id'], 'name': r['name'], 'category': r['category'], 'manufacturer': r['manufacturer'],
                'country': r['country'], 'abv': float(r['abv']) if r['abv'] is not None else None,
                'ibu': r['ibu'], 'description': r['description'], 'pricePerLiter': float(r['price_per_liter']),
                'isActive': r['is_active']
            }
            for r in rows
        ]


def list_inventory(store_id: str):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            '''
            SELECT ib.balance_id, ib.product_code, ib.store_code, ib.qty_on_hand, ib.min_qty, ib.updated_at,
                   p.id AS p_id, p.name AS p_name, p.category, p.manufacturer, p.country, p.abv, p.ibu, p.description, p.price_per_liter, p.is_active,
                   s.id AS s_id, s.name AS s_name, s.address, s.phone, s.working_hours, s.manager_id, s.is_active AS s_active
            FROM inventory_balances ib
            JOIN products p ON p.id = ib.product_code
            JOIN stores s ON s.id = ib.store_code
            WHERE ib.store_code = %s
            ORDER BY p.name
            ''',
            (store_id,),
        )
        rows = cur.fetchall()
        data = []
        for r in rows:
            data.append({
                'id': str(r['balance_id']),
                'productId': r['product_code'],
                'storeId': r['store_code'],
                'quantity': float(r['qty_on_hand']),
                'minQuantity': float(r['min_qty']),
                'lastUpdated': r['updated_at'].isoformat(),
                'product': {
                    'id': r['p_id'], 'name': r['p_name'], 'category': r['category'], 'manufacturer': r['manufacturer'],
                    'country': r['country'], 'abv': float(r['abv']) if r['abv'] is not None else None, 'ibu': r['ibu'],
                    'description': r['description'], 'pricePerLiter': float(r['price_per_liter']), 'isActive': r['is_active']
                },
                'store': {
                    'id': r['s_id'], 'name': r['s_name'], 'address': r['address'], 'phone': r['phone'],
                    'workingHours': r['working_hours'], 'managerId': r['manager_id'], 'isActive': r['s_active']
                }
            })
        return data


def _find_or_create_customer(cur, payload: SaleCreate):
    if payload.customerId:
        cur.execute('SELECT customer_id FROM customers WHERE customer_id = %s', (payload.customerId,))
        row = cur.fetchone()
        return row['customer_id'] if row else None
    if payload.customerPhone:
        cur.execute('SELECT customer_id FROM customers WHERE phone = %s', (payload.customerPhone,))
        row = cur.fetchone()
        if row:
            if payload.customerName:
                cur.execute('UPDATE customers SET full_name = COALESCE(full_name, %s), is_loyalty_member = TRUE WHERE customer_id = %s', (payload.customerName, row['customer_id']))
            return row['customer_id']
        cur.execute(
            'INSERT INTO customers(phone, full_name, is_loyalty_member) VALUES (%s,%s,%s) RETURNING customer_id',
            (payload.customerPhone, payload.customerName or 'Гость', True),
        )
        return cur.fetchone()['customer_id']
    return None


def _get_open_shift(cur, store_id: str, seller_code: str):
    cur.execute(
        '''
        SELECT sh.shift_id, sh.terminal_id, e.employee_id
        FROM employees e
        LEFT JOIN shifts sh ON sh.employee_id = e.employee_id AND sh.store_code = e.store_code AND sh.status = 'open'
        WHERE e.user_code = %s AND e.store_code = %s
        ORDER BY sh.opened_at DESC NULLS LAST
        LIMIT 1
        ''',
        (seller_code, store_id),
    )
    row = cur.fetchone()
    if not row:
        cur.execute(
            'INSERT INTO employees(user_code, store_code, full_name, role_code) VALUES (%s,%s,%s,%s) RETURNING employee_id',
            (seller_code, store_id, 'Авто-кассир', 'bartender')
        )
        employee_id = cur.fetchone()['employee_id']
        cur.execute('SELECT terminal_id FROM terminals WHERE store_code = %s ORDER BY terminal_id LIMIT 1', (store_id,))
        terminal_id = cur.fetchone()['terminal_id']
        cur.execute(
            'INSERT INTO shifts(store_code, employee_id, terminal_id, opened_at, status, opening_cash) VALUES (%s,%s,%s,NOW(),%s,%s) RETURNING shift_id',
            (store_id, employee_id, terminal_id, 'open', 5000),
        )
        return {'shift_id': cur.fetchone()['shift_id'], 'terminal_id': terminal_id, 'employee_id': employee_id}
    if row['shift_id']:
        return row
    cur.execute('SELECT terminal_id FROM terminals WHERE store_code = %s ORDER BY terminal_id LIMIT 1', (store_id,))
    terminal_id = cur.fetchone()['terminal_id']
    cur.execute(
        'INSERT INTO shifts(store_code, employee_id, terminal_id, opened_at, status, opening_cash) VALUES (%s,%s,%s,NOW(),%s,%s) RETURNING shift_id',
        (store_id, row['employee_id'], terminal_id, 'open', 5000),
    )
    return {'shift_id': cur.fetchone()['shift_id'], 'terminal_id': terminal_id, 'employee_id': row['employee_id']}


def create_sale(payload: SaleCreate):
    with get_conn() as conn:
        with conn.cursor() as cur:
            shift_info = _get_open_shift(cur, payload.storeId, payload.sellerId)
            customer_id = _find_or_create_customer(cur, payload)
            gross = Decimal('0')
            lines = []
            for item in payload.items:
                cur.execute(
                    '''
                    SELECT p.id, p.price_per_liter, ib.qty_on_hand
                    FROM products p
                    JOIN inventory_balances ib ON ib.product_code = p.id AND ib.store_code = %s
                    WHERE p.id = %s
                    ''',
                    (payload.storeId, item.productId),
                )
                row = cur.fetchone()
                if not row:
                    raise ValueError(f'Товар {item.productId} не найден в остатках магазина')
                if Decimal(str(row['qty_on_hand'])) < item.quantity:
                    raise ValueError(f'Недостаточно остатка по товару {item.productId}')
                unit_price = Decimal(str(row['price_per_liter']))
                line_total = _q(unit_price * item.quantity)
                gross += line_total
                lines.append((item.productId, item.quantity, unit_price, line_total))

            bonus_to_use = min(Decimal(payload.bonusToUse or 0), gross)
            if customer_id and bonus_to_use > 0:
                cur.execute('SELECT bonus_balance FROM customers WHERE customer_id = %s', (customer_id,))
                balance = Decimal(str(cur.fetchone()['bonus_balance']))
                if balance < bonus_to_use:
                    raise ValueError('Недостаточно бонусов у клиента')
            net = _q(gross - bonus_to_use)
            bonus_earned = Decimal('0') if not customer_id else _q(net * Decimal('0.03'))
            sale_code = f'sale-{int(datetime.utcnow().timestamp())}'
            cur.execute(
                '''
                INSERT INTO sales(sale_code, store_code, shift_id, terminal_id, cashier_id, customer_id, gross_amount, discount_amount, net_amount, item_count, bonus_used, bonus_earned)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING sale_id, sale_at
                ''',
                (
                    sale_code, payload.storeId, shift_info['shift_id'], shift_info['terminal_id'], shift_info['employee_id'], customer_id,
                    gross, bonus_to_use, net, len(lines), bonus_to_use, bonus_earned,
                ),
            )
            sale = cur.fetchone()
            sale_id = sale['sale_id']
            for product_id, qty, unit_price, line_total in lines:
                cur.execute(
                    'INSERT INTO sale_items(sale_id, product_code, qty, unit_price, discount_amount, line_amount) VALUES (%s,%s,%s,%s,0,%s)',
                    (sale_id, product_id, qty, unit_price, line_total),
                )
                cur.execute(
                    'UPDATE inventory_balances SET qty_on_hand = qty_on_hand - %s, updated_at = NOW() WHERE store_code = %s AND product_code = %s',
                    (qty, payload.storeId, product_id),
                )
                cur.execute(
                    'INSERT INTO inventory_movements(store_code, product_code, movement_type, qty, reference_id, reference_type) VALUES (%s,%s,%s,%s,%s,%s)',
                    (payload.storeId, product_id, 'sale', -qty, sale_id, 'sale'),
                )
            cur.execute(
                'INSERT INTO payments(sale_id, payment_method, amount, bank_rrn, bank_auth_code, status) VALUES (%s,%s,%s,%s,%s,%s)',
                (sale_id, payload.paymentMethod, net, f'RRN-{sale_id}' if payload.paymentMethod == 'card' else None, f'AUTH-{sale_id}' if payload.paymentMethod == 'card' else None, 'paid'),
            )
            cur.execute(
                'INSERT INTO fiscal_documents(sale_id, terminal_id, document_type, ofd_status, fiscal_number) VALUES (%s,%s,%s,%s,%s)',
                (sale_id, shift_info['terminal_id'], 'receipt', 'sent', f'FD-{sale_id}'),
            )
            cur.execute(
                'INSERT INTO external_sync_logs(sale_id, system_code, operation_type, status, external_id) VALUES (%s,%s,%s,%s,%s),(%s,%s,%s,%s,%s)',
                (sale_id, 'ofd', 'sale_sync', 'success', f'ofd-{sale_id}', sale_id, 'egais', 'sale_sync', 'success', f'egais-{sale_id}'),
            )
            if customer_id:
                if bonus_to_use > 0:
                    cur.execute('UPDATE customers SET bonus_balance = bonus_balance - %s WHERE customer_id = %s', (bonus_to_use, customer_id))
                    cur.execute('INSERT INTO loyalty_transactions(customer_id, sale_id, txn_type, points) VALUES (%s,%s,%s,%s)', (customer_id, sale_id, 'redeem', -bonus_to_use))
                if bonus_earned > 0:
                    cur.execute('UPDATE customers SET bonus_balance = bonus_balance + %s WHERE customer_id = %s', (bonus_earned, customer_id))
                    cur.execute('INSERT INTO loyalty_transactions(customer_id, sale_id, txn_type, points) VALUES (%s,%s,%s,%s)', (customer_id, sale_id, 'earn', bonus_earned))
            refresh_marts(conn)
            conn.commit()
    return get_sale_by_id(f'sale-{sale_id}')


def get_sale_by_id(sale_code: str):
    with get_conn() as conn, conn.cursor() as cur:
        code = sale_code
        if sale_code.startswith('sale-') and sale_code[5:].isdigit():
            pass
        cur.execute(
            '''
            SELECT s.sale_id, s.sale_code, s.store_code, e.user_code AS seller_id, c.customer_id, c.full_name AS customer_name,
                   s.sale_at, s.net_amount, s.bonus_used, s.bonus_earned, p.payment_method
            FROM sales s
            LEFT JOIN employees e ON e.employee_id = s.cashier_id
            LEFT JOIN customers c ON c.customer_id = s.customer_id
            LEFT JOIN payments p ON p.sale_id = s.sale_id
            WHERE s.sale_code = %s OR s.sale_id::text = %s
            LIMIT 1
            ''',
            (code, sale_code.replace('sale-', '') if sale_code.startswith('sale-') else sale_code),
        )
        sale = cur.fetchone()
        if not sale:
            return None
        cur.execute('SELECT product_code, qty, unit_price, line_amount FROM sale_items WHERE sale_id = %s ORDER BY sale_item_id', (sale['sale_id'],))
        items = cur.fetchall()
        return {
            'id': f"sale-{sale['sale_id']}", 'storeId': sale['store_code'], 'sellerId': sale['seller_id'],
            'customerId': str(sale['customer_id']) if sale['customer_id'] else None,
            'customerName': sale['customer_name'],
            'items': [
                {'productId': i['product_code'], 'quantity': float(i['qty']), 'pricePerLiter': float(i['unit_price']), 'total': float(i['line_amount'])}
                for i in items
            ],
            'total': float(sale['net_amount']), 'paymentMethod': sale['payment_method'] or 'cash', 'createdAt': sale['sale_at'].isoformat(),
            'bonusUsed': float(sale['bonus_used']), 'bonusEarned': float(sale['bonus_earned'])
        }


def list_sales(store_id: Optional[str] = None, start_date: Optional[str] = None, end_date: Optional[str] = None):
    where = ['1=1']
    params = []
    if store_id:
        where.append('s.store_code = %s')
        params.append(store_id)
    if start_date:
        where.append('s.sale_at::date >= %s')
        params.append(start_date)
    if end_date:
        where.append('s.sale_at::date <= %s')
        params.append(end_date)
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(
            f'''
            SELECT s.sale_id, s.store_code, s.sale_at, s.net_amount, s.bonus_used, s.bonus_earned,
                   e.user_code AS seller_id, e.full_name AS seller_name, c.customer_id, c.full_name AS customer_name, p.payment_method
            FROM sales s
            LEFT JOIN employees e ON e.employee_id = s.cashier_id
            LEFT JOIN customers c ON c.customer_id = s.customer_id
            LEFT JOIN payments p ON p.sale_id = s.sale_id
            WHERE {' AND '.join(where)}
            ORDER BY s.sale_at DESC
            ''',
            params,
        )
        sales = cur.fetchall()
        result = []
        for sale in sales:
            cur.execute('SELECT product_code, qty, unit_price, line_amount FROM sale_items WHERE sale_id = %s ORDER BY sale_item_id', (sale['sale_id'],))
            items = cur.fetchall()
            result.append({
                'id': f"sale-{sale['sale_id']}", 'storeId': sale['store_code'], 'sellerId': sale['seller_id'],
                'customerId': str(sale['customer_id']) if sale['customer_id'] else None,
                'customerName': sale['customer_name'] or 'Гость', 'sellerName': sale['seller_name'],
                'items': [
                    {'productId': i['product_code'], 'quantity': float(i['qty']), 'pricePerLiter': float(i['unit_price']), 'total': float(i['line_amount'])}
                    for i in items
                ],
                'total': float(sale['net_amount']), 'paymentMethod': sale['payment_method'] or 'cash', 'createdAt': sale['sale_at'].isoformat(),
                'bonusUsed': float(sale['bonus_used']), 'bonusEarned': float(sale['bonus_earned'])
            })
        return result


def dashboard(store_id: Optional[str] = None):
    with get_conn() as conn, conn.cursor() as cur:
        store_clause = 'AND fs.store_id = %s' if store_id else ''
        params = [store_id] if store_id else []
        cur.execute(
            f'''
            SELECT COALESCE(SUM(net_amount),0) AS revenue, COALESCE(SUM(receipt_count),0) AS sales_count,
                   COALESCE(ROUND(SUM(net_amount) / NULLIF(SUM(receipt_count),0),2),0) AS average_check,
                   COUNT(DISTINCT customer_id) AS active_customers
            FROM fact_sales fs
            JOIN dim_date dd ON dd.date_id = fs.date_id
            WHERE dd.full_date = CURRENT_DATE {store_clause}
            ''', params
        )
        today = cur.fetchone()
        cur.execute(
            f'''
            SELECT COALESCE(SUM(net_amount),0) AS revenue, COALESCE(SUM(receipt_count),0) AS sales_count,
                   COALESCE(ROUND(SUM(net_amount) / NULLIF(SUM(receipt_count),0),2),0) AS average_check
            FROM fact_sales fs
            JOIN dim_date dd ON dd.date_id = fs.date_id
            WHERE dd.full_date >= CURRENT_DATE - INTERVAL '6 days' {store_clause}
            ''', params
        )
        week = cur.fetchone()
        cur.execute(
            'SELECT COUNT(*) AS cnt FROM inventory_balances WHERE qty_on_hand <= min_qty' + (' AND store_code = %s' if store_id else ''),
            ([store_id] if store_id else None) or [],
        )
        low = cur.fetchone()['cnt']
        cur.execute(
            f'''
            SELECT TO_CHAR(dd.full_date, 'DD.MM') AS name, COALESCE(SUM(fs.net_amount),0) AS revenue
            FROM dim_date dd
            LEFT JOIN fact_sales fs ON fs.date_id = dd.date_id {'AND fs.store_id = %s' if store_id else ''}
            WHERE dd.full_date BETWEEN CURRENT_DATE - INTERVAL '6 days' AND CURRENT_DATE
            GROUP BY dd.full_date
            ORDER BY dd.full_date
            ''', params
        )
        chart = [{'name': r['name'], 'revenue': float(r['revenue'])} for r in cur.fetchall()]
        return {
            'todayStats': {
                'revenue': float(today['revenue']), 'salesCount': int(today['sales_count']),
                'averageCheck': float(today['average_check']), 'activeCustomers': int(today['active_customers'])
            },
            'weekStats': {
                'revenue': float(week['revenue']), 'salesCount': int(week['sales_count']), 'averageCheck': float(week['average_check'])
            },
            'lowStockCount': int(low),
            'chartData': chart,
        }


def daily_stats(store_id: Optional[str] = None):
    with get_conn() as conn, conn.cursor() as cur:
        params = []
        where = ''
        if store_id:
            where = 'AND fs.store_id = %s'
            params.append(store_id)
        cur.execute(
            f'''
            SELECT dd.full_date AS date,
                   COALESCE(MAX(fs.store_id), %s) AS store_id,
                   COALESCE(SUM(fs.net_amount),0) AS revenue,
                   COALESCE(SUM(fs.receipt_count),0) AS sales_count,
                   COALESCE(ROUND(SUM(fs.net_amount) / NULLIF(SUM(fs.receipt_count),0),2),0) AS average_check,
                   COUNT(DISTINCT fs.customer_id) FILTER (WHERE dc.is_loyalty_member IS TRUE) AS new_customers
            FROM dim_date dd
            LEFT JOIN fact_sales fs ON fs.date_id = dd.date_id {where}
            LEFT JOIN dim_customer dc ON dc.customer_id = fs.customer_id
            WHERE dd.full_date BETWEEN CURRENT_DATE - INTERVAL '13 days' AND CURRENT_DATE
            GROUP BY dd.full_date
            ORDER BY dd.full_date
            ''',
            [store_id or 'all', *params],
        )
        stats = []
        for row in cur.fetchall():
            cur.execute(
                f'''
                SELECT fs.product_id, SUM(fs.qty_sold) AS quantity
                FROM fact_sales fs
                WHERE fs.date_id = %s {'AND fs.store_id = %s' if store_id else ''}
                GROUP BY fs.product_id
                ORDER BY quantity DESC
                LIMIT 3
                ''',
                ([int(row['date'].strftime('%Y%m%d'))] + ([store_id] if store_id else [])),
            )
            top_products = [{'productId': p['product_id'], 'quantity': float(p['quantity'])} for p in cur.fetchall()]
            stats.append({
                'date': row['date'].isoformat(), 'storeId': row['store_id'], 'revenue': float(row['revenue']),
                'salesCount': int(row['sales_count']), 'averageCheck': float(row['average_check']), 'newCustomers': int(row['new_customers']),
                'topProducts': top_products,
            })
        return stats


def management_report(start_date: Optional[str], end_date: Optional[str], store_id: Optional[str] = None):
    if not start_date:
        start_date = (date.today() - timedelta(days=29)).isoformat()
    if not end_date:
        end_date = date.today().isoformat()
    with get_conn() as conn, conn.cursor() as cur:
        params = [start_date, end_date]
        store_sql = ''
        if store_id:
            store_sql = 'AND fs.store_id = %s'
            params.append(store_id)
        cur.execute(
            f'''
            SELECT COALESCE(SUM(fs.net_amount),0) AS revenue,
                   COALESCE(SUM(fs.receipt_count),0) AS receipts,
                   COALESCE(ROUND(SUM(fs.net_amount)/NULLIF(SUM(fs.receipt_count),0),2),0) AS avg_check,
                   COALESCE(SUM(fs.qty_sold),0) AS liters,
                   COUNT(DISTINCT fs.customer_id) AS customers
            FROM fact_sales fs
            JOIN dim_date dd ON dd.date_id = fs.date_id
            WHERE dd.full_date BETWEEN %s AND %s {store_sql}
            ''', params
        )
        summary = cur.fetchone()
        cur.execute(
            f'''
            SELECT dd.full_date, COALESCE(SUM(fs.net_amount),0) AS revenue, COALESCE(SUM(fs.receipt_count),0) AS receipts
            FROM dim_date dd
            LEFT JOIN fact_sales fs ON fs.date_id = dd.date_id {'AND fs.store_id = %s' if store_id else ''}
            WHERE dd.full_date BETWEEN %s AND %s
            GROUP BY dd.full_date
            ORDER BY dd.full_date
            ''',
            ([store_id] if store_id else []) + [start_date, end_date],
        )
        revenue_by_day = [{'date': r['full_date'].isoformat(), 'revenue': float(r['revenue']), 'receipts': int(r['receipts'])} for r in cur.fetchall()]
        cur.execute(
            f'''
            SELECT dp.product_id, dp.product_name, dp.category_name, SUM(fs.qty_sold) AS qty_sold, SUM(fs.net_amount) AS revenue
            FROM fact_sales fs
            JOIN dim_date dd ON dd.date_id = fs.date_id
            JOIN dim_product dp ON dp.product_id = fs.product_id
            WHERE dd.full_date BETWEEN %s AND %s {store_sql}
            GROUP BY dp.product_id, dp.product_name, dp.category_name
            ORDER BY revenue DESC
            LIMIT 5
            ''', params
        )
        top_products = [{'productId': r['product_id'], 'productName': r['product_name'], 'categoryName': r['category_name'], 'qtySold': float(r['qty_sold']), 'revenue': float(r['revenue'])} for r in cur.fetchall()]
        cur.execute(
            f'''
            SELECT de.employee_id, de.full_name, de.role_code, SUM(fsp.revenue_amount) AS revenue_amount, SUM(fsp.receipt_count) AS receipt_count,
                   SUM(fsp.items_sold) AS items_sold, ROUND(AVG(fsp.worked_hours),2) AS worked_hours
            FROM fact_shift_performance fsp
            JOIN dim_date dd ON dd.date_id = fsp.date_id
            JOIN dim_employee de ON de.employee_id = fsp.employee_id
            WHERE dd.full_date BETWEEN %s AND %s {'AND fsp.store_id = %s' if store_id else ''}
            GROUP BY de.employee_id, de.full_name, de.role_code
            ORDER BY revenue_amount DESC
            ''', params
        )
        staff = [{'employeeId': r['employee_id'], 'fullName': r['full_name'], 'roleCode': r['role_code'], 'revenueAmount': float(r['revenue_amount'] or 0), 'receiptCount': int(r['receipt_count'] or 0), 'itemsSold': int(r['items_sold'] or 0), 'workedHours': float(r['worked_hours'] or 0)} for r in cur.fetchall()]
        cur.execute(
            f'''
            SELECT dpm.payment_method_name, SUM(fs.net_amount) AS revenue, SUM(fs.receipt_count) AS receipts
            FROM fact_sales fs
            JOIN dim_date dd ON dd.date_id = fs.date_id
            JOIN dim_payment_method dpm ON dpm.payment_method_id = fs.payment_method_id
            WHERE dd.full_date BETWEEN %s AND %s {store_sql}
            GROUP BY dpm.payment_method_name
            ORDER BY revenue DESC
            ''', params
        )
        payments = [{'paymentMethod': r['payment_method_name'], 'revenue': float(r['revenue']), 'receipts': int(r['receipts'])} for r in cur.fetchall()]
        cur.execute(
            f'''
            SELECT COUNT(DISTINCT fca.customer_id) AS active_customers,
                   COALESCE(SUM(fca.revenue_amount),0) AS revenue_amount,
                   MAX(fca.favorite_product_group) AS favorite_product_group,
                   ROUND(AVG(fca.visit_hour_bucket),0) AS avg_visit_hour
            FROM fact_customer_activity fca
            JOIN dim_date dd ON dd.date_id = fca.date_id
            WHERE dd.full_date BETWEEN %s AND %s {'AND fca.store_id = %s' if store_id else ''}
            ''', params
        )
        cust = cur.fetchone()
        return {
            'period': {'startDate': start_date, 'endDate': end_date, 'storeId': store_id},
            'summary': {
                'revenue': float(summary['revenue']), 'receipts': int(summary['receipts']), 'averageCheck': float(summary['avg_check']),
                'litersSold': float(summary['liters']), 'activeCustomers': int(summary['customers'])
            },
            'revenueByDay': revenue_by_day,
            'topProducts': top_products,
            'staffPerformance': staff,
            'salesByPaymentMethod': payments,
            'customers': {
                'activeCustomers': int(cust['active_customers'] or 0), 'revenueAmount': float(cust['revenue_amount'] or 0),
                'favoriteProductGroup': cust['favorite_product_group'] or 'n/a', 'avgVisitHour': int(cust['avg_visit_hour'] or 0)
            }
        }
