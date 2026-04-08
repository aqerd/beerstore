'use client'

import { useMemo, useState } from 'react'
import { Search, Receipt, CreditCard, Banknote, ArrowUpDown, Plus, Trash2 } from 'lucide-react'
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
} from '@/components/ui/dialog'
import { useCRM } from '@/lib/store'
import { useSales } from '@/hooks/api/useSales'
import { useDashboard } from '@/hooks/api/useDashboard'
import { useStores } from '@/hooks/api/useStores'
import { useProducts } from '@/hooks/api/useProducts'
import { PAYMENT_METHODS } from '@/lib/types'
import { CrmEmptyState } from '@/components/crm/crm-empty-state'
import { api } from '@/lib/api-client'

function SalesContent() {
  const { currentStore } = useCRM()
  const [searchQuery, setSearchQuery] = useState('')
  const [storeFilter, setStoreFilter] = useState<string>(currentStore?.id || 'all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [form, setForm] = useState<any>({
    storeId: currentStore?.id || 'store-1',
    sellerId: 'cashier-auto',
    customerName: '',
    customerPhone: '',
    paymentMethod: 'cash',
    bonusToUse: '0',
    items: [{ productId: 'prod-1', quantity: '1' }],
  })

  const {
    sales,
    loading: salesLoading,
    error: salesError,
    refresh: refreshSales,
    prependSale,
  } = useSales(storeFilter === 'all' ? undefined : storeFilter)
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard,
  } = useDashboard(storeFilter === 'all' ? undefined : storeFilter)
  const { stores, loading: storesLoading } = useStores()
  const { products } = useProducts()

  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products])

  if (salesLoading || dashboardLoading || storesLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-48 rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-card" />
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
      const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter
      return matchesSearch && matchesStore && matchesPayment
    })
    .slice(0, 50)

  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId)
    return store?.name.split(' - ')[1] || store?.name || storeId
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()

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

  const formTotal = form.items.reduce((acc: number, item: any) => {
    const product = productMap[item.productId]
    const qty = Number(item.quantity || 0)
    return acc + (product?.pricePerLiter || 0) * qty
  }, 0)

  const updateItem = (idx: number, patch: any) => {
    const next = [...form.items]
    next[idx] = { ...next[idx], ...patch }
    setForm({ ...form, items: next })
  }

  const addItem = () =>
    setForm({
      ...form,
      items: [...form.items, { productId: products[0]?.id || 'prod-1', quantity: '1' }],
    })

  const removeItem = (idx: number) =>
    setForm({ ...form, items: form.items.filter((_: any, i: number) => i !== idx) })

  const submitSale = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const createdSale = await api.sales.create({
        storeId: form.storeId,
        sellerId: form.sellerId,
        customerName: form.customerName || undefined,
        customerPhone: form.customerPhone || undefined,
        paymentMethod: form.paymentMethod,
        bonusToUse: Number(form.bonusToUse || 0),
        items: form.items.map((item: any) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),
      } as any)

      prependSale(createdSale)
      await Promise.all([refreshSales(), refreshDashboard()])
      setSelectedSale(createdSale)
      setCreateOpen(false)
      setForm({
        ...form,
        customerName: '',
        customerPhone: '',
        bonusToUse: '0',
        items: [{ productId: products[0]?.id || 'prod-1', quantity: '1' }],
      })
    } catch (e: any) {
      setSubmitError(e?.message || 'Не удалось оформить продажу')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Продажи</h1>
          <p className="text-muted-foreground">История продаж и чеков</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Receipt className="mr-2 h-4 w-4" />
          Новая продажа
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Выручка сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.revenue.toLocaleString('ru-RU')} ₽</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Продаж сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.salesCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Средний чек</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.averageCheck.toLocaleString('ru-RU')} ₽</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">За неделю</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.revenue.toLocaleString('ru-RU')} ₽</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
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

      <Card className="border-border bg-card">
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
              {filteredSales.map((sale: any) => (
                <TableRow
                  key={sale.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedSale(sale)}
                >
                  <TableCell>
                    <code className="rounded bg-secondary px-2 py-1 text-xs">#{sale.id.split('-')[1]}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {sale.customerName ? getInitials(sale.customerName) : 'Г'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{sale.customerName || 'Гость'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getStoreName(sale.storeId)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{sale.sellerName || 'Сотрудник'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getPaymentIcon(sale.paymentMethod)}
                      <span className="text-xs">
                        {PAYMENT_METHODS[sale.paymentMethod as keyof typeof PAYMENT_METHODS] ?? sale.paymentMethod}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</TableCell>
                  <TableCell className="text-right font-medium">{sale.total.toLocaleString('ru-RU')} ₽</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto border-border bg-card p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle>Оформление продажи</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Магазин</div>
                <Select value={form.storeId} onValueChange={(value) => setForm({ ...form, storeId: value })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Магазин" /></SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Способ оплаты</div>
                <Select value={form.paymentMethod} onValueChange={(value) => setForm({ ...form, paymentMethod: value })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Способ оплаты" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Наличные</SelectItem>
                    <SelectItem value="card">Карта</SelectItem>
                    <SelectItem value="transfer">Перевод</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Имя клиента</div>
                <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Имя клиента" className="w-full" />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Телефон клиента</div>
                <Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="Телефон клиента" className="w-full" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">Позиции чека</div>
              {form.items.map((item: any, idx: number) => (
                <div key={idx} className="grid items-end gap-3 lg:grid-cols-[minmax(0,1fr)_140px_48px]">
                  <div className="space-y-2 min-w-0">
                    <div className="text-sm text-muted-foreground">Товар</div>
                    <Select value={item.productId} onValueChange={(value) => updateItem(idx, { productId: value })}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Товар" /></SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>{product.name} · {product.pricePerLiter} ₽/л</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Кол-во, л</div>
                    <Input type="number" min="0.1" step="0.1" value={item.quantity} onChange={(e) => updateItem(idx, { quantity: e.target.value })} className="w-full" />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => removeItem(idx)} disabled={form.items.length === 1} className="shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addItem} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />Добавить позицию
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Списать бонусов</div>
                <Input type="number" min="0" step="1" value={form.bonusToUse} onChange={(e) => setForm({ ...form, bonusToUse: e.target.value })} className="w-full" />
              </div>
              <div className="rounded-lg border border-border p-4 text-right">
                <div className="text-sm text-muted-foreground">Сумма по чеку</div>
                <div className="text-2xl font-semibold">{formTotal.toLocaleString('ru-RU')} ₽</div>
              </div>
            </div>

            {submitError ? <div className="text-sm text-destructive">{submitError}</div> : null}

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="w-full sm:w-auto">Отмена</Button>
              <Button onClick={submitSale} disabled={submitting || form.items.length === 0} className="w-full sm:w-auto">
                {submitting ? 'Сохраняю...' : 'Пробить чек'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedSale)} onOpenChange={(open) => !open && setSelectedSale(null)}>
        <DialogContent className="max-w-md border-border bg-card">
          {selectedSale ? (
            <>
              <DialogHeader>
                <DialogTitle>Чек #{selectedSale.id.split('-')[1]}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex justify-between border-b border-border pb-2 text-sm"><span className="text-muted-foreground">Дата:</span><span>{formatDate(selectedSale.createdAt)}</span></div>
                <div className="flex justify-between border-b border-border pb-2 text-sm"><span className="text-muted-foreground">Продавец:</span><span>{selectedSale.sellerName || 'Сотрудник'}</span></div>
                <div className="flex justify-between border-b border-border pb-2 text-sm"><span className="text-muted-foreground">Клиент:</span><span>{selectedSale.customerName || 'Гость'}</span></div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Товары:</p>
                  {selectedSale.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between gap-4 text-sm">
                      <span className="min-w-0 flex-1 truncate">{productMap[item.productId]?.name || `Товар #${item.productId}`} x {item.quantity} л</span>
                      <span>{item.total.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-lg font-bold"><span>Итого:</span><span>{selectedSale.total.toLocaleString('ru-RU')} ₽</span></div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
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
