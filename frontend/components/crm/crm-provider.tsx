'use client'

import { useState, type ReactNode } from 'react'
import { CRMContext } from '@/lib/store'
import type { User, Store } from '@/lib/types'
import { users } from '@/lib/mock-data'

interface CRMProviderProps {
  children: ReactNode
}

export function CRMProvider({ children }: CRMProviderProps) {
  const [currentUser, setCurrentUser] = useState<User>(users[0])
  const [currentStore, setCurrentStore] = useState<Store | null>(null)

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
