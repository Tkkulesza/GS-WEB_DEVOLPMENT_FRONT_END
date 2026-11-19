import { useContext } from 'react'
import { ToastContext, type ToastApi } from '../context/toastContext'

/** Mostra avisos curtos (ex.: "Perfil salvo"). Precisa do <ToastProvider> acima. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast precisa estar dentro de <ToastProvider>.')
  return api
}
