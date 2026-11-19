/**
 * Simulador do sensor sonoro (função pura).
 * O sorteio entra como parâmetro para os testes serem determinísticos.
 */
import { CENARIOS, type CenarioId } from './constants'

export type Aleatorio = () => number

/** Faixa física plausível para as leituras simuladas. */
export const DB_MIN_SIMULADO = 25
export const DB_MAX_SIMULADO = 110

/** Quanto a leitura anda em direção ao alvo a cada passo (suaviza a curva). */
const SUAVIZACAO = 0.35

export function obterCenario(id: CenarioId) {
  return CENARIOS.find((c) => c.id === id) ?? CENARIOS[0]
}

/** Normal padrão (Box–Muller). */
function normal(aleatorio: Aleatorio): number {
  const u = Math.max(aleatorio(), Number.EPSILON)
  const v = aleatorio()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function limitar(db: number): number {
  return Math.min(DB_MAX_SIMULADO, Math.max(DB_MIN_SIMULADO, db))
}

/**
 * Próxima leitura: caminha em direção à média do cenário com ruído,
 * e de vez em quando gera um pico (buzina, freada, britadeira).
 */
export function proximaLeituraSimulada(
  cenarioId: CenarioId,
  anterior: number,
  aleatorio: Aleatorio = Math.random,
): number {
  const c = obterCenario(cenarioId)

  if (aleatorio() < c.chancePico) {
    const pico = c.mediaDb + 10 + aleatorio() * 10
    return Math.round(limitar(pico))
  }

  const alvo = c.mediaDb + normal(aleatorio) * c.variacaoDb
  return Math.round(limitar(anterior + (alvo - anterior) * SUAVIZACAO))
}
