# Документация API CRM "Жидкое Золото"

Базовый URL: `http://localhost:8080/api/v1`

## 1. Продажи и Касса
### Оформление продажи
`POST /sales`
- **Body**: `SaleItem[]`
- **Response**: `Sale` object

### Возврат чека
`POST /sales/{id}/refund`
- **Body**: `{ reason: string }`
- **Response**: `Sale` object (status updated)

---

## 2. Инвентаризация и Склад
### Постановка кеги на кран
`POST /inventory/kegs/tap`
- **Body**: `{ storeId: string, productId: string }`
- **Response**: `KegTapAction`

### Техническое списание
`POST /inventory/write-off`
- **Body**: `{ storeId: string, productId: string, quantity: number, reason: 'sour'|'foam'|'cleaning' }`
- **Response**: `WriteOff`

### Проведение инвентаризации
`POST /inventory/audit`
- **Body**: `{ storeId: string, items: { productId: string, actualQuantity: number }[] }`

### Учет возвратной тары
`POST /inventory/return-containers`
- **Body**: `{ storeId: string, kegsCount: number }`

---

## 3. Смены
### Открытие смены
`POST /shifts/open`
- **Body**: `{ storeId: string, userId: string, startBalance: number }`
- **Response**: `Shift`

### Закрытие смены
`POST /shifts/{id}/close`
- **Body**: `{ endBalance: number }`
- **Response**: `Shift`

---

## 4. Лояльность
### Проверка клиента
`GET /loyalty/customer?phone={phone}`
- **Response**: `Customer`

### Применение бонусов
`POST /loyalty/apply`
- **Body**: `{ customerId: string, amount: number }`

---

## 5. Техническое обслуживание
### Маршрутный лист
`GET /maintenance/tasks?technicianId={id}`
- **Response**: `MaintenanceTask[]`

### Завершение задачи
`POST /maintenance/tasks/{id}/complete`
- **Body**: `{ partsUsed: string[], notes: string }`

### Заявка на ремонт
`POST /maintenance/repair-request`
- **Body**: `MaintenanceTask` (initial data)

---

## 6. Закупки
### Новый заказ поставщику
`POST /purchasing/orders`
- **Body**: `SupplyOrder` (items, supplierId, storeId)

### Приемка товара
`POST /purchasing/orders/{id}/receive`

---

## 7. Аналитика (Владелец)
### Дашборд KPI
`GET /reports/dashboard?storeId={id}`
- **Response**: `{ revenue: number, salesCount: number, avgCheck: number }`

### Финансовый отчет
`GET /reports/financials?startDate={iso}&endDate={iso}`
- **Response**: `P&L data`

### Эффективность персонала
`GET /reports/staff-performance?storeId={id}`
