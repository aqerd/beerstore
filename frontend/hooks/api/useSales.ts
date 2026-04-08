import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Sale } from '@/lib/types';

export type ExtendedSale = Sale & {
  customerName?: string;
  sellerName?: string;
};

function normalizeSale(sale: any): ExtendedSale {
  return {
    ...sale,
    customerName: sale.customerName || 'Гость',
    sellerName: sale.sellerName || 'Сотрудник',
  };
}

export function useSales(storeId?: string) {
  const [sales, setSales] = useState<ExtendedSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.sales.list({ storeId });
      setSales(data.map(normalizeSale));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const prependSale = (sale: any) => {
    const normalized = normalizeSale(sale);
    setSales((prev) => {
      const withoutSame = prev.filter((item) => item.id !== normalized.id);
      return [normalized, ...withoutSame];
    });
  };

  useEffect(() => {
    fetchSales();
  }, [storeId]);

  return { sales, loading, error, refresh: fetchSales, prependSale };
}
