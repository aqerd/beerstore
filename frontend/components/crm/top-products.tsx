'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getTopProducts } from '@/lib/mock-data'
import { useCRM } from '@/lib/store'
import { BEER_CATEGORIES } from '@/lib/types'

export function TopProducts() {
  const { currentStore } = useCRM()
  const topProducts = getTopProducts(7, currentStore?.id, 6)
  
  const maxRevenue = topProducts[0]?.revenue || 1

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
