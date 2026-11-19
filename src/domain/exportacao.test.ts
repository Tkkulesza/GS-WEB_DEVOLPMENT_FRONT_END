import { describe, expect, it } from 'vitest'
import { montarExportacao, nomeArquivoExportacao } from './exportacao'
import type { Perfil, Registro } from './types'

const AGORA = new Date('2026-11-18T12:00:00.000Z')

const perfil: Perfil = {
  id: '1',
  apelido: 'Lu',
  sonsGatilho: ['buzina'],
  outroSom: null,
  limiteDb: 65,
  responsavelNome: null,
  responsavelContato: null,
  consentimentoResponsavel: false,
  consentimentoLgpd: true,
  criadoEm: '2026-11-01T10:00:00.000Z',
  atualizadoEm: '2026-11-01T10:00:00.000Z',
}

function reg(id: string, inicio: string): Registro {
  return {
    id,
    perfilId: '1',
    categoria: 'auditoria',
    inicio,
    fim: null,
    duracaoSeg: null,
    picoDb: null,
    gatilho: null,
    cenario: null,
    nota: null,
    acao: 'perfil_criado',
  }
}

describe('montarExportacao', () => {
  it('inclui perfil, registros em ordem cronológica e data da exportação', () => {
    const r = montarExportacao(
      perfil,
      [reg('b', '2026-11-10T10:00:00.000Z'), reg('a', '2026-11-02T10:00:00.000Z')],
      AGORA,
    )
    expect(r.exportadoEm).toBe(AGORA.toISOString())
    expect(r.perfil).toEqual(perfil)
    expect(r.registros.map((x) => x.id)).toEqual(['a', 'b'])
  })
})

describe('nomeArquivoExportacao', () => {
  it('gera um nome seguro, sem acentos', () => {
    expect(nomeArquivoExportacao('João Zé!', AGORA)).toBe('hearmony-joao-ze-2026-11-18.json')
    expect(nomeArquivoExportacao('!!!', AGORA)).toBe('hearmony-perfil-2026-11-18.json')
  })
})
