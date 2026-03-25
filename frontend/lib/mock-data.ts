import type {
  Store,
  Product,
  Customer,
  Supplier,
  Sale,
  Employee,
  User,
  Inventory,
  DailyStat,
} from './types'


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
  {
    id: 'store-3',
    name: 'Жидкое Золото - Юг',
    address: 'ул. Южная, 15',
    phone: '+7 (495) 345-67-89',
    workingHours: '11:00 - 22:00',
    managerId: 'user-4',
    isActive: true,
  },
]


export const users: User[] = [
  {
    id: 'user-1',
    name: 'Иван Петров',
    email: 'admin@pivnoy-prichal.ru',
    role: 'admin',
    storeId: null,
  },
  {
    id: 'user-2',
    name: 'Мария Сидорова',
    email: 'center@pivnoy-prichal.ru',
    role: 'manager',
    storeId: 'store-1',
  },
  {
    id: 'user-3',
    name: 'Алексей Козлов',
    email: 'north@pivnoy-prichal.ru',
    role: 'manager',
    storeId: 'store-2',
  },
  {
    id: 'user-4',
    name: 'Елена Новикова',
    email: 'south@pivnoy-prichal.ru',
    role: 'manager',
    storeId: 'store-3',
  },
  {
    id: 'user-5',
    name: 'Дмитрий Волков',
    email: 'seller1@pivnoy-prichal.ru',
    role: 'seller',
    storeId: 'store-1',
  },
  {
    id: 'user-6',
    name: 'Анна Морозова',
    email: 'seller2@pivnoy-prichal.ru',
    role: 'seller',
    storeId: 'store-1',
  },
  {
    id: 'user-7',
    name: 'Сергей Белов',
    email: 'seller3@pivnoy-prichal.ru',
    role: 'seller',
    storeId: 'store-2',
  },
  {
    id: 'user-8',
    name: 'Ольга Кузнецова',
    email: 'seller4@pivnoy-prichal.ru',
    role: 'seller',
    storeId: 'store-2',
  },
  {
    id: 'user-9',
    name: 'Николай Смирнов',
    email: 'seller5@pivnoy-prichal.ru',
    role: 'seller',
    storeId: 'store-3',
  },
  {
    id: 'user-10',
    name: 'Татьяна Попова',
    email: 'seller6@pivnoy-prichal.ru',
    role: 'seller',
    storeId: 'store-3',
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
    description: 'Премиальный лагер европейского качества',
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
    description: 'Легендарный ирландский стаут с кремовой пеной',
    pricePerLiter: 320,
    isActive: true,
  },
  {
    id: 'prod-4',
    name: 'Paulaner Weissbier',
    category: 'wheat',
    manufacturer: 'Paulaner',
    country: 'Германия',
    abv: 5.5,
    ibu: 12,
    description: 'Баварское пшеничное пиво с нотами банана и гвоздики',
    pricePerLiter: 280,
    isActive: true,
  },
  {
    id: 'prod-5',
    name: 'Hoegaarden Wit',
    category: 'wheat',
    manufacturer: 'AB InBev',
    country: 'Бельгия',
    abv: 4.9,
    ibu: 15,
    description: 'Бельгийское белое пиво с кориандром и апельсиновой цедрой',
    pricePerLiter: 260,
    isActive: true,
  },
  {
    id: 'prod-6',
    name: 'Brew Dog Punk IPA',
    category: 'craft',
    manufacturer: 'BrewDog',
    country: 'Шотландия',
    abv: 5.4,
    ibu: 35,
    description: 'Крафтовый IPA с тропическими и цитрусовыми нотами',
    pricePerLiter: 350,
    isActive: true,
  },
  {
    id: 'prod-7',
    name: 'Velkopopovický Kozel Тёмный',
    category: 'dark',
    manufacturer: 'Velkopopovický Kozel',
    country: 'Чехия',
    abv: 3.8,
    ibu: 20,
    description: 'Чешский тёмный лагер с карамельными нотами',
    pricePerLiter: 180,
    isActive: true,
  },
  {
    id: 'prod-8',
    name: 'Сидр Яблочный Медовый',
    category: 'cider',
    manufacturer: 'Сидрерия №1',
    country: 'Россия',
    abv: 5.0,
    description: 'Натуральный яблочный сидр с медовыми нотами',
    pricePerLiter: 200,
    isActive: true,
  },
  {
    id: 'prod-9',
    name: 'Krušovice Imperial',
    category: 'lager',
    manufacturer: 'Krušovice',
    country: 'Чехия',
    abv: 5.0,
    ibu: 24,
    description: 'Чешский премиальный лагер',
    pricePerLiter: 220,
    isActive: true,
  },
  {
    id: 'prod-10',
    name: 'Leffe Blonde',
    category: 'ale',
    manufacturer: 'Abbaye de Leffe',
    country: 'Бельгия',
    abv: 6.6,
    ibu: 25,
    description: 'Бельгийский аббатский эль с фруктовыми нотами',
    pricePerLiter: 300,
    isActive: true,
  },
  {
    id: 'prod-11',
    name: 'Erdinger Weissbier',
    category: 'wheat',
    manufacturer: 'Erdinger',
    country: 'Германия',
    abv: 5.3,
    ibu: 13,
    description: 'Классическое баварское пшеничное',
    pricePerLiter: 270,
    isActive: true,
  },
  {
    id: 'prod-12',
    name: 'Московское Живое',
    category: 'light',
    manufacturer: 'МПК',
    country: 'Россия',
    abv: 4.3,
    ibu: 15,
    description: 'Непастеризованное светлое пиво',
    pricePerLiter: 140,
    isActive: true,
  },
  {
    id: 'prod-13',
    name: 'Zatecky Gus',
    category: 'lager',
    manufacturer: 'Zatec',
    country: 'Чехия',
    abv: 4.6,
    ibu: 28,
    description: 'Жатецкий светлый лагер с хмелевым характером',
    pricePerLiter: 160,
    isActive: true,
  },
  {
    id: 'prod-14',
    name: 'Stella Artois',
    category: 'import',
    manufacturer: 'AB InBev',
    country: 'Бельгия',
    abv: 5.0,
    ibu: 24,
    description: 'Премиальный бельгийский лагер',
    pricePerLiter: 240,
    isActive: true,
  },
  {
    id: 'prod-15',
    name: 'Сидр Грушевый',
    category: 'cider',
    manufacturer: 'Сидрерия №1',
    country: 'Россия',
    abv: 4.5,
    description: 'Освежающий грушевый сидр',
    pricePerLiter: 190,
    isActive: true,
  },
  {
    id: 'prod-16',
    name: 'Stone IPA',
    category: 'craft',
    manufacturer: 'Stone Brewing',
    country: 'США',
    abv: 6.9,
    ibu: 71,
    description: 'Интенсивный американский IPA',
    pricePerLiter: 400,
    isActive: true,
  },
  {
    id: 'prod-17',
    name: 'Krombacher Pils',
    category: 'lager',
    manufacturer: 'Krombacher',
    country: 'Германия',
    abv: 4.8,
    ibu: 26,
    description: 'Немецкий пилснер премиум-класса',
    pricePerLiter: 230,
    isActive: true,
  },
  {
    id: 'prod-18',
    name: 'Оболонь Светлое',
    category: 'light',
    manufacturer: 'Оболонь',
    country: 'Украина',
    abv: 4.5,
    ibu: 16,
    description: 'Лёгкое светлое пиво',
    pricePerLiter: 110,
    isActive: true,
  },
  {
    id: 'prod-19',
    name: 'Brewdog Hazy Jane',
    category: 'craft',
    manufacturer: 'BrewDog',
    country: 'Шотландия',
    abv: 5.0,
    ibu: 30,
    description: 'Мутный New England IPA с сочным вкусом',
    pricePerLiter: 380,
    isActive: true,
  },
  {
    id: 'prod-20',
    name: 'Klinskoye Svetloe',
    category: 'light',
    manufacturer: 'САН ИнБев',
    country: 'Россия',
    abv: 4.7,
    ibu: 14,
    description: 'Популярное российское светлое пиво',
    pricePerLiter: 100,
    isActive: true,
  },
]


