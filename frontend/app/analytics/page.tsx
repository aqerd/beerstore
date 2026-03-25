'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Calendar, ArrowUpRight, ArrowDownRight, PieChart, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CRMLayout } from '@/components/crm/crm-layout'
import { stores } from '@/lib/mock-data'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
} from 'recharts'

const revenueData = [
  { name: 'Янв', value: 450000 },
  { name: 'Фев', value: 520000 },
  { name: 'Мар', value: 480000 },
  { name: 'Апр', value: 610000 },
  { name: 'Май', value: 590000 },
  { name: 'Июн', value: 720000 },
]

const categoryData = [
  { name: 'Светлое', value: 45, color: '#f59e0b' },
  { name: 'Темное', value: 25, color: '#78350f' },
  { name: 'Крафт', value: 15, color: '#8b5cf6' },
  { name: 'Сидр', value: 10, color: '#10b981' },
  { name: 'Импорт', value: 5, color: '#3b82f6' },
]

function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState('6months')

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
          <p className="text-muted-foreground">
            Детальные отчеты по продажам, клиентам и эффективности сети
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Последние 7 дней</SelectItem>
              <SelectItem value="30days">Последние 30 дней</SelectItem>
              <SelectItem value="6months">Последние 6 месяцев</SelectItem>
              <SelectItem value="year">За год</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,370,000 ₽</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              +20.1% с прошлого месяца
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">842 ₽</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              +4.5% с прошлого месяца
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Новые клиенты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+245</div>
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3" />
              -2% с прошлого месяца
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Конверсия бонусов</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              +1.2% с прошлого месяца
            </p>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-card border-border">
          <CardHeader>
            <CardTitle>Динамика выручки</CardTitle>
            <CardDescription>Изменение выручки по месяцам</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.75 0.18 75)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="oklch(0.75 0.18 75)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.25 0.005 250)"/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="oklch(0.65 0 0)" fontSize={12}/>
                  <YAxis axisLine={false} tickLine={false} stroke="oklch(0.65 0 0)" fontSize={12} tickFormatter={(value) => `${value/1000}к`}/>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'oklch(0.16 0.005 250)', border: '1px solid oklch(0.25 0.005 250)', borderRadius: '8px' }}
                    itemStyle={{ color: 'oklch(0.95 0 0)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="oklch(0.75 0.18 75)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-card border-border">
          <CardHeader>
            <CardTitle>Продажи по категориям</CardTitle>
            <CardDescription>Доля категорий в общем объеме</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'oklch(0.16 0.005 250)', border: '1px solid oklch(0.25 0.005 250)', borderRadius: '8px' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
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
