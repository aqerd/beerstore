import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

export function useDashboard(storeId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await api.reports.getDashboard(storeId);
      setData(dashboardData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [storeId]);

  return { data, loading, error, refresh: fetchDashboard };
}
