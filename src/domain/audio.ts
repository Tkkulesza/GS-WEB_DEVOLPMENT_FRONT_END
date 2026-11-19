/**
 * Conversão de amostras de áudio em uma estimativa de volume (função pura).
 * Só números entram e saem: nenhuma amostra é guardada.
 */
import { MICROFONE_MAX_DB, MICROFONE_MIN_DB, MICROFONE_OFFSET_DB } from './constants'

/** Raiz da média dos quadrados (energia do sinal), com amostras entre −1 e 1. */
export function rmsDe(amostras: ArrayLike<number>): number {
  if (amostras.length === 0) return 0
  let soma = 0
  for (let i = 0; i < amostras.length; i++) soma += amostras[i] * amostras[i]
  return Math.sqrt(soma / amostras.length)
}

/**
 * RMS → dBFS → estimativa em dB: `dBFS + 94`, limitada a 30–110.
 * Não é calibrada: cada microfone e navegador responde de um jeito.
 */
export function estimarDb(rms: number): number {
  if (!(rms > 0)) return MICROFONE_MIN_DB
  const dbfs = 20 * Math.log10(rms)
  const estimado = dbfs + MICROFONE_OFFSET_DB
  return Math.round(Math.min(MICROFONE_MAX_DB, Math.max(MICROFONE_MIN_DB, estimado)))
}
