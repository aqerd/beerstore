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
import {
  sales,
  stores,
  getProductById,
  getUserById,
  getCustomerById,
  getTodayStats,
  getWeekStats,
} from '@/lib/mock-data'
import { useCRM } from '@/lib/store'
import { PAYMENT_METHODS } from '@/lib/types'

function SalesContent() {
  const { currentStore } = useCRM()
  const [searchQuery, setSearchQuery] = useState('')
  const [storeFilter, setStoreFilter] = useState<string>(currentStore?.id || 'all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [selectedSale, setSelectedSale] = useState<typeof sales[0] | null>(null)

  const todayStats = getTodayStats(storeFilter === 'all' ? undefined : storeFilter)
  const weekStats = getWeekStats(storeFilter === 'all' ? undefined : storeFilter)

  const filteredSales = sales
    .filter((sale) => {
      const customer = sale.customerId ? getCustomerById(sale.customerId) : null
      const matchesSearch =
        !searchQuery ||
        sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.phone.includes(searchQuery)
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
                {}
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name.split(' - ')[1]}
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
              {filteredSales.map((sale) => {
                const customer = sale.customerId
                  ? getCustomerById(sale.customerId)
                  : null
                const seller = getUserById(sale.sellerId)
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
                                {customer ? getInitials(customer.name) : 'Г'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {customer?.name || 'Гость'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getStoreName(sale.storeId)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {seller?.name.split(' ')[0]}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentIcon(sale.paymentMethod)}
                            <span className="text-sm text-muted-foreground">
                              {PAYMENT_METHODS[sale.paymentMethod]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(sale.createdAt)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {sale.total.toLocaleString('ru-RU')} ₽
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Чек #{sale.id.split('-')[1]}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Дата:</span>
                          <span>{formatDate(sale.createdAt)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Магазин:</span>
                          <span>{getStoreName(sale.storeId)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Продавец:</span>
                          <span>{seller?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Клиент:</span>
                          <span>{customer?.name || 'Гость'}</span>
                        </div>
                        <div className="border-t border-border pt-4 space-y-2">
                          <p className="font-medium">Позиции:</p>
                          {sale.items.map((item, idx) => {
                            const product = getProductById(item.productId)
                            return (
                              <div
                                key={idx}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {product?.name} x {item.quantity}л
                                </span>
                                <span>{item.total.toLocaleString('ru-RU')} ₽</span>
                              </div>
                            )
                          })}
                        </div>
                        {sale.bonusUsed > 0 && (
                          <div className="flex justify-between text-sm text-success">
                            <span>Списано бонусов:</span>
                            <span>-{sale.bonusUsed} ₽</span>
                          </div>
                        )}
                        {sale.bonusEarned > 0 && (
                          <div className="flex justify-between text-sm text-primary">
                            <span>Начислено бонусов:</span>
                            <span>+{sale.bonusEarned}</span>
                          </div>
                        )}
                        <div className="border-t border-border pt-4 flex justify-between font-medium text-lg">
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