export const suppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'ООО "Пивоопт"',
    contactPerson: 'Андрей Васильев',
    phone: '+7 (495) 555-11-22',
    email: 'orders@pivoopt.ru',
    address: 'г. Москва, ул. Складская, 5',
    products: ['prod-1', 'prod-2', 'prod-12', 'prod-18', 'prod-20'],
    paymentTerms: 'Отсрочка 14 дней',
    deliveryDays: ['Понедельник', 'Четверг'],
    isActive: true,
  },
  {
    id: 'sup-2',
    name: 'ИП Крафтов',
    contactPerson: 'Михаил Крафтов',
    phone: '+7 (495) 555-22-33',
    email: 'craft@craftbeer.ru',
    address: 'г. Москва, ул. Пивная, 10',
    products: ['prod-6', 'prod-16', 'prod-19'],
    paymentTerms: 'Предоплата 50%',
    deliveryDays: ['Вторник', 'Пятница'],
    isActive: true,
  },
  {
    id: 'sup-3',
    name: 'ООО "ЕвроПиво"',
    contactPerson: 'Елена Штайн',
    phone: '+7 (495) 555-33-44',
    email: 'import@europivo.ru',
    address: 'г. Москва, пр. Европейский, 25',
    products: ['prod-3', 'prod-4', 'prod-5', 'prod-7', 'prod-9', 'prod-10', 'prod-11', 'prod-14', 'prod-17'],
    paymentTerms: 'Отсрочка 7 дней',
    deliveryDays: ['Среда'],
    isActive: true,
  },
  {
    id: 'sup-4',
    name: 'АО "Сидродел"',
    contactPerson: 'Ирина Яблочкина',
    phone: '+7 (495) 555-44-55',
    email: 'sales@sidrdel.ru',
    address: 'г. Тула, ул. Садовая, 15',
    products: ['prod-8', 'prod-15'],
    paymentTerms: 'Предоплата 100%',
    deliveryDays: ['Пятница'],
    isActive: true,
  },
  {
    id: 'sup-5',
    name: 'ООО "Чешский Дом"',
    contactPerson: 'Павел Новак',
    phone: '+7 (495) 555-55-66',
    email: 'info@czechdom.ru',
    address: 'г. Москва, ул. Прага, 8',
    products: ['prod-7', 'prod-9', 'prod-13'],
    paymentTerms: 'Отсрочка 21 день',
    deliveryDays: ['Понедельник', 'Среда', 'Пятница'],
    isActive: true,
  },
]


