'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCRM } from '@/lib/store'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Beer } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setCurrentUser } = useCRM()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await api.auth.login({ email, password })
      setCurrentUser(user)
      sessionStorage.setItem('user', JSON.stringify(user))
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Beer className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Жидкое Золото</CardTitle>
          <CardDescription>Вход в CRM систему</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@goldenliquid.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
          <div className="mt-4 p-3 text-xs text-muted-foreground bg-muted/50 rounded-md">
            <p className="font-medium mb-1">Тестовые учётные данные:</p>
            <p>admin@goldenliquid.ru / password</p>
            <p>manager1@goldenliquid.ru / password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
