'use client'

import { useMemo, useState } from 'react'
import { BarChart3, DollarSign, Activity, Users, Calendar, PieChart, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CRMLayout } from '@/components/crm/crm-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStores } from '@/hooks/api/useStores'
import { useManagementReport } from '@/hooks/api/useManagementReport'
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts'

function formatISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

function AnalyticsContent() {
  const [storeId, setStoreId] = useState<string>('all')
  const [startDate, setStartDate] = useState(formatISO(new Date(Date.now() - 29 * 24 * 3600 * 1000)))
  const [endDate, setEndDate] = useState(formatISO(new Date()))
  const { stores } = useStores()
  const { data, loading, error } = useManagementReport({
    storeId: storeId === 'all' ? undefined : storeId,
    startDate,
    endDate,
  })

  const paymentData = useMemo(() => (data?.salesByPaymentMethod || []).map((item: any) => ({ name: item.paymentMethod, value: item.revenue })), [data])

  const exportReport = () => {
    if (!data) return
    const payload = JSON.stringify(data, null, 2)
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `management-report-${startDate}-${endDate}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="space-y-6 animate-pulse"><div className="h-12 w-60 bg-muted rounded" /><div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-card rounded-xl" />)}</div></div>
  }

  if (error || !data) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Не удалось сформировать управленческий отчёт.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
          <p className="text-muted-foreground">Управленческий отчёт по витринам фактов и измерений</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}><Download className="mr-2 h-4 w-4" />Выгрузить отчёт</Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-4 grid gap-4 md:grid-cols-4">
          <div>
            <div className="mb-2 text-sm text-muted-foreground">Магазин</div>
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger><SelectValue placeholder="Все магазины" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Вся сеть</SelectItem>
                {stores.map((store) => <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="mb-2 text-sm text-muted-foreground">Дата с</div>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 text-sm text-muted-foreground">Дата по</div>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="text-sm text-muted-foreground">Период</div>
            <div className="font-medium">{data.period.startDate} — {data.period.endDate}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Выручка</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.summary.revenue.toLocaleString('ru-RU')} ₽</div><p className="text-xs text-muted-foreground mt-1">За выбранный период</p></CardContent></Card>
        <Card className="bg-card border-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Средний чек</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.summary.averageCheck.toLocaleString('ru-RU')} ₽</div><p className="text-xs text-muted-foreground mt-1">Чеков: {data.summary.receipts}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Активные клиенты</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.summary.activeCustomers}</div><p className="text-xs text-muted-foreground mt-1">Любимый сегмент: {data.customers.favoriteProductGroup}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Продано литров</CardTitle><PieChart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{data.summary.litersSold.toLocaleString('ru-RU')}</div><p className="text-xs text-muted-foreground mt-1">Средний час визита: {data.customers.avgVisitHour}:00</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-card border-border">
          <CardHeader><CardTitle>Динамика выручки</CardTitle><CardDescription>fact_sales + dim_date</CardDescription></CardHeader>
          <CardContent><div className="h-[350px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.revenueByDay}><defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="oklch(0.75 0.18 75)" stopOpacity={0.35}/><stop offset="95%" stopColor="oklch(0.75 0.18 75)" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.25 0.005 250)"/><XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12}/><YAxis tickLine={false} axisLine={false} fontSize={12}/><Tooltip /><Area type="monotone" dataKey="revenue" stroke="oklch(0.75 0.18 75)" fill="url(#colorRevenue)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></CardContent>
        </Card>
        <Card className="lg:col-span-3 bg-card border-border">
          <CardHeader><CardTitle>Продажи по способам оплаты</CardTitle><CardDescription>fact_sales + dim_payment_method</CardDescription></CardHeader>
          <CardContent>
            <div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><RechartsPieChart><Pie data={paymentData} cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={4} dataKey="value">{paymentData.map((_: any, index: number) => <Cell key={index} fill={["#f59e0b", "#3b82f6", "#8b5cf6"][index % 3]} />)}</Pie><Tooltip /></RechartsPieChart></ResponsiveContainer></div>
            <div className="mt-4 space-y-2">{data.salesByPaymentMethod.map((item: any) => <div key={item.paymentMethod} className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{item.paymentMethod}</span><span className="font-medium">{item.revenue.toLocaleString('ru-RU')} ₽ / {item.receipts} чек.</span></div>)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Топ товаров</CardTitle><CardDescription>fact_sales + dim_product</CardDescription></CardHeader>
          <CardContent>
            <div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.topProducts}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.25 0.005 250)"/><XAxis dataKey="productName" tickLine={false} axisLine={false} fontSize={12}/><YAxis tickLine={false} axisLine={false} fontSize={12}/><Tooltip /><Bar dataKey="revenue" fill="oklch(0.65 0.16 230)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Эффективность персонала</CardTitle><CardDescription>fact_shift_performance + dim_employee</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {data.staffPerformance.map((item: any) => (
              <div key={item.employeeId} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-4"><div><div className="font-medium">{item.fullName}</div><div className="text-sm text-muted-foreground">{item.roleCode}</div></div><div className="text-right"><div className="font-semibold">{item.revenueAmount.toLocaleString('ru-RU')} ₽</div><div className="text-sm text-muted-foreground">{item.receiptCount} чеков · {item.workedHours} ч</div></div></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return <CRMLayout><AnalyticsContent /></CRMLayout>
}
