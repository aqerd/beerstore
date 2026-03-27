import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Store } from '@/lib/types';

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const data = await api.stores.list();
      setStores(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return { stores, loading, error, refresh: fetchStores };
}
