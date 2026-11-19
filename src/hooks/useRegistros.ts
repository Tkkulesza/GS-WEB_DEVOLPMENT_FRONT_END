import { useCallback, useEffect, useMemo, useState } from 'react'
import { calcularStats, type StatsHistorico } from '../domain/stats'
import type { Registro } from '../domain/types'
import { foiCancelado, mensagemDeErro } from '../services/http'
import {
  atualizarNota as atualizarNotaApi,
  listarRegistros,
  removerRegistro,
  type FiltrosRegistro,
} from '../services/registrosService'
import { AVISO_DESCARTADOS } from './usePerfis'

interface EstadoRegistros {
  registros: Registro[]
  stats: StatsHistorico
  erro: string | null
  aviso: string | null
  /** Chave da consulta que gerou este estado (para derivar `carregando`). */
  chave: string | null
}

export interface UseRegistros {
  registros: Registro[]
  stats: StatsHistorico
  carregando: boolean
  erro: string | null
  aviso: string | null
  atualizarNota: (id: string, nota: string) => Promise<Registro>
  remover: (id: string) => Promise<void>
  recarregar: () => void
}

function vazio(chave: string | null): EstadoRegistros {
  return { registros: [], stats: calcularStats([], new Date()), erro: null, aviso: null, chave }
}

/** Lista e edita os registros de um perfil; as estatísticas vêm de domain/stats. */
export function useRegistros(perfilId: string | null, filtros: FiltrosRegistro = {}): UseRegistros {
  const { categoria, gatilho } = filtros
  const [versao, setVersao] = useState(0)
  const [estado, setEstado] = useState<EstadoRegistros>(() => vazio(null))

  const chave =
    perfilId === null ? null : `${perfilId}|${categoria ?? ''}|${gatilho ?? ''}|${versao}`

  useEffect(() => {
    if (perfilId === null || chave === null) return
    const controle = new AbortController()
    listarRegistros(perfilId, { categoria, gatilho }, controle.signal)
      .then(({ itens, descartados }) =>
        setEstado({
          registros: itens,
          stats: calcularStats(itens, new Date()),
          erro: null,
          aviso: descartados > 0 ? AVISO_DESCARTADOS : null,
          chave,
        }),
      )
      .catch((erro: unknown) => {
        if (foiCancelado(erro)) return
        setEstado({ ...vazio(chave), erro: mensagemDeErro(erro) })
      })
    return () => controle.abort()
  }, [perfilId, categoria, gatilho, chave])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])

  const aplicar = useCallback((transformar: (lista: Registro[]) => Registro[]) => {
    setEstado((atual) => {
      const registros = transformar(atual.registros)
      return { ...atual, registros, stats: calcularStats(registros, new Date()) }
    })
  }, [])

  const atualizarNota = useCallback(
    async (id: string, nota: string) => {
      const atualizado = await atualizarNotaApi(id, nota)
      aplicar((lista) => lista.map((r) => (r.id === id ? atualizado : r)))
      return atualizado
    },
    [aplicar],
  )

  const remover = useCallback(
    async (id: string) => {
      await removerRegistro(id)
      aplicar((lista) => lista.filter((r) => r.id !== id))
    },
    [aplicar],
  )

  // Sem perfil, ou com o estado de outra consulta, não mostra dados antigos.
  const atual = useMemo(
    () => (perfilId !== null && estado.chave === chave ? estado : null),
    [perfilId, estado, chave],
  )

  return {
    registros: atual?.registros ?? [],
    stats: atual?.stats ?? estado.stats,
    carregando: perfilId !== null && estado.chave !== chave,
    erro: atual?.erro ?? null,
    aviso: atual?.aviso ?? null,
    atualizarNota,
    remover,
    recarregar,
  }
}
