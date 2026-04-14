'use client'

import { useState, useEffect, useMemo } from 'react'
import { DollarSign, ShoppingCart, Users, TrendingUp, Store as StoreIcon, Beer, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CRMLayout } from '@/components/crm/crm-layout'
import { StatsCard } from '@/components/crm/stats-card'
import { RecentSales } from '@/components/crm/recent-sales'
import { TopProducts } from '@/components/crm/top-products'
import { useCRM } from '@/lib/store'
import { useDashboard } from '@/hooks/api/useDashboard'
import { useStores } from '@/hooks/api/useStores'
import { useSales } from '@/hooks/api/useSales'
import { useProducts } from '@/hooks/api/useProducts'
import { BEER_CATEGORIES, PAYMENT_METHODS } from '@/lib/types'
import { Progress } from '@/components/ui/progress'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function DashboardContent() {
  const [mounted, setMounted] = useState(false)
  const { currentStore } = useCRM()
  const { data: dashboardData, loading: dashboardLoading, error } = useDashboard(currentStore?.id)
  const { sales, loading: salesLoading } = useSales(currentStore?.id)
  const { stores, loading: storesLoading } = useStores()
  const { products, loading: productsLoading } = useProducts()

  const analyticsStats = useMemo(() => {
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

    const storeStats = stores
      .map(store => {
        const storeSales = sales.filter(s => s.storeId === store.id)
        const storeRevenue = storeSales.reduce((sum, s) => sum + s.total, 0)
        return {
          name: store.name.split(' - ')[1] || store.name,
          revenue: storeRevenue,
          salesCount: storeSales.length,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)

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

    const categoryStats = Object.entries(BEER_CATEGORIES)
      .map(([key, label]) => {
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
      })
      .filter(c => c.count > 0)

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
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || dashboardLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <TrendingUp className="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-xl font-semibold">Нет данных</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Пока нет данных для отображения дашборда. Возможно, база данных пуста или сервер недоступен.
        </p>
      </div>
    )
  }

  const { todayStats, weekStats, chartData, lowStockCount } = dashboardData

  return (
    <div className="flex flex-col gap-6">
      {}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Дашборд</h1>
        <p className="text-muted-foreground">
          Обзор показателей{' '}
          {currentStore ? currentStore.name : 'всей сети'}
        </p>
      </div>

      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Выручка сегодня"
          value={`${todayStats.revenue.toLocaleString('ru-RU')} ₽`}
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Продаж сегодня"
          value={todayStats.salesCount}
          icon={ShoppingCart}
          description={`Средний чек: ${todayStats.averageCheck.toLocaleString('ru-RU')} ₽`}
        />
        <StatsCard
          title="Активных клиентов"
          value={todayStats.activeCustomers}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Низкий остаток"
          value={lowStockCount}
          icon={TrendingUp}
          description="Товаров требуют пополнения"
        />
      </div>

      {}
      <div className="grid gap-6 lg:grid-cols-7">
        {}
        <Card className="bg-card border-border lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Продажи за неделю
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="oklch(0.75 0.18 75)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.75 0.18 75)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.25 0.005 250)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="oklch(0.65 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.65 0 0)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      value >= 1000 ? `${(value / 1000).toFixed(0)}к` : value
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.16 0.005 250)',
                      border: '1px solid oklch(0.25 0.005 250)',
                      borderRadius: '8px',
                      color: 'oklch(0.95 0 0)',
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString('ru-RU')} ₽`,
                      'Выручка',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.75 0.18 75)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">За неделю: </span>
                <span className="font-medium text-foreground">
                  {weekStats.revenue.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Продаж: </span>
                <span className="font-medium text-foreground">
                  {weekStats.salesCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="lg:col-span-3">
          <TopProducts />
        </div>
      </div>

      {}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentSales />
        
        {}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Сводка по магазинам
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Данные по отдельным магазинам временно недоступны.
            </div>
          </CardContent>
        </Card>
      </div>

      {analyticsStats && !salesLoading && !storesLoading && !productsLoading && (
        <>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Аналитика</h2>
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
                <div className="text-2xl font-bold">{analyticsStats.totalRevenue.toLocaleString('ru-RU')} ₽</div>
                <p className="text-xs text-muted-foreground">
                  Сегодня: {analyticsStats.todayRevenue.toLocaleString('ru-RU')} ₽
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
                <div className="text-2xl font-bold">{analyticsStats.totalSales}</div>
                <p className="text-xs text-muted-foreground">
                  Сегодня: {analyticsStats.todaySalesCount}, За неделю: {analyticsStats.weekSalesCount}
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
                <div className="text-2xl font-bold">{analyticsStats.uniqueCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  Гостей без регистрации: {analyticsStats.guestSales}
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
                <div className="text-2xl font-bold">{analyticsStats.avgCheck.toLocaleString('ru-RU')} ₽</div>
                <p className="text-xs text-muted-foreground">
                  За неделю: {analyticsStats.weekRevenue.toLocaleString('ru-RU')} ₽
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StoreIcon className="h-5 w-5" />
                  Выручка по точкам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsStats.storeStats.map((store) => {
                    const maxRevenue = analyticsStats.storeStats[0]?.revenue || 1
                    const percent = maxRevenue > 0 ? (store.revenue / maxRevenue) * 100 : 0
                    return (
                      <div key={store.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{store.name}</span>
                          <span className="text-muted-foreground">
                            {store.revenue.toLocaleString('ru-RU')} ₽ ({store.salesCount} продаж)
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
                  {analyticsStats.topProducts.map((product, idx) => (
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
                        <p className="text-sm font-medium">{product.revenue.toLocaleString('ru-RU')} ₽</p>
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
                  {analyticsStats.categoryStats.map((cat) => {
                    const maxCount = Math.max(...analyticsStats.categoryStats.map(c => c.count))
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
                  {Object.entries(analyticsStats.paymentStats)
                    .sort(([, a], [, b]) => b - a)
                    .map(([method, amount]) => {
                      const total = Object.values(analyticsStats.paymentStats).reduce((a, b) => a + b, 0)
                      const percent = total > 0 ? (amount / total) * 100 : 0
                      return (
                        <div key={method} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS] || method}</span>
                            <span className="text-muted-foreground">{amount.toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <Progress value={percent} className="h-2" />
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <CRMLayout>
      <DashboardContent />
    </CRMLayout>
  )
}
