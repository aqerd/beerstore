'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useCRM } from '@/lib/store'
import { BEER_CATEGORIES } from '@/lib/types'
import { sales, products } from '@/lib/mock-data'

export function TopProducts() {
  const { currentStore } = useCRM()

  // Calculate top products from sales data
  const productStats = sales
    .filter(sale => !currentStore || sale.storeId === currentStore.id)
    .flatMap(sale => sale.items)
    .reduce((acc, item) => {
      if (!acc[item.productId]) {
        acc[item.productId] = { quantity: 0, revenue: 0 }
      }
      acc[item.productId].quantity += item.quantity
      acc[item.productId].revenue += item.total
      return acc
    }, {} as Record<string, { quantity: number; revenue: number }>)

  const topProducts = Object.entries(productStats)
    .map(([productId, stats]) => {
      const product = products.find(p => p.id === productId)
      if (!product) return null
      return {
        product,
        quantity: stats.quantity,
        revenue: stats.revenue,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)

  const maxRevenue = topProducts[0]?.revenue || 1

  if (topProducts.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Топ товаров за неделю
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Нет данных о продажах</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          Топ товаров за неделю
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topProducts.map((item, index) => (
          <div key={item.product.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {item.product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {BEER_CATEGORIES[item.product.category]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.quantity.toFixed(1)} л
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium">
                {item.revenue.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <Progress
              value={(item.revenue / maxRevenue) * 100}
              className="h-1.5"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
