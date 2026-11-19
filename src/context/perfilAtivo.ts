import { createContext } from 'react'
import type { Perfil } from '../domain/types'
import type { UsePerfis } from '../hooks/usePerfis'

export interface PerfilAtivoApi extends UsePerfis {
  /** Perfil em uso no Início e no Histórico (null se não houver nenhum). */
  perfilAtivo: Perfil | null
  selecionarPerfil: (id: string) => void
}

export const PerfilAtivoContext = createContext<PerfilAtivoApi | null>(null)
