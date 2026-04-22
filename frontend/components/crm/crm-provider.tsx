'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { CRMContext } from '@/lib/store'
import type { User, Store } from '@/lib/types'
import { api } from '@/lib/api-client'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface CRMProviderProps {
  children: ReactNode
}

const PUBLIC_PATHS = ['/login']

export function CRMProvider({ children }: CRMProviderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentStore, setCurrentStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initSession() {
      try {
        const storedUser = sessionStorage.getItem('user')
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser)
            setCurrentUser(user)
          } catch {
            sessionStorage.removeItem('user')
          }
        }

        const stores = await api.stores.list()
        if (stores.length > 0) {
          setCurrentStore(stores[0])
        }

        if (!storedUser && !PUBLIC_PATHS.includes(pathname || '')) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Session initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }
    initSession()
  }, [pathname, router])

  useEffect(() => {
    if (!loading && !currentUser && !PUBLIC_PATHS.includes(pathname || '')) {
      router.push('/login')
    }
  }, [loading, currentUser, pathname, router])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <CRMContext.Provider
      value={{
        currentUser,
        currentStore,
        setCurrentStore,
        setCurrentUser,
      }}
    >
      {children}
    </CRMContext.Provider>
  )
}
