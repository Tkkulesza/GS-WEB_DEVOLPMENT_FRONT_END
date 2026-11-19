import { createContext } from 'react'

export type TipoToast = 'sucesso' | 'info' | 'erro'

export interface ToastItem {
  id: number
  mensagem: string
  tipo: TipoToast
}

export interface ToastApi {
  mostrar: (mensagem: string, tipo?: TipoToast) => void
}

export const ToastContext = createContext<ToastApi | null>(null)
