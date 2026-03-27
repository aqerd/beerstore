'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useCRM } from '@/lib/store'
import { useRecentSales } from '@/hooks/api/useRecentSales'
import { PAYMENT_METHODS } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

export function RecentSales() {
  const { currentStore } = useCRM()
  const { sales: recentSales, loading } = useRecentSales(8, currentStore?.id)

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-muted-foreground animate-pulse">
            Загрузка...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 w-full bg-muted rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: ru,
      })
    } catch {
      return dateStr
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          Последние продажи
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentSales.map((sale) => {
          return (
            <div
              key={sale.id}
              className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-secondary/50"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {sale.customerName ? getInitials(sale.customerName) : 'Г'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {sale.customerName || 'Гость'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {sale.productName}
                  {sale.items.length > 1 && ` +${sale.items.length - 1}`}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-medium">{sale.total.toLocaleString('ru-RU')} ₽</p>
                <div className="flex items-center gap-2 justify-end">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {PAYMENT_METHODS[sale.paymentMethod]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(sale.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
