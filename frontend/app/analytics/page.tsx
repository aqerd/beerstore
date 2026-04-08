'use client'

import { useMemo } from 'react'
import { BarChart3, TrendingUp, Users, Package, Store, ShoppingCart, Beer } from 'lucide-react'
import { CRMLayout } from '@/components/crm/crm-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCRM } from '@/lib/store'
import { useSales } from '@/hooks/api/useSales'
import { useStores } from '@/hooks/api/useStores'
import { useProducts } from '@/hooks/api/useProducts'
import { BEER_CATEGORIES, PAYMENT_METHODS } from '@/lib/types'
import { CrmEmptyState } from '@/components/crm/crm-empty-state'
import { Progress } from '@/components/ui/progress'

function AnalyticsContent() {
  const { currentStore } = useCRM()
  const { sales, loading: salesLoading } = useSales(currentStore?.id)
  const { stores, loading: storesLoading } = useStores()
  const { products, loading: productsLoading } = useProducts()

  const stats = useMemo(() => {
    if (!sales.length || !stores.length || !products.length) return null

    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)
    const totalSales = sales.length
    const avgCheck = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0

    const uniqueCustomers = new Set(sales.filter(s => s.customerId).map(s => s.customerId)).size
    const guestSales = sales.filter(s => !s.customerId).length

    const paymentStats = sales.reduce((acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total
      return acc
    }, {} as Record<string, number>)

    const storeStats = stores.map(store => {
      const storeSales = sales.filter(s => s.storeId === store.id)
      const storeRevenue = storeSales.reduce((sum, s) => sum + s.total, 0)
      return {
        name: store.name.split(' - ')[1] || store.name,
        revenue: storeRevenue,
        salesCount: storeSales.length,
      }
    }).sort((a, b) => b.revenue - a.revenue)

    const productSales = new Map<string, { quantity: number; revenue: number }>()
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const current = productSales.get(item.productId) || { quantity: 0, revenue: 0 }
        current.quantity += item.quantity
        current.revenue += item.total
        productSales.set(item.productId, current)
      })
    })

    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => {
        const product = products.find(p => p.id === productId)
        return {
          name: product?.name || 'Unknown',
          category: product?.category || 'other',
          ...data,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const categoryStats = Object.entries(BEER_CATEGORIES).map(([key, label]) => {
      const categoryProducts = products.filter(p => p.category === key)
      const categoryRevenue = topProducts
        .filter(p => p.category === key)
        .reduce((sum, p) => sum + p.revenue, 0)
      return {
        key,
        label,
        count: categoryProducts.length,
        revenue: categoryRevenue,
      }
    }).filter(c => c.count > 0)

    const today = new Date().toDateString()
    const todaySales = sales.filter(s => new Date(s.createdAt).toDateString() === today)
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekSales = sales.filter(s => new Date(s.createdAt) >= weekAgo)
    const weekRevenue = weekSales.reduce((sum, s) => sum + s.total, 0)

    return {
      totalRevenue,
      totalSales,
      avgCheck,
      uniqueCustomers,
      guestSales,
      paymentStats,
      storeStats,
      topProducts,
      categoryStats,
      todayRevenue,
      todaySalesCount: todaySales.length,
      weekRevenue,
      weekSalesCount: weekSales.length,
    }
  }, [sales, stores, products])

  if (salesLoading || storesLoading || productsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-card rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-64 bg-card rounded-xl" />
          <div className="h-64 bg-card rounded-xl" />
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <CrmEmptyState
        icon={BarChart3}
        title="Нет данных для аналитики"
        description="Загрузите данные о продажах, магазинах и товарах для построения статистики."
      />
    )
  }

  const formatMoney = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
        <p className="text-muted-foreground">Статистика и анализ данных по продажам</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Общая выручка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Сегодня: {formatMoney(stats.todayRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Всего продаж
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Сегодня: {stats.todaySalesCount}, За неделю: {stats.weekSalesCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Клиенты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Гостей без регистрации: {stats.guestSales}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Средний чек
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(stats.avgCheck)}</div>
            <p className="text-xs text-muted-foreground">
              За неделю: {formatMoney(stats.weekRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Выручка по точкам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.storeStats.map((store, idx) => {
                const maxRevenue = stats.storeStats[0]?.revenue || 1
                const percent = maxRevenue > 0 ? (store.revenue / maxRevenue) * 100 : 0
                return (
                  <div key={store.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{store.name}</span>
                      <span className="text-muted-foreground">
                        {formatMoney(store.revenue)} ({store.salesCount} продаж)
                      </span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beer className="h-5 w-5" />
              Топ товаров
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topProducts.map((product, idx) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {BEER_CATEGORIES[product.category as keyof typeof BEER_CATEGORIES] || product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatMoney(product.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{product.quantity.toFixed(1)} л</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Категории товаров</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.categoryStats.map((cat) => {
                const maxCount = Math.max(...stats.categoryStats.map(c => c.count))
                const percent = maxCount > 0 ? (cat.count / maxCount) * 100 : 0
                return (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{cat.label}</span>
                      <span className="text-muted-foreground">{cat.count} товаров</span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Способы оплаты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.paymentStats)
                .sort(([, a], [, b]) => b - a)
                .map(([method, amount]) => {
                  const total = Object.values(stats.paymentStats).reduce((a, b) => a + b, 0)
                  const percent = total > 0 ? (amount / total) * 100 : 0
                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS] || method}</span>
                        <span className="text-muted-foreground">{formatMoney(amount)}</span>
                      </div>
                      <Progress value={percent} className="h-2" />
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <CRMLayout>
      <AnalyticsContent />
    </CRMLayout>
  )
}
