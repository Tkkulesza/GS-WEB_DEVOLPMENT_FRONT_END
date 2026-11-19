import { describe, expect, it } from 'vitest'
import { CENARIOS } from './constants'
import { DB_MAX_SIMULADO, DB_MIN_SIMULADO, proximaLeituraSimulada } from './simulador'

/** Gerador pseudoaleatório com semente (mulberry32), para testes repetíveis. */
function semente(s: number) {
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function serie(cenario: (typeof CENARIOS)[number]['id'], passos: number, inicio = 50) {
  const aleatorio = semente(42)
  const leituras: number[] = []
  let atual = inicio
  for (let i = 0; i < passos; i++) {
    atual = proximaLeituraSimulada(cenario, atual, aleatorio)
    leituras.push(atual)
  }
  return leituras
}

describe('proximaLeituraSimulada', () => {
  it.each(CENARIOS.map((c) => [c.id, c.mediaDb] as const))(
    'no cenário %s a média fica perto de %i dB',
    (id, media) => {
      const leituras = serie(id, 600).slice(50)
      const m = leituras.reduce((a, b) => a + b, 0) / leituras.length
      expect(Math.abs(m - media)).toBeLessThan(4)
    },
  )

  it('sempre devolve inteiros dentro da faixa plausível', () => {
    for (const c of CENARIOS) {
      for (const db of serie(c.id, 300)) {
        expect(Number.isInteger(db)).toBe(true)
        expect(db).toBeGreaterThanOrEqual(DB_MIN_SIMULADO)
        expect(db).toBeLessThanOrEqual(DB_MAX_SIMULADO)
      }
    }
  })

  it('gera picos ocasionais acima da média no metrô', () => {
    const leituras = serie('metro', 600)
    expect(leituras.some((db) => db >= 90)).toBe(true)
  })

  it('suaviza a transição ao trocar de cenário (não pula direto)', () => {
    const semPico = () => 0.5 // sem pico e ruído zero
    const proxima = proximaLeituraSimulada('obra', 40, semPico)
    expect(proxima).toBeGreaterThan(40)
    expect(proxima).toBeLessThan(88)
  })

  it('gera pico quando o sorteio cai na chance de pico', () => {
    const sempre = () => 0
    expect(proximaLeituraSimulada('rua', 60, sempre)).toBe(78)
  })
})
