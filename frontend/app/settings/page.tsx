'use client'

import { useState } from 'react'
import { Settings, User, Bell, Shield, Palette, Database, Save, LogOut } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CRMLayout } from '@/components/crm/crm-layout'
import { useCRM } from '@/lib/store'

function SettingsContent() {
  const { currentUser } = useCRM()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1500)
  }

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">
          Управление профилем, системными параметрами и уведомлениями
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Безопасность
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Внешний вид
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Система
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Данные пользователя</CardTitle>
              <CardDescription>Обновите свои личные данные и контактную информацию</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">ФИО</Label>
                  <Input id="name" defaultValue={currentUser?.name || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={currentUser?.email || ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" placeholder="+7 (999) 000-00-00" />
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>Настройте типы уведомлений, которые вы хотите получать</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="low-stock" className="flex flex-col space-y-1">
                  <span>Низкие остатки</span>
                  <span className="font-normal text-xs text-muted-foreground">Уведомлять при достижении критического остатка товара</span>
                </Label>
                <Switch id="low-stock" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="sales-report" className="flex flex-col space-y-1">
                  <span>Ежедневные отчеты</span>
                  <span className="font-normal text-xs text-muted-foreground">Получать сводку продаж в конце рабочего дня</span>
                </Label>
                <Switch id="sales-report" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="security-alerts" className="flex flex-col space-y-1">
                  <span>Оповещения безопасности</span>
                  <span className="font-normal text-xs text-muted-foreground">Уведомлять о входах в систему с новых устройств</span>
                </Label>
                <Switch id="security-alerts" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Изменение пароля</CardTitle>
              <CardDescription>Для смены пароля введите текущий и новый пароль</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Текущий пароль</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Новый пароль</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={handleSave}>Сменить пароль</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Тема оформления</CardTitle>
              <CardDescription>Выберите предпочтительную цветовую схему приложения</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="border-2 border-primary rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer bg-muted/20">
                <div className="h-10 w-full bg-slate-900 rounded border border-border" />
                <span className="text-sm font-medium">Темная</span>
              </div>
              <div className="border border-border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="h-10 w-full bg-white rounded border border-border" />
                <span className="text-sm font-medium">Светлая</span>
              </div>
              <div className="border border-border rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="h-10 w-full bg-slate-400 rounded border border-border" />
                <span className="text-sm font-medium">Системная</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <CRMLayout>
      <SettingsContent />
    </CRMLayout>
  )
}
