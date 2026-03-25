'use client'

import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getLowStockItems } from '@/lib/mock-data'
import { useCRM } from '@/lib/store'
import Link from 'next/link'

export function InventoryAlerts() {
  const { currentStore } = useCRM()
  const lowStockItems = getLowStockItems(currentStore?.id).slice(0, 5)

  if (lowStockItems.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            Уведомления о складе
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Все товары в достаточном количестве
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Низкие остатки
          </CardTitle>
          <Badge variant="secondary" className="bg-warning/10 text-warning">
            {lowStockItems.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lowStockItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg bg-warning/5 p-3 border border-warning/20"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">{item.product.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.store.name.split(' - ')[1]}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-warning">
                {item.quantity} л
              </p>
              <p className="text-xs text-muted-foreground">
                мин: {item.minQuantity} л
              </p>
            </div>
          </div>
        ))}
        <Link
          href="/inventory"
          className="block text-center text-sm text-primary hover:underline pt-2"
        >
          Перейти на склад
        </Link>
      </CardContent>
    </Card>
  )
}
