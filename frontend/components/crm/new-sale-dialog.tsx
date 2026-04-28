'use client'

import { useState } from 'react'
import { Plus, User, Phone, Package, Store as StoreIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProducts } from '@/hooks/api/useProducts'
import { BEER_CATEGORIES, type Store, type Product } from '@/lib/types'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'

interface SaleItem {
  productId: string
  quantity: number
  pricePerLiter: number
  total: number
  productName?: string
}

interface NewSaleDialogProps {
  onSaleCreated: () => void
  defaultStoreId: string
  sellerId: string
  stores: Store[]
  trigger?: React.ReactNode
  initialProductId?: string
}

export function NewSaleDialog({ onSaleCreated, defaultStoreId, sellerId, stores, trigger, initialProductId }: NewSaleDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState(defaultStoreId)
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [items, setItems] = useState<SaleItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState(initialProductId || '')
  const [quantity, setQuantity] = useState('1')
  const [loading, setLoading] = useState(false)

  const { products } = useProducts()
  const availableProducts = products.filter(p => p.isActive)

  const addItem = () => {
    const qty = parseFloat(quantity)
    if (!selectedProduct || isNaN(qty) || qty <= 0) return

    const product = products.find(p => p.id === selectedProduct)
    if (!product) return
  
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
      toast.error('Не выбран магазин или продавец')
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
      toast.success('Продажа успешно создана, остатки на складе обновлены')
    } catch (error) {
      console.error('Failed to create sale:', error)
      toast.error(error instanceof Error ? error.message : 'Ошибка при создании чека')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Новая продажа
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новая продажа</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} л × {item.pricePerLiter} ₽/л
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{item.total} ₽</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-muted/30 flex justify-between items-center">
                  <span className="font-medium">Итого</span>
                  <span className="text-lg font-bold">{items.reduce((sum, i) => sum + i.total, 0)} ₽</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleSubmit} disabled={loading || items.length === 0}>
            {loading ? 'Создание...' : 'Завершить продажу'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
