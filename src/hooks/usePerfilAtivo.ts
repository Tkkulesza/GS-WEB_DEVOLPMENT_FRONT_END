import { useContext } from 'react'
import { PerfilAtivoContext, type PerfilAtivoApi } from '../context/perfilAtivo'

/** Perfis, perfil ativo e ações de CRUD. Precisa do <PerfilAtivoProvider> acima. */
export function usePerfilAtivo(): PerfilAtivoApi {
  const api = useContext(PerfilAtivoContext)
  if (!api) throw new Error('usePerfilAtivo precisa estar dentro de <PerfilAtivoProvider>.')
  return api
}
