import { Store, User, Product, Supplier, Customer, Employee, Sale, Inventory } from './types'

export const stores: Store[] = [
  {
    id: 'store-1',
    name: 'Жидкое Золото - Центр',
    address: 'ул. Ленина, 42',
    phone: '+7 (495) 123-45-67',
    workingHours: '10:00 - 22:00',
    managerId: 'user-2',
    isActive: true,
  },
  {
    id: 'store-2',
    name: 'Жидкое Золото - Север',
    address: 'пр. Мира, 128',
    phone: '+7 (495) 234-56-78',
    workingHours: '10:00 - 23:00',
    managerId: 'user-3',
    isActive: true,
  },
]

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Иван Петров',
    email: 'manager1@goldenliquid.ru',
    role: 'manager',
    storeId: 'store-1',
  },
  {
    id: 'user-2',
    name: 'Мария Сидорова',
    email: 'purchaser1@goldenliquid.ru',
    role: 'purchaser',
    storeId: null,
  },
  {
    id: 'user-3',
    name: 'Алексей Козлов',
    email: 'bartender1@goldenliquid.ru',
    role: 'bartender',
    storeId: 'store-1',
  },
]

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Жигулёвское Классическое',
    category: 'light',
    manufacturer: 'Жигулёвский ПЗ',
    country: 'Россия',
    abv: 4.5,
    ibu: 18,
    description: 'Классический лагер с мягким вкусом',
    pricePerLiter: 120,
    isActive: true,
  },
  {
    id: 'prod-2',
    name: 'Балтика 7 Экспортное',
    category: 'lager',
    manufacturer: 'Балтика',
    country: 'Россия',
    abv: 5.4,
    ibu: 22,
    description: 'Премиальный лагер',
    pricePerLiter: 150,
    isActive: true,
  },
  {
    id: 'prod-3',
    name: 'Guinness Draught',
    category: 'dark',
    manufacturer: 'Diageo',
    country: 'Ирландия',
    abv: 4.2,
    ibu: 45,
    description: 'Ирландский стаут',
    pricePerLiter: 320,
    isActive: true,
  },
  {
    id: 'prod-4',
    name: 'Hoegaarden',
    category: 'wheat',
    manufacturer: 'AB InBev',
    country: 'Бельгия',
    abv: 4.9,
    ibu: 15,
    description: 'Бельгийское пшеничное пиво с нотками кориандра и апельсиновой цедры',
    pricePerLiter: 280,
    isActive: true,
  },
  {
    id: 'prod-5',
    name: 'IPA Craft',
    category: 'craft',
    manufacturer: 'AF Brew',
    country: 'Россия',
    abv: 6.8,
    ibu: 65,
    description: 'Американский IPA с ярким хмелевым ароматом',
    pricePerLiter: 450,
    isActive: true,
  },
]

export const suppliers: Supplier[] = [
  {
    id: 'supp-1',
    name: 'Пивной дистрибьютор "Баррель"',
    contactPerson: 'Виктор Борисов',
    phone: '+74951234555',
    email: 'orders@barrel.ru',
    address: 'г. Москва, ул. Пивоваров, 15',
    products: ['prod-1', 'prod-2', 'prod-4'],
    paymentTerms: 'Постоплата 14 дней',
    deliveryDays: ['monday', 'wednesday', 'friday'],
    isActive: true,
  },
  {
    id: 'supp-2',
    name: 'Импортный алкоголь "ЕвроБев"',
    contactPerson: 'Елена Кузнецова',
    phone: '+74959887766',
    email: 'sales@eurobev.ru',
    address: 'г. Москва, Ленинградское ш., 50',
    products: ['prod-3'],
    paymentTerms: 'Предоплата 100%',
    deliveryDays: ['tuesday', 'thursday'],
    isActive: true,
  },
  {
    id: 'supp-3',
    name: 'Крафтовая пивоварня AF Brew',
    contactPerson: 'Артём Фомин',
    phone: '+79167778899',
    email: 'brew@afbrew.ru',
    address: 'г. Санкт-Петербург, наб. реки Фонтанки, 100',
    products: ['prod-5'],
    paymentTerms: 'Постоплата 7 дней',
    deliveryDays: ['monday', 'thursday'],
    isActive: true,
  },
]

