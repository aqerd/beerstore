'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useCRM } from '@/lib/store'
import { useSalesChart } from '@/hooks/api/useSalesChart'

export function SalesChart() {
  const { currentStore } = useCRM()
  const { data: chartData, loading } = useSalesChart(14, currentStore?.id)

  if (loading) {
    return (
      <Card className="bg-card border-border col-span-full lg:col-span-2 animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 w-48 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Выручка за 2 недели
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="oklch(0.75 0.18 75)"
                    stopOpacity={0.3}
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
                vertical={false}
                stroke="oklch(0.25 0.005 250)"
              />
              <XAxis
                dataKey="displayDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}к` : value
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg bg-popover p-3 shadow-lg border border-border">
                        <p className="text-sm font-medium text-foreground">
                          {label}
                        </p>
                        <p className="text-sm text-primary">
                          {Number(payload[0].value).toLocaleString('ru-RU')} ₽
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payload[0].payload.sales} продаж
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.75 0.18 75)"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