export const customers: Customer[] = [
  { id: 'cust-1', name: 'Александр Иванов', phone: '+7 (916) 111-22-33', email: 'alex@mail.ru', bonusBalance: 450, totalPurchases: 15680, purchaseCount: 28, registeredAt: '2024-01-15', lastPurchaseAt: '2025-03-10', favoriteStoreId: 'store-1' },
  { id: 'cust-2', name: 'Петр Сергеев', phone: '+7 (916) 222-33-44', email: 'petr@gmail.com', bonusBalance: 1200, totalPurchases: 42350, purchaseCount: 67, registeredAt: '2023-06-20', lastPurchaseAt: '2025-03-11', favoriteStoreId: 'store-1' },
  { id: 'cust-3', name: 'Виктор Кузнецов', phone: '+7 (916) 333-44-55', bonusBalance: 320, totalPurchases: 8900, purchaseCount: 15, registeredAt: '2024-05-10', lastPurchaseAt: '2025-03-09', favoriteStoreId: 'store-2' },
  { id: 'cust-4', name: 'Дмитрий Орлов', phone: '+7 (916) 444-55-66', email: 'dmitry.orlov@ya.ru', bonusBalance: 890, totalPurchases: 28450, purchaseCount: 45, registeredAt: '2023-11-05', lastPurchaseAt: '2025-03-10', favoriteStoreId: 'store-2' },
  { id: 'cust-5', name: 'Сергей Волков', phone: '+7 (916) 555-66-77', bonusBalance: 150, totalPurchases: 4200, purchaseCount: 8, registeredAt: '2024-09-01', lastPurchaseAt: '2025-03-08', favoriteStoreId: 'store-3' },
  { id: 'cust-6', name: 'Андрей Медведев', phone: '+7 (916) 666-77-88', email: 'medved@mail.ru', bonusBalance: 2100, totalPurchases: 68900, purchaseCount: 112, registeredAt: '2022-03-15', lastPurchaseAt: '2025-03-11', favoriteStoreId: 'store-1' },
  { id: 'cust-7', name: 'Николай Зайцев', phone: '+7 (916) 777-88-99', bonusBalance: 560, totalPurchases: 17800, purchaseCount: 32, registeredAt: '2024-02-28', lastPurchaseAt: '2025-03-07', favoriteStoreId: 'store-2' },
  { id: 'cust-8', name: 'Роман Лисицын', phone: '+7 (916) 888-99-00', email: 'roman.l@gmail.com', bonusBalance: 780, totalPurchases: 24500, purchaseCount: 41, registeredAt: '2023-08-12', lastPurchaseAt: '2025-03-10', favoriteStoreId: 'store-3' },
  { id: 'cust-9', name: 'Максим Соколов', phone: '+7 (916) 999-00-11', bonusBalance: 340, totalPurchases: 10200, purchaseCount: 18, registeredAt: '2024-04-20', lastPurchaseAt: '2025-03-09', favoriteStoreId: 'store-1' },
  { id: 'cust-10', name: 'Игорь Белов', phone: '+7 (916) 100-20-30', email: 'igor.belov@ya.ru', bonusBalance: 1450, totalPurchases: 48700, purchaseCount: 78, registeredAt: '2023-01-10', lastPurchaseAt: '2025-03-11', favoriteStoreId: 'store-2' },
  { id: 'cust-11', name: 'Владимир Чёрный', phone: '+7 (916) 200-30-40', bonusBalance: 670, totalPurchases: 21300, purchaseCount: 36, registeredAt: '2023-12-01', lastPurchaseAt: '2025-03-08', favoriteStoreId: 'store-3' },
  { id: 'cust-12', name: 'Артём Серов', phone: '+7 (916) 300-40-50', email: 'artem.serov@mail.ru', bonusBalance: 890, totalPurchases: 29800, purchaseCount: 49, registeredAt: '2023-07-22', lastPurchaseAt: '2025-03-10', favoriteStoreId: 'store-1' },
  { id: 'cust-13', name: 'Евгений Синицын', phone: '+7 (916) 400-50-60', bonusBalance: 210, totalPurchases: 6800, purchaseCount: 12, registeredAt: '2024-08-15', lastPurchaseAt: '2025-03-06', favoriteStoreId: 'store-2' },
  { id: 'cust-14', name: 'Кирилл Воронов', phone: '+7 (916) 500-60-70', email: 'kirill.v@gmail.com', bonusBalance: 1100, totalPurchases: 36400, purchaseCount: 58, registeredAt: '2023-04-18', lastPurchaseAt: '2025-03-11', favoriteStoreId: 'store-1' },
  { id: 'cust-15', name: 'Олег Журавлёв', phone: '+7 (916) 600-70-80', bonusBalance: 430, totalPurchases: 13900, purchaseCount: 24, registeredAt: '2024-01-30', lastPurchaseAt: '2025-03-09', favoriteStoreId: 'store-3' },
]