export const customers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Сергей Волков',
    phone: '+79031234567',
    email: 'sergey.v@example.com',
    bonusBalance: 1250,
    totalPurchases: 15400,
    purchaseCount: 12,
    registeredAt: '2024-01-15T10:30:00Z',
    lastPurchaseAt: '2025-03-28T18:45:00Z',
    favoriteStoreId: 'store-1',
  },
  {
    id: 'cust-2',
    name: 'Анна Морозова',
    phone: '+79039876543',
    email: 'anna.m@example.com',
    bonusBalance: 580,
    totalPurchases: 8200,
    purchaseCount: 8,
    registeredAt: '2024-02-20T14:15:00Z',
    lastPurchaseAt: '2025-03-30T20:10:00Z',
    favoriteStoreId: 'store-1',
  },
  {
    id: 'cust-3',
    name: 'Дмитрий Соколов',
    phone: '+79035551234',
    email: 'dmitry.s@example.com',
    bonusBalance: 0,
    totalPurchases: 1200,
    purchaseCount: 1,
    registeredAt: '2025-03-25T16:00:00Z',
    lastPurchaseAt: '2025-03-25T16:30:00Z',
    favoriteStoreId: 'store-2',
  },
]

export const employees: Employee[] = [
  {
    id: 'emp-1',
    userId: 'user-1',
    storeId: 'store-1',
    position: 'Управляющий',
    salary: 85000,
    hiredAt: '2023-06-01T00:00:00Z',
    isActive: true,
  },
  {
    id: 'emp-2',
    userId: 'user-2',
    storeId: null,
    position: 'Менеджер по закупкам',
    salary: 75000,
    hiredAt: '2023-08-15T00:00:00Z',
    isActive: true,
  },
  {
    id: 'emp-3',
    userId: 'user-3',
    storeId: 'store-1',
    position: 'Бармен-кассир',
    salary: 45000,
    hiredAt: '2024-01-10T00:00:00Z',
    isActive: true,
  },
]

// Helper to generate ISO date strings relative to now
const relativeDate = (daysAgo: number, hoursOffset: number = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(d.getHours() - hoursOffset)
  return d.toISOString()
}

export const sales: Sale[] = [
  {
    id: 'sale-1',
    storeId: 'store-1',
    sellerId: 'user-3',
    customerId: 'cust-1',
    items: [
      { productId: 'prod-1', quantity: 2, pricePerLiter: 120, total: 240 },
      { productId: 'prod-5', quantity: 0.5, pricePerLiter: 450, total: 225 },
    ],
    total: 465,
    paymentMethod: 'card',
    createdAt: relativeDate(0, 1), // Today, 1 hour ago
    bonusUsed: 100,
    bonusEarned: 37,
  },
  {
    id: 'sale-2',
    storeId: 'store-1',
    sellerId: 'user-3',
    customerId: 'cust-2',
    items: [
      { productId: 'prod-3', quantity: 1, pricePerLiter: 320, total: 320 },
    ],
    total: 320,
    paymentMethod: 'cash',
    createdAt: relativeDate(0, 2), // Today, 2 hours ago
    bonusUsed: 0,
    bonusEarned: 32,
  },
  {
    id: 'sale-3',
    storeId: 'store-1',
    sellerId: 'user-3',
    customerId: undefined,
    items: [
      { productId: 'prod-2', quantity: 1.5, pricePerLiter: 150, total: 225 },
      { productId: 'prod-4', quantity: 1, pricePerLiter: 280, total: 280 },
    ],
    total: 505,
    paymentMethod: 'card',
    createdAt: relativeDate(1, 3), // Yesterday, 3 hours ago
    bonusUsed: 0,
    bonusEarned: 0,
  },
  {
    id: 'sale-4',
    storeId: 'store-1',
    sellerId: 'user-3',
    customerId: 'cust-1',
    items: [
      { productId: 'prod-1', quantity: 3, pricePerLiter: 120, total: 360 },
    ],
    total: 360,
    paymentMethod: 'card',
    createdAt: relativeDate(2, 5), // 2 days ago
    bonusUsed: 0,
    bonusEarned: 36,
  },
  {
    id: 'sale-5',
    storeId: 'store-2',
    sellerId: 'user-1',
    customerId: undefined,
    items: [
      { productId: 'prod-1', quantity: 2, pricePerLiter: 120, total: 240 },
      { productId: 'prod-2', quantity: 2, pricePerLiter: 150, total: 300 },
    ],
    total: 540,
    paymentMethod: 'cash',
    createdAt: relativeDate(3, 1), // 3 days ago
    bonusUsed: 0,
    bonusEarned: 0,
  },
  {
    id: 'sale-6',
    storeId: 'store-1',
    sellerId: 'user-3',
    customerId: 'cust-3',
    items: [
      { productId: 'prod-5', quantity: 1, pricePerLiter: 450, total: 450 },
    ],
    total: 450,
    paymentMethod: 'card',
    createdAt: relativeDate(4, 2), // 4 days ago
    bonusUsed: 0,
    bonusEarned: 45,
  },
  {
    id: 'sale-7',
    storeId: 'store-2',
    sellerId: 'user-1',
    customerId: 'cust-2',
    items: [
      { productId: 'prod-4', quantity: 2, pricePerLiter: 280, total: 560 },
    ],
    total: 560,
    paymentMethod: 'card',
    createdAt: relativeDate(5, 4), // 5 days ago
    bonusUsed: 0,
    bonusEarned: 56,
  },
  {
    id: 'sale-8',
    storeId: 'store-1',
    sellerId: 'user-3',
    customerId: undefined,
    items: [
      { productId: 'prod-1', quantity: 5, pricePerLiter: 120, total: 600 },
    ],
    total: 600,
    paymentMethod: 'cash',
    createdAt: relativeDate(6, 6), // 6 days ago
    bonusUsed: 0,
    bonusEarned: 0,
  },
]


