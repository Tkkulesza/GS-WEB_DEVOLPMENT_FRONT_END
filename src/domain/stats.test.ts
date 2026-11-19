import { describe, expect, it } from 'vitest'
import { calcularStats, formatarDuracao, minutosAcimaPorDia } from './stats'
import type { Registro } from './types'

// Quarta-feira, 18/11/2026, 15h no fuso local
const AGORA = new Date(2026, 10, 18, 15, 0, 0)

let seq = 0
function exposicao(
  dia: Date,
  duracaoSeg: number,
  picoDb: number,
  gatilho: Registro['gatilho'],
): Registro {
  seq++
  return {
    id: String(seq),
    perfilId: 'p1',
    categoria: 'exposicao',
    inicio: dia.toISOString(),
    fim: new Date(dia.getTime() + duracaoSeg * 1000).toISOString(),
    duracaoSeg,
    picoDb,
    gatilho,
    cenario: 'rua',
    nota: null,
    acao: null,
  }
}

const registros: Registro[] = [
  exposicao(new Date(2026, 10, 18, 9), 120, 82, 'automatico'), // hoje
  exposicao(new Date(2026, 10, 18, 10), 60, 91, 'pico'), // hoje
  exposicao(new Date(2026, 10, 18, 11), 600, 50, 'modo_calma'), // hoje, não entra nos minutos
  exposicao(new Date(2026, 10, 16, 8), 300, 75, 'automatico'), // segunda
  exposicao(new Date(2026, 10, 10, 8), 900, 99, 'automatico'), // fora da semana
  {
    ...exposicao(new Date(2026, 10, 18, 12), 0, 0, 'ajuda'),
    categoria: 'alerta',
    picoDb: 120,
  },
]

describe('minutosAcimaPorDia', () => {
  it('devolve 7 dias, do mais antigo para hoje', () => {
    const dias = minutosAcimaPorDia(registros, AGORA)
    expect(dias).toHaveLength(7)
    expect(dias[0].data).toBe('2026-11-12')
    expect(dias[6].data).toBe('2026-11-18')
    expect(dias[6].rotulo).toBe('qua')
  })

  it('soma só episódios automáticos e por pico', () => {
    const dias = minutosAcimaPorDia(registros, AGORA)
    expect(dias[6].segundos).toBe(180)
    expect(dias[6].minutos).toBe(3)
    expect(dias[4].minutos).toBe(5) // segunda, 16/11
    expect(dias[0].minutos).toBe(0)
  })
})

describe('calcularStats', () => {
  const stats = calcularStats(registros, AGORA)

  it('acha o momento mais alto da semana, ignorando alertas e dias antigos', () => {
    expect(stats.momentoMaisAlto?.picoDb).toBe(91)
  })

  it('conta ativações e quantas foram pelo Modo Calma', () => {
    expect(stats.ativacoes).toBe(4)
    expect(stats.ativacoesModoCalma).toBe(1)
  })

  it('soma os minutos da semana', () => {
    expect(stats.totalMinutos).toBe(8)
  })

  it('funciona sem registros', () => {
    const vazio = calcularStats([], AGORA)
    expect(vazio.momentoMaisAlto).toBeNull()
    expect(vazio.ativacoes).toBe(0)
    expect(vazio.porDia.every((d) => d.minutos === 0)).toBe(true)
  })
})

describe('formatarDuracao', () => {
  it.each([
    [45, '45 s'],
    [180, '3 min'],
    [3900, '1 h 05 min'],
  ])('%i s → %s', (s, texto) => expect(formatarDuracao(s)).toBe(texto))
})