export const employees: Employee[] = users.filter(u => u.role !== 'admin').map((user, index) => ({
  id: `emp-${index + 1}`,
  userId: user.id,
  storeId: user.storeId!,
  position: user.role === 'manager' ? 'Менеджер магазина' : 'Продавец-консультант',
  salary: user.role === 'manager' ? 85000 : 55000,
  hiredAt: ['2022-03-01', '2022-06-15', '2023-01-10', '2023-04-01', '2023-08-15', '2023-11-01', '2024-02-01', '2024-05-15', '2024-09-01'][index] || '2024-01-01',
  isActive: true,
}))


export const inventory: Inventory[] = []
products.forEach(product => {
  stores.forEach(store => {
    inventory.push({
      id: `inv-${product.id}-${store.id}`,
      productId: product.id,
      storeId: store.id,
      quantity: Math.floor(Math.random() * 80) + 10,
      minQuantity: 15,
      lastUpdated: '2025-03-11',
    })
  })
})


let seed = 12345
function random() {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

function generateSales(): Sale[] {
  const sales: Sale[] = []
  const startDate = new Date('2025-02-10')
  const endDate = new Date('2025-03-11')
  
  let saleId = 1
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    
    const dailySalesCount = Math.floor(random() * 20) + 15
    
    for (let i = 0; i < dailySalesCount; i++) {
      const store = stores[Math.floor(random() * stores.length)]
      const storeSellers = users.filter(u => u.storeId === store.id && u.role === 'seller')
      const seller = storeSellers.length > 0 ? storeSellers[Math.floor(random() * storeSellers.length)] : users[4]
      const hasCustomer = random() > 0.4
      const customer = hasCustomer ? customers[Math.floor(random() * customers.length)] : undefined
      
      
      const itemCount = Math.floor(random() * 4) + 1
      const items = []
      let total = 0
      
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(random() * products.length)]
        const quantity = Math.round((random() * 2 + 0.5) * 10) / 10 
        const itemTotal = Math.round(product.pricePerLiter * quantity)
        total += itemTotal
        items.push({
          productId: product.id,
          quantity,
          pricePerLiter: product.pricePerLiter,
          total: itemTotal,
        })
      }
      
      const bonusUsed = customer && random() > 0.7 ? Math.min(customer.bonusBalance, Math.floor(total * 0.1)) : 0
      const bonusEarned = customer ? Math.floor((total - bonusUsed) * 0.05) : 0
      
      const hour = Math.floor(random() * 12) + 10
      const minute = Math.floor(random() * 60)
      const saleDate = new Date(d)
      saleDate.setHours(hour, minute, 0, 0)
      
      sales.push({
        id: `sale-${saleId++}`,
        storeId: store.id,
        sellerId: seller.id,
        customerId: customer?.id,
        items,
        total: total - bonusUsed,
        paymentMethod: random() > 0.6 ? 'card' : random() > 0.3 ? 'cash' : 'transfer',
        createdAt: saleDate.toISOString(),
        bonusUsed,
        bonusEarned,
      })
    }
  }
  
  return sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const sales: Sale[] = generateSales()


