'use client'

import { createContext, useContext } from 'react'
import type { User, Store } from './types'
import { users, stores } from './mock-data'

export interface CRMState {
  currentUser: User
  currentStore: Store | null 
  setCurrentStore: (store: Store | null) => void
  setCurrentUser: (user: User) => void
}


const defaultUser = users[0]
const defaultStore = null 

export const CRMContext = createContext<CRMState>({
  currentUser: defaultUser,
  currentStore: defaultStore,
  setCurrentStore: () => {},
  setCurrentUser: () => {},
})

export const useCRM = () => useContext(CRMContext)


export const initialState = {
  currentUser: defaultUser,
  currentStore: defaultStore,
  stores,
  users,
}
