import { useCallback, useState } from 'react'
import {
  ESTADO_PROTECAO_INICIAL,
  ativarModoCalma as ativarModoCalmaRegra,
  desativarProtecao,
  proximoEstadoProtecao,
  segundosLigada,
} from '../domain/rules'
import type { EstadoProtecao, Leitura, MotivoProtecao } from '../domain/types'

interface OpcoesProtecao {
  /** Última leitura do monitor (null enquanto não houver). */
  leitura: Leitura | null
  /** Limite do perfil ativo. Sem perfil (null), a proteção automática fica parada. */
  limite: number | null
}

export interface Protecao {
  estado: EstadoProtecao
  ativa: boolean
  motivo: MotivoProtecao | null
  ligadaHaSeg: number
  ativarModoCalma: () => void
  desativar: () => void
}

interface Interno {
  estado: EstadoProtecao
  /** Última leitura já processada (evita processar a mesma duas vezes). */
  seq: number
  /** Último valor lido, usado pelo Modo Calma para iniciar o pico do episódio. */
  ultimoDb: number
}

/**
 * Controla o cancelamento de ruído (simulado) seguindo RN01–RN03.
 * Toda decisão vem de `proximoEstadoProtecao`, que é pura e testada no domínio.
 */
export function useProtecao({ leitura, limite }: OpcoesProtecao): Protecao {
  const [interno, setInterno] = useState<Interno>({
    estado: ESTADO_PROTECAO_INICIAL,
    seq: -1,
    ultimoDb: 0,
  })

  // Leitura nova → próximo estado. Atualizar o estado durante o render, quando a
  // entrada muda, é o padrão recomendado pelo React (evita um render extra via useEffect).
  if (leitura !== null && limite !== null && leitura.seq !== interno.seq) {
    setInterno({
      estado: proximoEstadoProtecao(interno.estado, leitura.db, limite, leitura.em),
      seq: leitura.seq,
      ultimoDb: leitura.db,
    })
  }

  const ativarModoCalma = useCallback(() => {
    setInterno((i) => ({
      ...i,
      estado: ativarModoCalmaRegra(i.estado, i.ultimoDb, Date.now()),
    }))
  }, [])

  const desativar = useCallback(() => {
    setInterno((i) => ({ ...i, estado: desativarProtecao() }))
  }, [])

  const { estado } = interno

  return {
    estado,
    ativa: estado.ativa,
    motivo: estado.motivo,
    ligadaHaSeg: leitura ? segundosLigada(estado, leitura.em) : 0,
    ativarModoCalma,
    desativar,
  }
}