export function generateDailyStats(): DailyStat[] {
  const stats: DailyStat[] = []
  const startDate = new Date('2025-02-10')
  const endDate = new Date('2025-03-11')
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    
    stores.forEach(store => {
      const daySales = sales.filter(s => 
        s.storeId === store.id && 
        s.createdAt.startsWith(dateStr)
      )
      
      const revenue = daySales.reduce((sum, s) => sum + s.total, 0)
      const salesCount = daySales.length
      
      
      const productCounts: Record<string, number> = {}
      daySales.forEach(sale => {
        sale.items.forEach(item => {
          productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity
        })
      })
      
      const topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([productId, quantity]) => ({ productId, quantity }))
      
      stats.push({
        date: dateStr,
        storeId: store.id,
        revenue,
        salesCount,
        averageCheck: salesCount > 0 ? Math.round(revenue / salesCount) : 0,
        newCustomers: Math.floor(random() * 3),
        topProducts,
      })
    })
  }
  
  return stats
}

export const dailyStats: DailyStat[] = generateDailyStats()


export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}

export function getStoreById(id: string): Store | undefined {
  return stores.find(s => s.id === id)
}

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id)
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find(c => c.id === id)
}

export function getSupplierById(id: string): Supplier | undefined {
  return suppliers.find(s => s.id === id)
}

export function getInventoryByStore(storeId: string): (Inventory & { product: Product })[] {
  return inventory
    .filter(inv => inv.storeId === storeId)
    .map(inv => ({
      ...inv,
      product: getProductById(inv.productId)!,
    }))
    .filter(inv => inv.product)
}

export function getLowStockItems(storeId?: string): (Inventory & { product: Product; store: Store })[] {
  return inventory
    .filter(inv => inv.quantity <= inv.minQuantity && (!storeId || inv.storeId === storeId))
    .map(inv => ({
      ...inv,
      product: getProductById(inv.productId)!,
      store: getStoreById(inv.storeId)!,
    }))
    .filter(inv => inv.product && inv.store)
}


export function getTodayStats(storeId?: string) {
  const today = '2025-03-11' 
  const todaySales = sales.filter(s => 
    s.createdAt.startsWith(today) && 
    (!storeId || s.storeId === storeId)
  )
  
  const revenue = todaySales.reduce((sum, s) => sum + s.total, 0)
  const salesCount = todaySales.length
  const uniqueCustomers = new Set(todaySales.filter(s => s.customerId).map(s => s.customerId)).size
  
  return {
    revenue,
    salesCount,
    averageCheck: salesCount > 0 ? Math.round(revenue / salesCount) : 0,
    activeCustomers: uniqueCustomers,
  }
}

export function getWeekStats(storeId?: string) {
  const weekAgo = new Date('2025-03-04')
  const weekSales = sales.filter(s => 
    new Date(s.createdAt) >= weekAgo && 
    (!storeId || s.storeId === storeId)
  )
  
  return {
    revenue: weekSales.reduce((sum, s) => sum + s.total, 0),
    salesCount: weekSales.length,
  }
}

export function getRecentSales(limit = 10, storeId?: string): (Sale & { store: Store; seller: User; customer?: Customer })[] {
  return sales
    .filter(s => !storeId || s.storeId === storeId)
    .slice(0, limit)
    .map(sale => ({
      ...sale,
      store: getStoreById(sale.storeId)!,
      seller: getUserById(sale.sellerId)!,
      customer: sale.customerId ? getCustomerById(sale.customerId) : undefined,
    }))
}

export function getTopProducts(days = 7, storeId?: string, limit = 5) {
  const startDate = new Date('2025-03-11')
  startDate.setDate(startDate.getDate() - days)
  
  const productCounts: Record<string, { quantity: number; revenue: number }> = {}
  
  sales
    .filter(s => new Date(s.createdAt) >= startDate && (!storeId || s.storeId === storeId))
    .forEach(sale => {
      sale.items.forEach(item => {
        if (!productCounts[item.productId]) {
          productCounts[item.productId] = { quantity: 0, revenue: 0 }
        }
        productCounts[item.productId].quantity += item.quantity
        productCounts[item.productId].revenue += item.total
      })
    })
  
  return Object.entries(productCounts)
    .map(([productId, stats]) => ({
      product: getProductById(productId)!,
      ...stats,
    }))
    .filter(item => item.product)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}
