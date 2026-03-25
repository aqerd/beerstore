'use client'

import { Bell, Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { StoreSwitcher } from './store-switcher'
import { getLowStockItems } from '@/lib/mock-data'
import { useCRM } from '@/lib/store'
import { useState, useEffect } from 'react'

export function Header() {
  const [mounted, setMounted] = useState(false)
  const { currentStore } = useCRM()
  const lowStockItems = getLowStockItems(currentStore?.id)
  const alertCount = lowStockItems.length

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-2" />

      <div className="flex flex-1 items-center gap-4">
        <StoreSwitcher />

        <div className="relative ml-auto flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск товаров, клиентов..."
            className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {mounted && alertCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {alertCount > 9 ? '9+' : alertCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Уведомления</span>
            {mounted && alertCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {alertCount}
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {lowStockItems.length > 0 ? (
            <>
              {lowStockItems.slice(0, 5).map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className="flex flex-col items-start gap-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    <span className="font-medium text-sm">
                      Низкий остаток
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-4">
                    {item.product.name} - {item.quantity}л осталось в{' '}
                    {item.store.name.split(' - ')[1]}
                  </p>
                </DropdownMenuItem>
              ))}
              {lowStockItems.length > 5 && (
                <DropdownMenuItem className="text-center text-sm text-muted-foreground">
                  И ещё {lowStockItems.length - 5} уведомлений...
                </DropdownMenuItem>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Нет новых уведомлений
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
