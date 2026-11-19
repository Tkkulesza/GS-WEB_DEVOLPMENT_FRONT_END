/**
 * Estatísticas do histórico (funções puras).
 * Usam o fuso local do navegador para agrupar por dia.
 */
import { DIAS_GRAFICO } from './constants'
import type { Registro } from './types'

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const

export interface MinutosDia {
  /** AAAA-MM-DD no fuso local. */
  data: string
  /** Rótulo curto do dia da semana (seg, ter...). */
  rotulo: string
  segundos: number
  minutos: number
}

export interface StatsHistorico {
  porDia: MinutosDia[]
  totalMinutos: number
  /** Episódio com o maior pico no período. */
  momentoMaisAlto: Registro | null
  ativacoes: number
  ativacoesModoCalma: number
}

export function chaveDia(data: Date): string {
  const a = data.getFullYear()
  const m = String(data.getMonth() + 1).padStart(2, '0')
  const d = String(data.getDate()).padStart(2, '0')
  return `${a}-${m}-${d}`
}

function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

export function ehExposicao(r: Registro): boolean {
  return r.categoria === 'exposicao'
}

/**
 * Episódios que contam como "tempo acima do limite": os ligados automaticamente
 * ou por pico. O Modo Calma pode ser ligado num lugar silencioso, então não entra no gráfico.
 */
export function contaComoAcimaDoLimite(r: Registro): boolean {
  return ehExposicao(r) && (r.gatilho === 'automatico' || r.gatilho === 'pico')
}

/** Registros de exposição cujo início está nos últimos `dias` dias (contando hoje). */
export function exposicoesNoPeriodo(
  registros: Registro[],
  agora: Date,
  dias = DIAS_GRAFICO,
): Registro[] {
  const desde = inicioDoDia(agora)
  desde.setDate(desde.getDate() - (dias - 1))
  const limiteInferior = desde.getTime()
  const limiteSuperior = agora.getTime()
  return registros.filter((r) => {
    if (!ehExposicao(r)) return false
    const t = Date.parse(r.inicio)
    return t >= limiteInferior && t <= limiteSuperior
  })
}

/** Minutos acima do limite por dia, do mais antigo para hoje. Dias sem dados aparecem com 0. */
export function minutosAcimaPorDia(
  registros: Registro[],
  agora: Date,
  dias = DIAS_GRAFICO,
): MinutosDia[] {
  const hoje = inicioDoDia(agora)
  const resultado: MinutosDia[] = []
  const indice = new Map<string, MinutosDia>()

  for (let i = dias - 1; i >= 0; i--) {
    const dia = new Date(hoje)
    dia.setDate(hoje.getDate() - i)
    const item: MinutosDia = {
      data: chaveDia(dia),
      rotulo: DIAS_SEMANA[dia.getDay()],
      segundos: 0,
      minutos: 0,
    }
    resultado.push(item)
    indice.set(item.data, item)
  }

  for (const r of exposicoesNoPeriodo(registros, agora, dias)) {
    if (!contaComoAcimaDoLimite(r)) continue
    const item = indice.get(chaveDia(new Date(r.inicio)))
    if (item) item.segundos += r.duracaoSeg ?? 0
  }

  for (const item of resultado) item.minutos = Math.round(item.segundos / 60)
  return resultado
}

export function momentoMaisAlto(registros: Registro[]): Registro | null {
  let maior: Registro | null = null
  for (const r of registros) {
    if (!ehExposicao(r) || r.picoDb === null) continue
    if (maior === null || r.picoDb > (maior.picoDb ?? -Infinity)) maior = r
  }
  return maior
}

export function contarAtivacoes(registros: Registro[]): { total: number; modoCalma: number } {
  let total = 0
  let modoCalma = 0
  for (const r of registros) {
    if (!ehExposicao(r)) continue
    total++
    if (r.gatilho === 'modo_calma') modoCalma++
  }
  return { total, modoCalma }
}

/** Resumo da semana usado na página Histórico. */
export function calcularStats(
  registros: Registro[],
  agora: Date,
  dias = DIAS_GRAFICO,
): StatsHistorico {
  const periodo = exposicoesNoPeriodo(registros, agora, dias)
  const porDia = minutosAcimaPorDia(registros, agora, dias)
  const { total, modoCalma } = contarAtivacoes(periodo)
  const totalSegundos = porDia.reduce((s, d) => s + d.segundos, 0)
  return {
    porDia,
    totalMinutos: Math.round(totalSegundos / 60),
    momentoMaisAlto: momentoMaisAlto(periodo),
    ativacoes: total,
    ativacoesModoCalma: modoCalma,
  }
}

/** "45 s", "3 min", "1 h 05 min". */
export function formatarDuracao(segundos: number): string {
  const s = Math.max(0, Math.round(segundos))
  if (s < 60) return `${s} s`
  const min = Math.floor(s / 60)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  return `${h} h ${String(min % 60).padStart(2, '0')} min`
}
