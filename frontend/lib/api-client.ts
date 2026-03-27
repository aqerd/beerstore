import { 
  User, Store, Product, Sale, Customer, Supplier, 
  SupplyOrder, Shift, MaintenanceTask, KegTapAction, WriteOff, DailyStat 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  
  sales: {
    create: (sale: Omit<Sale, 'id' | 'createdAt'>) => 
      request<Sale>('/sales', { method: 'POST', body: JSON.stringify(sale) }),
    getById: (id: string) => 
      request<Sale>(`/sales/${id}`),
    list: (params?: { storeId?: string; startDate?: string; endDate?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<Sale[]>(`/sales?${query}`);
    },
    refund: (id: string, reason: string) => 
      request<Sale>(`/sales/${id}/refund`, { method: 'POST', body: JSON.stringify({ reason }) }),
  },

  
  inventory: {
    list: (storeId: string) => 
      request<any[]>(`/inventory?storeId=${storeId}`),
    tapKeg: (action: Omit<KegTapAction, 'id' | 'tappedAt'>) => 
      request<KegTapAction>('/inventory/kegs/tap', { method: 'POST', body: JSON.stringify(action) }),
    writeOff: (data: Omit<WriteOff, 'id' | 'createdAt'>) => 
      request<WriteOff>('/inventory/write-off', { method: 'POST', body: JSON.stringify(data) }),
    audit: (storeId: string, items: { productId: string; actualQuantity: number }[]) => 
      request<void>('/inventory/audit', { method: 'POST', body: JSON.stringify({ storeId, items }) }),
    returnContainers: (storeId: string, kegsCount: number) => 
      request<void>('/inventory/return-containers', { method: 'POST', body: JSON.stringify({ storeId, kegsCount }) }),
  },

  
  maintenance: {
    getRouteSheet: (technicianId: string) => 
      request<MaintenanceTask[]>(`/maintenance/tasks?technicianId=${technicianId}`),
    completeTask: (taskId: string, details: { partsUsed?: string[]; notes?: string }) => 
      request<MaintenanceTask>(`/maintenance/tasks/${taskId}/complete`, { 
        method: 'POST', 
        body: JSON.stringify(details) 
      }),
    createRepairRequest: (requestData: Omit<MaintenanceTask, 'id' | 'scheduledAt' | 'technicianId'>) => 
      request<MaintenanceTask>('/maintenance/repair-request', { method: 'POST', body: JSON.stringify(requestData) }),
    orderParts: (parts: { name: string; quantity: number }[]) => 
      request<void>('/maintenance/parts-order', { method: 'POST', body: JSON.stringify({ parts }) }),
  },

  
  purchasing: {
    listOrders: (storeId?: string) => 
      request<SupplyOrder[]>(`/purchasing/orders${storeId ? `?storeId=${storeId}` : ''}`),
    createOrder: (order: Omit<SupplyOrder, 'id' | 'orderedAt' | 'status'>) => 
      request<SupplyOrder>('/purchasing/orders', { method: 'POST', body: JSON.stringify(order) }),
    receiveOrder: (orderId: string) => 
      request<SupplyOrder>(`/purchasing/orders/${orderId}/receive`, { method: 'POST' }),
    listSuppliers: () => request<Supplier[]>('/suppliers'),
  },

  
  shifts: {
    open: (storeId: string, userId: string, startBalance: number) => 
      request<Shift>('/shifts/open', { method: 'POST', body: JSON.stringify({ storeId, userId, startBalance }) }),
    close: (shiftId: string, endBalance: number) => 
      request<Shift>(`/shifts/${shiftId}/close`, { method: 'POST', body: JSON.stringify({ endBalance }) }),
    getCurrent: (storeId: string) => 
      request<Shift>(`/shifts/current?storeId=${storeId}`),
  },

  
  loyalty: {
    checkCustomer: (phone: string) => 
      request<Customer>(`/loyalty/customer?phone=${phone}`),
    applyBonuses: (customerId: string, amount: number) => 
      request<{ success: boolean; newBalance: number }>('/loyalty/apply', { 
        method: 'POST', 
        body: JSON.stringify({ customerId, amount }) 
      }),
  },

  
  reports: {
    getDashboard: (storeId?: string) => 
      request<any>(`/reports/dashboard${storeId ? `?storeId=${storeId}` : ''}`),
    getDailyStats: (storeId?: string) => 
      request<DailyStat[]>(`/reports/daily-stats${storeId ? `?storeId=${storeId}` : ''}`),
    getFinancials: (params: { startDate: string; endDate: string }) => 
      request<any>(`/reports/financials?startDate=${params.startDate}&endDate=${params.endDate}`),
    getStaffPerformance: (storeId?: string) => 
      request<any>(`/reports/staff-performance${storeId ? `?storeId=${storeId}` : ''}`),
  },

  
  auth: {
    login: (credentials: any) => 
      request<{ user: User; token: string }>('/auth/login', { 
        method: 'POST', 
        body: JSON.stringify(credentials) 
      }),
  },

  
  stores: {
    list: () => request<Store[]>('/stores'),
  },
  
  products: {
    list: () => request<Product[]>('/products'),
  }
};
