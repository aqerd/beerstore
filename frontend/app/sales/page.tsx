'use client'

import { useState, useMemo } from 'react'
import { Search, Calendar, Receipt, CreditCard, Banknote, ArrowUpDown, Plus, X, User, Phone, Package, Store as StoreIcon } from 'lucide-react'
import { CRMLayout } from '@/components/crm/crm-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { useCRM } from '@/lib/store'
import { useSales } from '@/hooks/api/useSales'
import { useDashboard } from '@/hooks/api/useDashboard'
import { useStores } from '@/hooks/api/useStores'
import { useProducts } from '@/hooks/api/useProducts'
import { PAYMENT_METHODS, BEER_CATEGORIES, type Store } from '@/lib/types'
import { CrmEmptyState } from '@/components/crm/crm-empty-state'
import { api } from '@/lib/api-client'

interface SaleItem {
  productId: string
  quantity: number
  pricePerLiter: number
  total: number
  productName?: string
}

function NewSaleDialog({ onSaleCreated, defaultStoreId, sellerId, stores }: { onSaleCreated: () => void, defaultStoreId: string, sellerId: string, stores: Store[] }) {
  const [open, setOpen] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState(defaultStoreId)
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [items, setItems] = useState<SaleItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [loading, setLoading] = useState(false)

  const { products } = useProducts()
  const currentStore = stores.find(s => s.id === selectedStoreId)

  const availableProducts = products.filter(p => p.isActive)

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0)

  const addItem = () => {
    if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) return

    const product = products.find(p => p.id === selectedProduct)
    if (!product) return

    const qty = parseFloat(quantity)
    const item: SaleItem = {
      productId: product.id,
      productName: product.name,
      quantity: qty,
      pricePerLiter: product.pricePerLiter,
      total: Math.round(qty * product.pricePerLiter * 100) / 100
    }

    setItems([...items, item])
    setSelectedProduct('')
    setQuantity('1')
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (items.length === 0) return
    if (!selectedStoreId || !sellerId) {
      alert('Не выбран магазин или продавец')
      return
    }

    setLoading(true)
    try {
      await api.sales.create({
        storeId: selectedStoreId,
        sellerId,
        customerName: customerName || 'Гость',
        phone: phone || undefined,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          pricePerLiter: item.pricePerLiter,
          total: item.total
        })),
        paymentMethod
      })
      setOpen(false)
      setCustomerName('')
      setPhone('')
      setItems([])
      setPaymentMethod('card')
      setSelectedStoreId(defaultStoreId)
      onSaleCreated()
    } catch (error) {
      console.error('Failed to create sale:', error)
      alert('Ошибка при создании чека')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    return BEER_CATEGORIES[category as keyof typeof BEER_CATEGORIES] || category
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Новая продажа
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новая продажа</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Store selection */}
          <div className="space-y-2">
            <Label htmlFor="store" className="flex items-center gap-2">
              <StoreIcon className="h-4 w-4" />
              Магазин
            </Label>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger id="store">
                <SelectValue placeholder="Выберите магазин" />
              </SelectTrigger>
              <SelectContent>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name.split(' - ')[1] || store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Клиент
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Имя</Label>
                <Input
                  id="customerName"
                  placeholder="Гость"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Телефон
                </Label>
                <Input
                  id="phone"
                  placeholder="+7 (XXX) XXX-XX-XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Товары
            </h4>

            <div className="flex gap-2">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Выберите товар" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{product.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {product.pricePerLiter} ₽/л
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Литров"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-28"
              />
              <Button type="button" onClick={addItem} disabled={!selectedProduct}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {items.length > 0 && (
              <div className="border rounded-lg divide-y">
                {items.map((item, idx) => {
                  const product = products.find(p => p.id === item.productId)
                  return (
                    <div key={idx} className="flex items-center justify-between p-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} л × {item.pricePerLiter} ₽/л
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{item.total.toFixed(2)} ₽</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(idx)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <Label>Способ оплаты</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Карта</SelectItem>
                <SelectItem value="cash">Наличные</SelectItem>
                <SelectItem value="transfer">Перевод</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Итого:</span>
              <span className="text-2xl font-bold">{totalAmount.toFixed(2)} ₽</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={items.length === 0 || loading || !storeId}
          >
            {loading ? 'Сохранение...' : 'Создать чек'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SalesContent() {
  const { currentStore, currentUser } = useCRM()
  const [searchQuery, setSearchQuery] = useState('')
  const [storeFilter, setStoreFilter] = useState<string>(currentStore?.id || 'all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const { sales, loading: salesLoading, error: salesError, refresh: refreshSales } = useSales(storeFilter === 'all' ? undefined : storeFilter)
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = useDashboard(storeFilter === 'all' ? undefined : storeFilter)
  const { stores, loading: storesLoading } = useStores()

  const handleSaleCreated = () => {
    refreshSales()
    refreshDashboard()
  }

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

  const effectiveStoreId = currentStore?.id || stores[0]?.id || ''
  const effectiveSellerId = currentUser?.id || 'user-1'

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Продажи</h1>
          <p className="text-muted-foreground">История продаж и чеков</p>
        </div>
        <NewSaleDialog
          onSaleCreated={handleSaleCreated}
          defaultStoreId={effectiveStoreId}
          sellerId={effectiveSellerId}
          stores={stores}
        />
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
