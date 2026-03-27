import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

export type SalesChartData = {
  date: string;
  revenue: number;
  sales: number;
  displayDate: string;
};

export function useSalesChart(days = 14, storeId?: string) {
  const [data, setData] = useState<SalesChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const stats = await api.reports.getDailyStats(storeId);
      
      const chartData = stats
        .reduce((acc, stat) => {
          const existing = acc.find(d => d.date === stat.date);
          if (existing) {
            existing.revenue += stat.revenue;
            existing.sales += stat.salesCount;
          } else {
            acc.push({
              date: stat.date,
              revenue: stat.revenue,
              sales: stat.salesCount,
              displayDate: new Date(stat.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
              }),
            });
          }
          return acc;
        }, [] as SalesChartData[])
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-days);

      setData(chartData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [days, storeId]);

  return { data, loading, error, refresh: fetchChartData };
}
