// MongoDB (java profile): seed only if collections are empty

db = db.getSiblingDB('golden_liquid');

function seedIfEmpty(collection, docs) {
  if (db[collection].countDocuments() === 0) {
    db[collection].insertMany(docs);
  }
}

seedIfEmpty('stores', [
  {
    _id: 'store-1',
    name: 'Жидкое Золото - Центр',
    address: 'ул. Ленина, 42',
    phone: '+7 (495) 123-45-67',
    workingHours: '10:00 - 22:00',
    managerId: 'user-2',
    isActive: true,
  },
  {
    _id: 'store-2',
    name: 'Жидкое Золото - Север',
    address: 'пр. Мира, 128',
    phone: '+7 (495) 234-56-78',
    workingHours: '10:00 - 23:00',
    managerId: 'user-3',
    isActive: true,
  },
]);

seedIfEmpty('users', [
  {
    _id: 'user-1',
    name: 'Иван Петров',
    email: 'manager1@goldenliquid.ru',
    role: 'manager',
    storeId: 'store-1',
  },
  {
    _id: 'user-2',
    name: 'Мария Сидорова',
    email: 'purchaser1@goldenliquid.ru',
    role: 'purchaser',
    storeId: null,
  },
  {
    _id: 'user-3',
    name: 'Алексей Козлов',
    email: 'bartender1@goldenliquid.ru',
    role: 'bartender',
    storeId: 'store-1',
  },
]);

