import { describe, expect, it } from 'vitest'
import { estimarDb, pareceMicrofoneDeFone, rmsDe } from './audio'

describe('rmsDe', () => {
  it('é 0 para silêncio e 1 para sinal cheio', () => {
    expect(rmsDe(new Float32Array(128))).toBe(0)
    expect(rmsDe(new Float32Array(128).fill(1))).toBe(1)
  })

  it('é ~0,707 para uma senoide de amplitude 1', () => {
    const seno = Array.from({ length: 1000 }, (_, i) => Math.sin((2 * Math.PI * i) / 100))
    expect(rmsDe(seno)).toBeCloseTo(Math.SQRT1_2, 3)
  })
})

describe('estimarDb', () => {
  it('soma 94 ao dBFS', () => {
    expect(estimarDb(0.01)).toBe(54) // −40 dBFS
    expect(estimarDb(0.1)).toBe(74) // −20 dBFS
  })

  it('limita a estimativa entre 30 e 110 dB', () => {
    expect(estimarDb(0)).toBe(30)
    expect(estimarDb(0.00001)).toBe(30)
    expect(estimarDb(1)).toBe(94)
    expect(estimarDb(10)).toBe(110)
    expect(estimarDb(Number.NaN)).toBe(30)
  })
})

describe('pareceMicrofoneDeFone', () => {
  it.each([
    'Fone de ouvido (Bluetooth)',
    'AirPods Pro Hands-Free AG Audio',
    'Galaxy Buds2 Pro',
    'Headset Microphone (Jabra Evolve)',
    'Microfone (Fones de ouvido JBL)',
    'Mãos livres (Redmi Buds)',
  ])('"%s" é fone', (n) => expect(pareceMicrofoneDeFone(n)).toBe(true))

  it.each(['Microfone (Realtek High Definition Audio)', 'Padrão', 'MacBook Pro Microphone', ''])(
    '"%s" não é fone',
    (n) => expect(pareceMicrofoneDeFone(n)).toBe(false),
  )
})
