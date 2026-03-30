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
]);
