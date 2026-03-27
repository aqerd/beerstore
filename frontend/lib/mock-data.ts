import { Store, User, Product, Supplier, Customer, Employee, Sale, DailyStat, Inventory } from './types'

export const stores: Store[] = []
export const users: User[] = []
export const products: Product[] = []
export const suppliers: Supplier[] = []
export const customers: Customer[] = []
export const employees: Employee[] = []
export const sales: Sale[] = []
export const dailyStats: DailyStat[] = []
export const inventory: Inventory[] = []

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
  return {
    revenue: 0,
    salesCount: 0,
    averageCheck: 0,
  }
}

export function getWeekStats(storeId?: string) {
  return {
    revenue: 0,
    salesCount: 0,
    averageCheck: 0,
  }
}

export function getLowStockItems(storeId?: string) {
  return []
}
