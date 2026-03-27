import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Sale } from '@/lib/types';

export type ExtendedSale = Sale & {
  customerName?: string;
  sellerName?: string;
};

export function useSales(storeId?: string) {
  const [sales, setSales] = useState<ExtendedSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await api.sales.list({ storeId });
      
      const extendedSales = data.map(sale => ({
        ...sale,
        customerName: 'Гость', 
        sellerName: 'Сотрудник', 
      }));

      setSales(extendedSales);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [storeId]);

  return { sales, loading, error, refresh: fetchSales };
}
