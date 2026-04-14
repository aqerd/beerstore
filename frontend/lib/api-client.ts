import {
  User, Store, Product, Sale, SaleItem, Customer, Supplier,
  SupplyOrder, Shift, MaintenanceTask, KegTapAction, WriteOff, DailyStat
} from './types';
import * as mocks from './mock-data';

function normalizeApiBaseUrl(raw?: string) {
  const base = (raw || 'http://localhost:8080').replace(/\/+$/, '')
  return base.endsWith('/api/v1') ? base : `${base}/api/v1`
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'; 

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (USE_MOCKS) {
    return mockRequest<T>(path, options);
  }

  const method = (options?.method || 'GET').toUpperCase();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: method === 'GET' ? 'no-store' : undefined,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const payload = await response.json();
      detail = payload?.detail || payload?.message || detail;
    } catch {}
    throw new Error(`API Error: ${detail}`);
  }

  return response.json();
}


async function mockRequest<T>(path: string, options?: RequestInit): Promise<T> {
  await new Promise(resolve => setTimeout(resolve, 500));

  if (path.startsWith('/stores')) return mocks.stores as any;
  if (path.startsWith('/products')) return mocks.products as any;

  if (path.startsWith('/sales')) {
    const params = new URLSearchParams(path.split('?')[1]);
    const storeId = params.get('storeId');
    let filteredSales = mocks.sales;
    if (storeId) {
      filteredSales = mocks.sales.filter(s => s.storeId === storeId);
    }
    // Add customer and seller names
    const extendedSales = filteredSales.map(sale => {
      const customer = mocks.customers.find(c => c.id === sale.customerId);
      const seller = mocks.users.find(u => u.id === sale.sellerId);
      return {
        ...sale,
        customerName: customer?.name || undefined,
        sellerName: seller?.name || undefined,
      };
    });
    return extendedSales as any;
  }

  if (path.startsWith('/inventory')) {
    // Return inventory extended with product and store data
    const params = new URLSearchParams(path.split('?')[1]);
    const storeId = params.get('storeId');
    let filteredInventory = mocks.inventory;
    if (storeId) {
      filteredInventory = mocks.inventory.filter(i => i.storeId === storeId);
    }
    const extendedInventory = filteredInventory.map(inv => {
      const product = mocks.products.find(p => p.id === inv.productId);
      const store = mocks.stores.find(s => s.id === inv.storeId);
      return {
        ...inv,
        product: product || { name: 'Unknown', manufacturer: '-', category: 'other' },
        store: store || { name: 'Unknown' },
      };
    });
    return extendedInventory as any;
  }

  if (path.startsWith('/reports/dashboard')) {
    const storeId = new URLSearchParams(path.split('?')[1]).get('storeId');
    const todayStats = mocks.getTodayStats(storeId || undefined);
    const weekStats = mocks.getWeekStats(storeId || undefined);
    const lowStockCount = mocks.getLowStockItems(storeId || undefined).length;

    // Generate last 7 days including today
    const chartData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayName = d.toLocaleDateString('ru-RU', { weekday: 'short' });
      
      // Calculate revenue and sales for this specific day
      const daySales = mocks.sales.filter(sale => {
        const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
        const matchesStore = !storeId || sale.storeId === storeId;
        return saleDate === dateStr && matchesStore;
      });
      
      const revenue = daySales.reduce((sum, s) => sum + s.total, 0);
      
      chartData.push({
        name: displayName,
        date: dateStr,
        revenue: Math.round(revenue),
        sales: daySales.length
      });
    }

    return {
      todayStats: {
        ...todayStats,
        salesCount: todayStats.salesCount,
        averageCheck: todayStats.averageCheck,
        activeCustomers: todayStats.activeCustomers || 0,
      },
      weekStats: {
        ...weekStats,
        salesCount: weekStats.salesCount,
        averageCheck: weekStats.averageCheck,
      },
      lowStockCount,
      chartData,
    } as any;
  }

  if (path.startsWith('/suppliers')) return mocks.suppliers as any;

  if (path.startsWith('/auth/login')) return { user: mocks.users[0], token: 'mock-token' } as any;

  // Handle POST /sales for creating new sales
  if (path === '/sales' && options?.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      storeId: body.storeId,
      sellerId: body.sellerId,
      customerId: body.phone ? `cust-${body.phone.replace(/\D/g, '')}` : undefined,
      items: body.items,
      total: body.items.reduce((sum: number, item: SaleItem) => sum + item.total, 0),
      paymentMethod: body.paymentMethod,
      createdAt: new Date().toISOString(),
      bonusUsed: body.bonusUsed || 0,
      bonusEarned: Math.floor(body.items.reduce((sum: number, item: SaleItem) => sum + item.total, 0) * 0.01),
    };
    // Add to mock sales array
    mocks.sales.unshift(newSale);
    return {
      ...newSale,
      customerName: body.customerName,
      sellerName: mocks.users.find(u => u.id === body.sellerId)?.name,
    } as any;
  }

  return [] as any;
}

export const api = {

  sales: {
    create: (sale: { storeId: string; sellerId: string; customerName?: string; phone?: string; items: SaleItem[]; paymentMethod: string; bonusUsed?: number }) =>
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
    getRouteSheet: () => 
      request<MaintenanceTask[]>('/maintenance/tasks'),
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
    getFinancials: (params: { startDate: string; endDate: string; storeId?: string }) => 
      request<any>(`/reports/financials?startDate=${params.startDate}&endDate=${params.endDate}${params.storeId ? `&storeId=${params.storeId}` : ''}`),
    getManagement: (params: { startDate?: string; endDate?: string; storeId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any>(`/reports/management?${query}`);
    },
    getStaffPerformance: (storeId?: string) => 
      request<any>(`/reports/staff-performance${storeId ? `?storeId=${storeId}` : ''}`),
    getBeerStats: (params: { storeId?: string; productId?: string; startDate?: string; endDate?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any>(`/reports/beer-stats?${query}`);
    },
    getTopBeers: (limit = 10, storeId?: string) => 
      request<any>(`/reports/top-beers?limit=${limit}${storeId ? `&storeId=${storeId}` : ''}`),
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