seedIfEmpty('products', [
  {
    _id: 'prod-1',
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
    _id: 'prod-2',
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
    _id: 'prod-3',
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
    _id: 'prod-4',
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
    _id: 'prod-5',
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
]);

seedIfEmpty('customers', [
  {
    _id: 'cust-1',
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
    _id: 'cust-2',
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
    _id: 'cust-3',
    name: 'Дмитрий Соколов',
    phone: '+79035551234',
    bonusBalance: 0,
    totalPurchases: 1200,
    purchaseCount: 1,
    registeredAt: '2025-03-25T16:00:00Z',
    lastPurchaseAt: '2025-03-25T16:30:00Z',
    favoriteStoreId: 'store-2',
  },
]);

seedIfEmpty('inventory', [
  {
    _id: 'inv-1',
    productId: 'prod-1',
    storeId: 'store-1',
    quantity: 150,
    minQuantity: 50,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    _id: 'inv-2',
    productId: 'prod-2',
    storeId: 'store-1',
    quantity: 80,
    minQuantity: 40,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    _id: 'inv-3',
    productId: 'prod-3',
    storeId: 'store-1',
    quantity: 25,
    minQuantity: 30,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    _id: 'inv-4',
    productId: 'prod-4',
    storeId: 'store-1',
    quantity: 60,
    minQuantity: 25,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    _id: 'inv-5',
    productId: 'prod-5',
    storeId: 'store-1',
    quantity: 40,
    minQuantity: 20,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    _id: 'inv-6',
    productId: 'prod-1',
    storeId: 'store-2',
    quantity: 200,
    minQuantity: 50,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
  {
    _id: 'inv-7',
    productId: 'prod-2',
    storeId: 'store-2',
    quantity: 45,
    minQuantity: 40,
    lastUpdated: '2025-03-30T08:00:00Z',
  },
]);

seedIfEmpty('suppliers', [
  {
    _id: 'supp-1',
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
    _id: 'supp-2',
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
    _id: 'supp-3',
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
]);

seedIfEmpty('supplyOrders', [
  {
    _id: 'order-1',
    supplierId: 'supp-1',
    storeId: 'store-1',
    items: [
      { productId: 'prod-1', quantity: 200, pricePerLiter: 85, total: 17000 },
      { productId: 'prod-2', quantity: 100, pricePerLiter: 105, total: 10500 },
    ],
    status: 'delivered',
    total: 27500,
    orderedAt: '2025-03-20T10:00:00Z',
    expectedDelivery: '2025-03-22',
    deliveredAt: '2025-03-22T14:30:00Z',
  },
  {
    _id: 'order-2',
    supplierId: 'supp-2',
    storeId: 'store-1',
    items: [
      { productId: 'prod-3', quantity: 50, pricePerLiter: 220, total: 11000 },
    ],
    status: 'confirmed',
    total: 11000,
    orderedAt: '2025-03-29T09:15:00Z',
    expectedDelivery: '2025-04-02',
  },
  {
    _id: 'order-3',
    supplierId: 'supp-3',
    storeId: 'store-1',
    items: [
      { productId: 'prod-5', quantity: 30, pricePerLiter: 320, total: 9600 },
    ],
    status: 'pending',
    total: 9600,
    orderedAt: '2025-03-30T11:00:00Z',
    expectedDelivery: '2025-04-03',
  },
]);

seedIfEmpty('employees', [
  {
    _id: 'emp-1',
    userId: 'user-1',
    storeId: 'store-1',
    position: 'Управляющий',
    salary: 85000,
    hiredAt: '2023-06-01T00:00:00Z',
    isActive: true,
  },
  {
    _id: 'emp-2',
    userId: 'user-2',
    storeId: null,
    position: 'Менеджер по закупкам',
    salary: 75000,
    hiredAt: '2023-08-15T00:00:00Z',
    isActive: true,
  },
  {
    _id: 'emp-3',
    userId: 'user-3',
    storeId: 'store-1',
    position: 'Бармен-кассир',
    salary: 45000,
    hiredAt: '2024-01-10T00:00:00Z',
    isActive: true,
  },
]);

seedIfEmpty('shifts', [
  {
    _id: 'shift-1',
    userId: 'user-3',
    storeId: 'store-1',
    openedAt: '2025-03-30T08:00:00Z',
    closedAt: '2025-03-30T22:00:00Z',
    startBalance: 15000,
    endBalance: 48750,
    totalSales: 125400,
  },
  {
    _id: 'shift-2',
    userId: 'user-3',
    storeId: 'store-1',
    openedAt: '2025-03-31T08:00:00Z',
    closedAt: null,
    startBalance: 10000,
    endBalance: null,
    totalSales: 0,
  },
]);

seedIfEmpty('sales', [
  {
    _id: 'sale-1',
    storeId: 'store-1',
    sellerId: 'user-3',
    customerId: 'cust-1',
    items: [
      { productId: 'prod-1', quantity: 2, pricePerLiter: 120, total: 240 },
      { productId: 'prod-5', quantity: 0.5, pricePerLiter: 450, total: 225 },
    ],
    total: 465,
    paymentMethod: 'card',
    createdAt: '2025-03-30T19:30:00Z',
    bonusUsed: 100,
    bonusEarned: 37,
  },
  {
    _id: 'sale-2',
    storeId: 'store-1',
    sellerId: 'user-3',
    customerId: 'cust-2',
    items: [
      { productId: 'prod-3', quantity: 1, pricePerLiter: 320, total: 320 },
    ],
    total: 320,
    paymentMethod: 'cash',
    createdAt: '2025-03-30T20:15:00Z',
    bonusUsed: 0,
    bonusEarned: 32,
  },
  {
    _id: 'sale-3',
    storeId: 'store-1',
    sellerId: 'user-3',
    customerId: null,
    items: [
      { productId: 'prod-2', quantity: 1.5, pricePerLiter: 150, total: 225 },
      { productId: 'prod-4', quantity: 1, pricePerLiter: 280, total: 280 },
    ],
    total: 505,
    paymentMethod: 'card',
    createdAt: '2025-03-30T21:00:00Z',
    bonusUsed: 0,
    bonusEarned: 0,
  },
  {
    _id: 'sale-4',
    storeId: 'store-1',
    sellerId: 'user-3',
    customerId: 'cust-1',
    items: [
      { productId: 'prod-1', quantity: 3, pricePerLiter: 120, total: 360 },
    ],
    total: 360,
    paymentMethod: 'card',
    createdAt: '2025-03-31T10:30:00Z',
    bonusUsed: 0,
    bonusEarned: 36,
  },
  {
    _id: 'sale-5',
    storeId: 'store-2',
    sellerId: 'user-1',
    customerId: null,
    items: [
      { productId: 'prod-1', quantity: 2, pricePerLiter: 120, total: 240 },
      { productId: 'prod-2', quantity: 2, pricePerLiter: 150, total: 300 },
    ],
    total: 540,
    paymentMethod: 'cash',
    createdAt: '2025-03-31T12:00:00Z',
    bonusUsed: 0,
    bonusEarned: 0,
  },
]);

seedIfEmpty('kegTapActions', [
  {
    _id: 'tap-1',
    storeId: 'store-1',
    productId: 'prod-1',
    tappedAt: '2025-03-28T09:00:00Z',
    finishedAt: null,
    isCurrentlyTapped: true,
  },
  {
    _id: 'tap-2',
    storeId: 'store-1',
    productId: 'prod-2',
    tappedAt: '2025-03-29T10:00:00Z',
    finishedAt: null,
    isCurrentlyTapped: true,
  },
  {
    _id: 'tap-3',
    storeId: 'store-1',
    productId: 'prod-3',
    tappedAt: '2025-03-25T08:00:00Z',
    finishedAt: '2025-03-29T22:00:00Z',
    isCurrentlyTapped: false,
  },
]);

seedIfEmpty('writeOffs', [
  {
    _id: 'writeoff-1',
    storeId: 'store-1',
    productId: 'prod-3',
    quantity: 5,
    reason: 'sour',
    createdAt: '2025-03-29T14:00:00Z',
    managerId: 'user-1',
  },
  {
    _id: 'writeoff-2',
    storeId: 'store-1',
    productId: 'prod-1',
    quantity: 2,
    reason: 'foam',
    createdAt: '2025-03-28T16:30:00Z',
    managerId: 'user-1',
  },
]);

seedIfEmpty('maintenanceTasks', [
  {
    _id: 'maint-1',
    storeId: 'store-1',
    technicianId: 'user-1',
    type: 'cleaning',
    status: 'completed',
    description: 'Еженедельная чистка линий розлива',
    scheduledAt: '2025-03-28T08:00:00Z',
    completedAt: '2025-03-28T10:30:00Z',
    partsUsed: ['sanitizer-500ml', 'brush-set'],
  },
  {
    _id: 'maint-2',
    storeId: 'store-1',
    technicianId: 'user-1',
    type: 'repair',
    status: 'in_progress',
    description: 'Замена крана на кеге №3',
    scheduledAt: '2025-03-31T09:00:00Z',
    completedAt: null,
    partsUsed: [],
  },
  {
    _id: 'maint-3',
    storeId: 'store-1',
    technicianId: 'user-1',
    type: 'maintenance',
    status: 'pending',
    description: 'ТО холодильного оборудования',
    scheduledAt: '2025-04-02T10:00:00Z',
    completedAt: null,
    partsUsed: [],
  },
]);

