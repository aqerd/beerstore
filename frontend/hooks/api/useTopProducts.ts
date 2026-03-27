import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Product } from '@/lib/types';

export type TopProductExtended = {
  product: Product;
  quantity: number;
  revenue: number;
};

export function useTopProducts(days = 7, storeId?: string, limit = 6) {
  const [topProducts, setTopProducts] = useState<TopProductExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      
      const stats = await api.reports.getDailyStats(storeId);
      const products = await api.products.list();
      
      const productMap: Record<string, { quantity: number; revenue: number }> = {};
      
      stats.forEach(day => {
        day.topProducts.forEach(tp => {
          if (!productMap[tp.productId]) {
            productMap[tp.productId] = { quantity: 0, revenue: 0 };
          }
          productMap[tp.productId].quantity += tp.quantity;
          
          const product = products.find(p => p.id === tp.productId);
          if (product) {
            productMap[tp.productId].revenue += tp.quantity * product.pricePerLiter;
          }
        });
      });

      const result = Object.entries(productMap)
        .map(([productId, data]) => ({
          product: products.find(p => p.id === productId)!,
          ...data
        }))
        .filter(item => item.product)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);

      setTopProducts(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, [days, storeId, limit]);

  return { topProducts, loading, error, refresh: fetchTopProducts };
}
