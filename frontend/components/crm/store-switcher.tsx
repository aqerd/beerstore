'use client'

import { Check, ChevronsUpDown, Store as StoreIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useCRM } from '@/lib/store'
import { stores } from '@/lib/mock-data'
import { useState, useEffect } from 'react'

export function StoreSwitcher() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const { currentStore, setCurrentStore } = useCRM()

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayName = !mounted 
    ? 'Загрузка...' 
    : currentStore
    ? currentStore.name.split(' - ')[1] || currentStore.name
    : 'Все магазины'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between bg-secondary/50 border-0 hover:bg-zinc-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <StoreIcon className="h-4 w-4 text-primary" />
            <span className="truncate">{displayName}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Поиск магазина..." />
          <CommandList>
            <CommandEmpty>Магазин не найден</CommandEmpty>
            <CommandGroup heading="Выбор точки">
              <CommandItem
                value="all"
                onSelect={() => {
                  setCurrentStore(null)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    currentStore === null ? 'opacity-100' : 'opacity-0'
                  )}
                />
                Все магазины
              </CommandItem>
              <CommandSeparator />
              {stores.map((store) => {
                const shortName = store.name.split(' - ')[1] || store.name
                return (
                  <CommandItem
                    key={store.id}
                    value={store.id}
                    onSelect={() => {
                      setCurrentStore(store)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        currentStore?.id === store.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {shortName}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
