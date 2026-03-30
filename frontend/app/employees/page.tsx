'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, UserCog, Calendar, Store } from 'lucide-react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { CRMLayout } from '@/components/crm/crm-layout'
import { employees, users, stores } from '@/lib/mock-data'
import { CrmEmptyState } from '@/components/crm/crm-empty-state'

function EmployeesContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [storeFilter, setStoreFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredEmployees = employees.filter((employee) => {
    const user = users.find(u => u.id === employee.userId)
    if (!user) return false
    
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStore = storeFilter === 'all' || employee.storeId === storeFilter
    
    return matchesSearch && matchesStore
  })

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    return store ? store.name.split(' - ')[1] : storeId
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Админ</Badge>
      case 'manager': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Менеджер</Badge>
      case 'seller': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Продавец</Badge>
      default: return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Сотрудники</h1>
          <p className="text-muted-foreground">
            Управление персоналом и правами доступа в системе
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить сотрудника
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Новый сотрудник</DialogTitle>
              <DialogDescription>
                Добавьте нового сотрудника в систему
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">ФИО</Label>
                <Input id="name" placeholder="Иван Иванов" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="employee@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Роль</Label>
                  <Select defaultValue="seller">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Менеджер</SelectItem>
                      <SelectItem value="seller">Продавец</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="store">Магазин</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите магазин" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map(store => (
                        <SelectItem key={store.id} value={store.id}>{getStoreName(store.id)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Добавить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Store className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Магазин" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все магазины</SelectItem>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id}>{getStoreName(store.id)}</SelectItem>
                ))}
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
                <TableHead className="w-[250px]">Сотрудник</TableHead>
                <TableHead>Роль / Должность</TableHead>
                <TableHead>Магазин</TableHead>
                <TableHead>Зарплата</TableHead>
                <TableHead>Дата приема</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 || users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <CrmEmptyState
                      className="min-h-0 border-0 py-10"
                      icon={UserCog}
                      title="Нет сотрудников"
                      description="Список сотрудников пуст. Данные появятся после наполнения базы или кадрового модуля."
                    />
                  </TableCell>
                </TableRow>
              ) : null}
              {employees.length > 0 && filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Ничего не найдено по текущим фильтрам.
                  </TableCell>
                </TableRow>
              ) : null}
              {filteredEmployees.map((employee) => {
                const user = users.find(u => u.id === employee.userId)
                if (!user) return null
                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getRoleBadge(user.role)}
                        <span className="text-xs text-muted-foreground">{employee.position}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      <div className="flex items-center gap-1.5">
                        <Store className="h-3.5 w-3.5 text-muted-foreground" />
                        {getStoreName(employee.storeId)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {employee.salary.toLocaleString('ru-RU')} ₽
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(employee.hiredAt).toLocaleDateString('ru-RU')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Уволить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default function EmployeesPage() {
  return (
    <CRMLayout>
      <EmployeesContent />
    </CRMLayout>
  )
}
