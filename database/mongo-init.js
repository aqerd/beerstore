db = db.getSiblingDB('golden_liquid');

db.stores.insertMany([
  {
    _id: 'store-1',
    name: 'Жидкое Золото - Центр',
    address: 'ул. Ленина, 42',
    phone: '+7 (495) 123-45-67',
    workingHours: '10:00 - 22:00',
    managerId: 'user-2',
    isActive: true
  },
  {
    _id: 'store-2',
    name: 'Жидкое Золото - Север',
    address: 'пр. Мира, 128',
    phone: '+7 (495) 234-56-78',
    workingHours: '10:00 - 23:00',
    managerId: 'user-3',
    isActive: true
  }
]);

db.users.insertMany([
  {
    _id: 'user-1',
    name: 'Иван Петров',
    email: 'manager1@goldenliquid.ru',
    role: 'manager',
    storeId: 'store-1'
  },
  {
    _id: 'user-2',
    name: 'Мария Сидорова',
    email: 'purchaser1@goldenliquid.ru',
    role: 'purchaser',
    storeId: null
  }
]);

db.products.insertMany([
  {
    _id: 'prod-1',
    name: 'Жигулёвское Классическое',
    category: 'light',
    manufacturer: 'Жигулёвский ПЗ',
    country: 'Россия',
    abv: 4.5,
    ibu: 18,
    pricePerLiter: 120,
    isActive: true
  }
]);
