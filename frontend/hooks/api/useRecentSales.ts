import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Sale, Product, Store, User, Customer } from '@/lib/types';

export type RecentSaleExtended = Sale & {
  productName?: string;
  customerName?: string;
};

export function useRecentSales(limit = 8, storeId?: string) {
  const [sales, setSales] = useState<RecentSaleExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecentSales = async () => {
    try {
      setLoading(true);
      
      const salesData = await api.sales.list({ storeId });
      
      const products = await api.products.list();
      
      const extendedSales = salesData.slice(0, limit).map(sale => {
        const firstItem = sale.items[0];
        const product = products.find(p => p.id === firstItem?.productId);
        return {
          ...sale,
          productName: product?.name || 'Товар',
          customerName: 'Гость', 
        };
      });

      setSales(extendedSales);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentSales();
  }, [storeId, limit]);

  return { sales, loading, error, refresh: fetchRecentSales };
}
