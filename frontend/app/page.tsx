'use client'

import { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CRMLayout } from '@/components/crm/crm-layout'
import { StatsCard } from '@/components/crm/stats-card'
import { RecentSales } from '@/components/crm/recent-sales'
import { TopProducts } from '@/components/crm/top-products'
import { useCRM } from '@/lib/store'
import { useDashboard } from '@/hooks/api/useDashboard'
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
