

export type UserRole = 'admin' | 'manager' | 'seller'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  storeId: string | null 
  avatar?: string
}

export interface Store {
  id: string
  name: string
  address: string
  phone: string
  workingHours: string
  managerId: string
  isActive: boolean
}

export type BeerCategory = 'light' | 'dark' | 'craft' | 'cider' | 'import' | 'wheat' | 'lager' | 'ale'

export interface Product {
  id: string
  name: string
  category: BeerCategory
  manufacturer: string
  country: string
  abv: number 
  ibu?: number 
  description?: string
  pricePerLiter: number
  isActive: boolean
  imageUrl?: string
}

export interface Inventory {
  id: string
  productId: string
  storeId: string
  quantity: number 
  minQuantity: number 
  lastUpdated: string
}

export interface Sale {
  id: string
  storeId: string
  sellerId: string
  customerId?: string
  items: SaleItem[]
  total: number
  paymentMethod: 'cash' | 'card' | 'transfer'
  createdAt: string
  bonusUsed: number
  bonusEarned: number
}

export interface SaleItem {
  productId: string
  quantity: number 
  pricePerLiter: number
  total: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  bonusBalance: number
  totalPurchases: number
  purchaseCount: number
  registeredAt: string
  lastPurchaseAt?: string
  favoriteStoreId?: string
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  products: string[] 
  paymentTerms: string
  deliveryDays: string[]
  isActive: boolean
}

export interface SupplyOrder {
  id: string
  supplierId: string
  storeId: string
  items: SupplyOrderItem[]
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  total: number
  orderedAt: string
  expectedDelivery?: string
  deliveredAt?: string
}

export interface SupplyOrderItem {
  productId: string
  quantity: number
  pricePerLiter: number
  total: number
}

export interface Employee {
  id: string
  userId: string
  storeId: string
  position: string
  salary: number
  hiredAt: string
  isActive: boolean
}

export interface DailyStat {
  date: string
  storeId: string
  revenue: number
  salesCount: number
  averageCheck: number
  newCustomers: number
  topProducts: { productId: string; quantity: number }[]
}


export const BEER_CATEGORIES: Record<BeerCategory, string> = {
  light: 'Светлое',
  dark: 'Тёмное',
  craft: 'Крафтовое',
  cider: 'Сидр',
  import: 'Импортное',
  wheat: 'Пшеничное',
  lager: 'Лагер',
  ale: 'Эль',
}

export const USER_ROLES: Record<UserRole, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  seller: 'Продавец',
}

export const PAYMENT_METHODS = {
  cash: 'Наличные',
  card: 'Карта',
  transfer: 'Перевод',
}
