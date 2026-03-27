'use client'

import { useState } from 'react'
import { Search, AlertTriangle, Package, TrendingDown, TrendingUp } from 'lucide-react'
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
import { Progress } from '@/components/ui/progress'
import { useCRM } from '@/lib/store'
import { useInventory } from '@/hooks/api/useInventory'
import { useStores } from '@/hooks/api/useStores'
import { BEER_CATEGORIES } from '@/lib/types'

function InventoryContent() {
  const { currentStore } = useCRM()
  const [searchQuery, setSearchQuery] = useState('')
  const [storeFilter, setStoreFilter] = useState<string>(currentStore?.id || 'all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { inventory, lowStockItems, loading: inventoryLoading } = useInventory(
    storeFilter === 'all' ? undefined : storeFilter
  )
  const { stores, loading: storesLoading } = useStores()

  if (inventoryLoading || storesLoading) {
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

  const filteredInventory = inventory
    .filter((inv) => {
      const matchesSearch = inv.product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const isLowStock = inv.quantity <= inv.minQuantity
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'low' && isLowStock) ||
        (statusFilter === 'ok' && !isLowStock)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => a.quantity - b.quantity)

  const lowStockCount = lowStockItems.length

  const totalQuantity = filteredInventory.reduce(
    (sum, inv) => sum + inv.quantity,
    0
  )

  const getStockStatus = (quantity: number, minQuantity: number) => {
    const ratio = quantity / minQuantity
    if (ratio <= 1) return { label: 'Критично', color: 'text-destructive', bg: 'bg-destructive' }
    if (ratio <= 1.5) return { label: 'Мало', color: 'text-warning', bg: 'bg-warning' }
    return { label: 'В норме', color: 'text-success', bg: 'bg-success' }
  }

  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId)
    return store?.name.split(' - ')[1] || store?.name || storeId
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Склад</h1>
          <p className="text-muted-foreground">
            Остатки товаров и управление запасами
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <TrendingDown className="mr-2 h-4 w-4" />
            Списание
          </Button>
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Приход товара
          </Button>
        </div>
      </div>

      {}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Всего на складе
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity.toFixed(0)} л</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Позиций
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInventory.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-warning/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-warning flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Низкий остаток
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Магазинов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storeFilter === 'all' ? stores.length : 1}
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
                placeholder="Поиск товара..."
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
                    {store.name.split(' - ')[1]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="low">Низкий остаток</SelectItem>
                <SelectItem value="ok">В норме</SelectItem>
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
                <TableHead className="w-[300px]">Товар</TableHead>
                <TableHead>Магазин</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Остаток</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[200px]">Уровень</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((inv) => {
                const status = getStockStatus(inv.quantity, inv.minQuantity)
                const fillPercentage = Math.min(
                  (inv.quantity / (inv.minQuantity * 3)) * 100,
                  100
                )
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inv.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.product.manufacturer}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getStoreName(inv.storeId)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {BEER_CATEGORIES[inv.product.category]}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${status.color}`}>
                        {inv.quantity} л
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        / мин {inv.minQuantity} л
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${
                          status.label === 'Критично'
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : status.label === 'Мало'
                            ? 'bg-warning/10 text-warning border-warning/20'
                            : 'bg-success/10 text-success border-success/20'
                        }`}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={fillPercentage}
                          className={`h-2 flex-1 ${
                            status.label === 'Критично'
                              ? '[&>div]:bg-destructive'
                              : status.label === 'Мало'
                              ? '[&>div]:bg-warning'
                              : '[&>div]:bg-success'
                          }`}
                        />
                        <span className="text-xs text-muted-foreground w-10">
                          {fillPercentage.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <CRMLayout>
      <InventoryContent />
    </CRMLayout>
  )
}
