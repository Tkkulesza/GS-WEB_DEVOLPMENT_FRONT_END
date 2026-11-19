import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ESTADO_PROTECAO_INICIAL,
  ativarModoCalma as ativarModoCalmaRegra,
  desativarProtecao,
  deveAlertarPersistente,
  marcarAlertaPersistenteEnviado,
  montarEpisodio,
  podeAvisarResponsavel,
  proximoEstadoProtecao,
  segundosLigada,
} from '../domain/rules'
import type {
  EstadoProtecao,
  Gatilho,
  Leitura,
  MotivoProtecao,
  OrigemLeitura,
  Perfil,
} from '../domain/types'
import { mensagemDeErro } from '../services/http'
import { criarAlerta, criarExposicao } from '../services/registrosService'

interface OpcoesProtecao {
  /** Última leitura do monitor (null enquanto não houver). */
  leitura: Leitura | null
  /** Perfil ativo. Sem perfil, a proteção automática fica parada. */
  perfil: Perfil | null
  /** De onde vem a leitura (cenário do simulador ou microfone). */
  origem: OrigemLeitura
  /** Chamado depois que um alerta (simulado) foi registrado. */
  aoAvisarResponsavel?: (nome: string, gatilho: Extract<Gatilho, 'ajuda' | 'persistente'>) => void
  /** Chamado quando não foi possível gravar algo no histórico. */
  aoFalhar?: (mensagem: string) => void
}

export interface Protecao {
  estado: EstadoProtecao
  ativa: boolean
  motivo: MotivoProtecao | null
  ligadaHaSeg: number
  /** RN05: o botão "Avisar meu responsável" só aparece quando isto é verdadeiro. */
  podeAvisar: boolean
  avisando: boolean
  ativarModoCalma: () => void
  desativar: () => void
  pedirAjuda: () => Promise<void>
}

interface Interno {
  estado: EstadoProtecao
  /** Última leitura já processada (evita processar a mesma duas vezes). */
  seq: number
  /** Último valor lido (pico inicial do Modo Calma e valor do alerta). */
  ultimoDb: number
  /** Conta os alertas de exposição persistente disparados (RF08). */
  alertasPersistentes: number
}

/**
 * Controla o cancelamento de ruído (simulado) seguindo RN01–RN03 e RF08/RN05.
 * As decisões vêm das funções puras do domínio; aqui ficam só os efeitos:
 * gravar um registro por episódio e registrar alertas.
 */
export function useProtecao({
  leitura,
  perfil,
  origem,
  aoAvisarResponsavel,
  aoFalhar,
}: OpcoesProtecao): Protecao {
  const limite = perfil?.limiteDb ?? null
  const podeAvisar = podeAvisarResponsavel(perfil)

  const [interno, setInterno] = useState<Interno>({
    estado: ESTADO_PROTECAO_INICIAL,
    seq: -1,
    ultimoDb: 0,
    alertasPersistentes: 0,
  })
  const [avisando, setAvisando] = useState(false)

  // Leitura nova → próximo estado (padrão do React de atualizar o estado durante o render
  // quando a entrada muda). O RF08 é decidido na mesma atualização.
  if (leitura !== null && limite !== null && leitura.seq !== interno.seq) {
    let estado = proximoEstadoProtecao(interno.estado, leitura.db, limite, leitura.em)
    let alertasPersistentes = interno.alertasPersistentes
    if (deveAlertarPersistente(estado, leitura.em)) {
      estado = marcarAlertaPersistenteEnviado(estado)
      if (podeAvisar) alertasPersistentes++
    }
    setInterno({ estado, seq: leitura.seq, ultimoDb: leitura.db, alertasPersistentes })
  }

  const { estado } = interno

  // ----- Efeitos: só executam ações, não decidem nada -----

  // Dados mais recentes para os efeitos, sem fazê-los rodar de novo a cada mudança.
  const contexto = useRef({ perfil, origem, aoAvisarResponsavel, aoFalhar, ultimoDb: 0 })
  useEffect(() => {
    contexto.current = { perfil, origem, aoAvisarResponsavel, aoFalhar, ultimoDb: interno.ultimoDb }
  })

  // De onde e para quem é o episódio: o perfil e a origem de quando a proteção ligou.
  const episodio = useRef<{ perfilId: string; origem: OrigemLeitura } | null>(null)
  const estadoAnterior = useRef(estado)

  useEffect(() => {
    const anterior = estadoAnterior.current
    estadoAnterior.current = estado
    const ctx = contexto.current

    if (!anterior.ativa && estado.ativa && ctx.perfil) {
      episodio.current = { perfilId: ctx.perfil.id, origem: ctx.origem }
      return
    }

    if (anterior.ativa && !estado.ativa) {
      const dono = episodio.current
      episodio.current = null
      const dados = montarEpisodio(anterior, Date.now())
      // Se o perfil foi excluído no meio do episódio, não grava (evita registro órfão).
      if (!dados || !dono || ctx.perfil?.id !== dono.perfilId) return
      criarExposicao(dono.perfilId, dados, dono.origem).catch((e: unknown) =>
        ctx.aoFalhar?.(`Não conseguimos salvar este episódio no histórico. ${mensagemDeErro(e)}`),
      )
    }
  }, [estado])

  const enviarAlerta = useCallback(async (gatilho: Extract<Gatilho, 'ajuda' | 'persistente'>) => {
    const ctx = contexto.current
    const p = ctx.perfil
    if (!p || !podeAvisarResponsavel(p)) return
    try {
      await criarAlerta(p.id, gatilho, ctx.ultimoDb, ctx.origem)
      ctx.aoAvisarResponsavel?.(p.responsavelNome ?? '', gatilho)
    } catch (e) {
      ctx.aoFalhar?.(mensagemDeErro(e))
    }
  }, [])

  // RF08: exposição persistente com a proteção ligada.
  useEffect(() => {
    if (interno.alertasPersistentes > 0) void enviarAlerta('persistente')
  }, [interno.alertasPersistentes, enviarAlerta])

  // ----- Ações da pessoa -----

  const ativarModoCalma = useCallback(() => {
    setInterno((i) => ({
      ...i,
      estado: ativarModoCalmaRegra(i.estado, i.ultimoDb, Date.now()),
    }))
  }, [])

  const desativar = useCallback(() => {
    setInterno((i) => ({ ...i, estado: desativarProtecao() }))
  }, [])

  /** "Avisar meu responsável" (RF08 + RN05). O envio é simulado: só grava o alerta. */
  const pedirAjuda = useCallback(async () => {
    setAvisando(true)
    try {
      await enviarAlerta('ajuda')
    } finally {
      setAvisando(false)
    }
  }, [enviarAlerta])

  return {
    estado,
    ativa: estado.ativa,
    motivo: estado.motivo,
    ligadaHaSeg: leitura ? segundosLigada(estado, leitura.em) : 0,
    podeAvisar,
    avisando,
    ativarModoCalma,
    desativar,
    pedirAjuda,
  }
}
