import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Perfil, PerfilInput } from '../domain/types'
import { foiCancelado, mensagemDeErro } from '../services/http'
import {
  atualizarPerfil,
  criarPerfil,
  excluirPerfilEmCascata,
  listarPerfis,
} from '../services/perfisService'
import { criarAuditoria } from '../services/registrosService'

export const AVISO_DESCARTADOS =
  'Alguns dados vieram num formato inesperado e ficaram de fora desta lista.'

interface EstadoLista {
  perfis: Perfil[]
  erro: string | null
  aviso: string | null
  /** Qual carregamento produziu este estado (para derivar `carregando`). */
  versaoCarregada: number
}

export interface UsePerfis {
  perfis: Perfil[]
  carregando: boolean
  erro: string | null
  aviso: string | null
  criar: (dados: PerfilInput) => Promise<Perfil>
  atualizar: (id: string, dados: PerfilInput) => Promise<Perfil>
  remover: (id: string) => Promise<void>
  recarregar: () => void
}

/**
 * Auditoria não pode impedir a ação principal: se falhar, a ação segue.
 * (Limitação do protótipo: sem backend, não há como garantir atomicidade.)
 */
async function auditar(...args: Parameters<typeof criarAuditoria>) {
  try {
    await criarAuditoria(...args)
  } catch {
    // ignorado de propósito
  }
}

/** CRUD de perfis + registro de auditoria de cada mudança. */
export function usePerfis(): UsePerfis {
  const [versao, setVersao] = useState(0)
  const [estado, setEstado] = useState<EstadoLista>({
    perfis: [],
    erro: null,
    aviso: null,
    versaoCarregada: -1,
  })

  useEffect(() => {
    const controle = new AbortController()
    listarPerfis(controle.signal)
      .then(({ itens, descartados }) =>
        setEstado({
          perfis: itens,
          erro: null,
          aviso: descartados > 0 ? AVISO_DESCARTADOS : null,
          versaoCarregada: versao,
        }),
      )
      .catch((erro: unknown) => {
        if (foiCancelado(erro)) return
        setEstado((atual) => ({ ...atual, erro: mensagemDeErro(erro), versaoCarregada: versao }))
      })
    return () => controle.abort()
  }, [versao])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])

  const criar = useCallback(async (dados: PerfilInput) => {
    const perfil = await criarPerfil(dados)
    setEstado((atual) => ({
      ...atual,
      perfis: [...atual.perfis, perfil].sort((a, b) => a.apelido.localeCompare(b.apelido, 'pt-BR')),
    }))
    await auditar(perfil.id, 'perfil_criado')
    return perfil
  }, [])

  const atualizar = useCallback(async (id: string, dados: PerfilInput) => {
    const perfil = await atualizarPerfil(id, dados)
    setEstado((atual) => ({
      ...atual,
      perfis: atual.perfis.map((p) => (p.id === id ? perfil : p)),
    }))
    await auditar(id, 'perfil_editado')
    return perfil
  }, [])

  const remover = useCallback(async (id: string) => {
    // Registra a exclusão antes de apagar; a cascata remove tudo, inclusive esta auditoria.
    await auditar(id, 'perfil_excluido')
    await excluirPerfilEmCascata(id)
    setEstado((atual) => ({ ...atual, perfis: atual.perfis.filter((p) => p.id !== id) }))
  }, [])

  const carregando = estado.versaoCarregada !== versao

  return useMemo(
    () => ({
      perfis: estado.perfis,
      carregando,
      erro: estado.erro,
      aviso: estado.aviso,
      criar,
      atualizar,
      remover,
      recarregar,
    }),
    [estado, carregando, criar, atualizar, remover, recarregar],
  )
}
