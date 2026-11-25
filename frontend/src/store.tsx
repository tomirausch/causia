import { createContext, useContext, useState, type ReactNode } from 'react'
import type { State } from './types'
import { initialState } from './data'

type Ctx = { s: State; set: (fn: (s: State) => State) => void; reset: () => void }
const C = createContext<Ctx>(null as unknown as Ctx)
export const useStore = () => useContext(C)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(initialState)
  return <C.Provider value={{ s, set: fn => setS(fn), reset: () => setS(initialState()) }}>{children}</C.Provider>
}
