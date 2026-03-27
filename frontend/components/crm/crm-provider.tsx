'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { CRMContext } from '@/lib/store'
import type { User, Store } from '@/lib/types'
import { users } from '@/lib/mock-data'
import { api } from '@/lib/api-client'

interface CRMProviderProps {
  children: ReactNode
}

export function CRMProvider({ children }: CRMProviderProps) {
  const [currentUser, setCurrentUser] = useState<User>(users[0])
  const [currentStore, setCurrentStore] = useState<Store | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initData() {
      try {
        const fetchedStores = await api.stores.list()
        setStores(fetchedStores)
      } catch (error) {
        console.error('Failed to fetch stores from API, using mock data:', error)
      } finally {
        setLoading(false)
      }
    }
    initData()
  }, [])

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
