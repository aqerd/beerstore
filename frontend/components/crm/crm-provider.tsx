'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { CRMContext } from '@/lib/store'
import type { User, Store } from '@/lib/types'
import { api } from '@/lib/api-client'

interface CRMProviderProps {
  children: ReactNode
}

export function CRMProvider({ children }: CRMProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentStore, setCurrentStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initSession() {
      try {
        const stores = await api.stores.list()
        if (stores.length > 0) {
          setCurrentStore(stores[0])
        }
        
        const users = await api.auth.login({ username: 'test', password: 'test' })
        if (users && users.user) {
          setCurrentUser(users.user)
        }
      } catch (error) {
        console.error('Session initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }
    initSession()
  }, [])

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
