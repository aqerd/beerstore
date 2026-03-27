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
    if (!storeId) return;
    try {
      setLoading(true);
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
