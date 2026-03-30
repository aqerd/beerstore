import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Inventory, Product, Store } from '@/lib/types';

export type InventoryExtended = Inventory & {
  product: Product;
  store: Store;
};

export function useInventory(storeId?: string) {
  const [inventory, setInventory] = useState<InventoryExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!storeId) {
        const storesList = await api.stores.list();
        if (storesList.length === 0) {
          setInventory([]);
          return;
        }
        const chunks = await Promise.all(
          storesList.map((s) => api.inventory.list(s.id)),
        );
        setInventory(chunks.flat());
        return;
      }
      const data = await api.inventory.list(storeId);
      setInventory(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [storeId]);

  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);

  return { inventory, lowStockItems, loading, error, refresh: fetchInventory };
}
