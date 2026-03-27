'use client'

import { createContext, useContext } from 'react'
import type { User, Store } from './types'

export interface CRMState {
  currentUser: User | null
  currentStore: Store | null 
  setCurrentStore: (store: Store | null) => void
  setCurrentUser: (user: User | null) => void
}

export const CRMContext = createContext<CRMState>({
  currentUser: null,
  currentStore: null,
  setCurrentStore: () => {},
  setCurrentUser: () => {},
})

export const useCRM = () => useContext(CRMContext)
