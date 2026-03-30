'use client'

import { useState } from 'react'
import { Search, Calendar, Receipt, CreditCard, Banknote, ArrowUpDown } from 'lucide-react'
import { CRMLayout } from '@/components/crm/crm-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCRM } from '@/lib/store'
import { useSales } from '@/hooks/api/useSales'
import { useDashboard } from '@/hooks/api/useDashboard'
import { useStores } from '@/hooks/api/useStores'
import { PAYMENT_METHODS } from '@/lib/types'
import { CrmEmptyState } from '@/components/crm/crm-empty-state'

function SalesContent() {
  const { currentStore } = useCRM()
  const [searchQuery, setSearchQuery] = useState('')
  const [storeFilter, setStoreFilter] = useState<string>(currentStore?.id || 'all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [selectedSale, setSelectedSale] = useState<any>(null)

  const { sales, loading: salesLoading, error: salesError } = useSales(storeFilter === 'all' ? undefined : storeFilter)
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboard(storeFilter === 'all' ? undefined : storeFilter)
  const { stores, loading: storesLoading } = useStores()

  if (salesLoading || dashboardLoading || storesLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-48 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-card rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (salesError || dashboardError || !dashboardData) {
    return (
      <CrmEmptyState
        icon={Receipt}
        title="Нет данных"
        description="Не удалось загрузить продажи или сводку. Возможно, база данных пуста или сервер недоступен."
      />
    )
  }

  const { todayStats, weekStats } = dashboardData

  const filteredSales = sales
    .filter((sale: any) => {
      const matchesSearch =
        !searchQuery ||
        sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStore = storeFilter === 'all' || sale.storeId === storeFilter
      const matchesPayment =
        paymentFilter === 'all' || sale.paymentMethod === paymentFilter
      return matchesSearch && matchesStore && matchesPayment
    })
    .slice(0, 50) 

  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId)
    return store?.name.split(' - ')[1] || store?.name || storeId
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />
      case 'cash':
        return <Banknote className="h-4 w-4" />
      default:
        return <ArrowUpDown className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Продажи</h1>
          <p className="text-muted-foreground">История продаж и чеков</p>
        </div>
        <Button>
          <Receipt className="mr-2 h-4 w-4" />
          Новая продажа
        </Button>
      </div>

      {}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Выручка сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayStats.revenue.toLocaleString('ru-RU')} ₽
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Продаж сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.salesCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Средний чек
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayStats.averageCheck.toLocaleString('ru-RU')} ₽
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              За неделю
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weekStats.revenue.toLocaleString('ru-RU')} ₽
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по номеру чека или клиенту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Магазин" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все магазины</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name.split(' - ')[1] ?? store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Оплата" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все способы</SelectItem>
                <SelectItem value="cash">Наличные</SelectItem>
                <SelectItem value="card">Карта</SelectItem>
                <SelectItem value="transfer">Перевод</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Чек</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Магазин</TableHead>
                <TableHead>Продавец</TableHead>
                <TableHead>Оплата</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <CrmEmptyState
                      className="min-h-0 border-0 py-10"
                      icon={Receipt}
                      title="Нет продаж"
                      description="История чеков пуста. Возможно, в базе ещё нет продаж по выбранным фильтрам."
                    />
                  </TableCell>
                </TableRow>
              ) : null}
              {filteredSales.map((sale: any) => {
                return (
                  <Dialog key={sale.id}>
                    <DialogTrigger asChild>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <TableCell>
                          <code className="text-xs bg-secondary px-2 py-1 rounded">
                            #{sale.id.split('-')[1]}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {sale.customerName ? getInitials(sale.customerName) : 'Г'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {sale.customerName || 'Гость'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getStoreName(sale.storeId)}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {sale.sellerName || 'Сотрудник'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getPaymentIcon(sale.paymentMethod)}
                            <span className="text-xs">
                              {PAYMENT_METHODS[sale.paymentMethod as keyof typeof PAYMENT_METHODS] ??
                                sale.paymentMethod}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(sale.createdAt)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {sale.total.toLocaleString('ru-RU')} ₽
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-card border-border">
                      <DialogHeader>
                        <DialogTitle>Чек #{sale.id.split('-')[1]}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex justify-between text-sm border-b border-border pb-2">
                          <span className="text-muted-foreground">Дата:</span>
                          <span>{formatDate(sale.createdAt)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-b border-border pb-2">
                          <span className="text-muted-foreground">Продавец:</span>
                          <span>{sale.sellerName || 'Сотрудник'}</span>
                        </div>
                        <div className="flex justify-between text-sm border-b border-border pb-2">
                          <span className="text-muted-foreground">Клиент:</span>
                          <span>{sale.customerName || 'Гость'}</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Товары:</p>
                          {sale.items.map((item: any, idx: number) => {
                            return (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>Товар #{item.productId.split('-')[1]} x {item.quantity}л</span>
                                <span>{item.total.toLocaleString('ru-RU')} ₽</span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                          <span>Итого:</span>
                          <span>{sale.total.toLocaleString('ru-RU')} ₽</span>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SalesPage() {
  return (
    <CRMLayout>
      <SalesContent />
    </CRMLayout>
  )
}