export const inventory: Inventory[] = [
  {
    id: 'inv-1',
    productId: 'prod-1',
    storeId: 'store-1',
    quantity: 150,
    minQuantity: 50,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    id: 'inv-2',
    productId: 'prod-2',
    storeId: 'store-1',
    quantity: 80,
    minQuantity: 40,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    id: 'inv-3',
    productId: 'prod-3',
    storeId: 'store-1',
    quantity: 25,
    minQuantity: 30,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    id: 'inv-4',
    productId: 'prod-4',
    storeId: 'store-1',
    quantity: 60,
    minQuantity: 25,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    id: 'inv-5',
    productId: 'prod-5',
    storeId: 'store-1',
    quantity: 40,
    minQuantity: 20,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    id: 'inv-6',
    productId: 'prod-1',
    storeId: 'store-2',
    quantity: 200,
    minQuantity: 50,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    id: 'inv-7',
    productId: 'prod-2',
    storeId: 'store-2',
    quantity: 45,
    minQuantity: 40,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
]

export function getProductById(id: string) {
  return products.find((p) => p.id === id)
}

export function getUserById(id: string) {
  return users.find((u) => u.id === id)
}

export function getCustomerById(id: string) {
  return customers.find((c) => c.id === id)
}

export function getStoreById(id: string) {
  return stores.find((s) => s.id === id)
}

export function getRecentSales(limit = 10, storeId?: string) {
  return sales
    .filter((s) => !storeId || s.storeId === storeId)
    .slice(0, limit)
}

export function getTopProducts(days = 7, storeId?: string, limit = 5) {
  return []
}

export function getTodayStats(storeId?: string) {
  // Calculate from actual sales data
  const todaySales = sales.filter(s => {
    const saleDate = new Date(s.createdAt).toDateString()
    const today = new Date().toDateString()
    return saleDate === today && (!storeId || s.storeId === storeId)
  })

  const revenue = todaySales.reduce((sum, s) => sum + s.total, 0)
  const salesCount = todaySales.length
  const averageCheck = salesCount > 0 ? Math.round(revenue / salesCount) : 0

  return {
    revenue,
    salesCount,
    averageCheck,
    activeCustomers: customers.length,
  }
}

export function getWeekStats(storeId?: string) {
  // Calculate from actual sales data (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const weekSales = sales.filter(s => {
    const saleDate = new Date(s.createdAt)
    return saleDate >= weekAgo && (!storeId || s.storeId === storeId)
  })

  const revenue = weekSales.reduce((sum, s) => sum + s.total, 0)
  const salesCount = weekSales.length
  const averageCheck = salesCount > 0 ? Math.round(revenue / salesCount) : 0

  return {
    revenue,
    salesCount,
    averageCheck,
  }
}

export function getLowStockItems(storeId?: string) {
  return inventory
    .filter((i) => i.quantity <= i.minQuantity)
    .filter((i) => !storeId || i.storeId === storeId)
}
