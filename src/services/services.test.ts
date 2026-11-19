import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PerfilInput, Registro } from '../domain/types'
import { atualizarPerfil, criarPerfil, excluirPerfilEmCascata, listarPerfis } from './perfisService'
import { atualizarNota, criarAuditoria, criarExposicao, listarRegistros } from './registrosService'

const BASE = 'https://exemplo.mockapi.io/api/v1'
const AGORA = new Date('2026-11-18T12:00:00.000Z')

function json(status: number, corpo: unknown) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function registro(id: string, perfilId: string, extra: Partial<Registro> = {}): Registro {
  return {
    id,
    perfilId,
    categoria: 'exposicao',
    inicio: '2026-11-18T10:00:00.000Z',
    fim: '2026-11-18T10:01:00.000Z',
    duracaoSeg: 60,
    picoDb: 80,
    gatilho: 'automatico',
    cenario: 'rua',
    nota: null,
    acao: null,
    ...extra,
  }
}

const input: PerfilInput = {
  apelido: ' Lu ',
  sonsGatilho: ['buzina'],
  outroSom: null,
  limiteDb: 65,
  responsavelNome: null,
  responsavelContato: null,
  consentimentoResponsavel: false,
  consentimentoLgpd: true,
}

/** Devolve o corpo da requisição como objeto. */
function corpoDaChamada(fetchMock: ReturnType<typeof vi.fn>, i: number) {
  return JSON.parse((fetchMock.mock.calls[i][1] as RequestInit).body as string) as Record<
    string,
    unknown
  >
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', BASE)
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('perfisService', () => {
  it('cria perfil com dados limpos e datas definidas pelo app', async () => {
    fetchMock.mockImplementation((_url: string, init: RequestInit) =>
      Promise.resolve(json(201, { id: '1', ...JSON.parse(init.body as string) })),
    )
    const p = await criarPerfil(input, AGORA)
    const corpo = corpoDaChamada(fetchMock, 0)
    expect(corpo.apelido).toBe('Lu')
    expect(corpo.criadoEm).toBe(AGORA.toISOString())
    expect(p.id).toBe('1')
  })

  it('RN04: não envia limite fora da faixa', async () => {
    await expect(criarPerfil({ ...input, limiteDb: 95 })).rejects.toMatchObject({
      tipo: 'requisicao',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('não envia sem consentimento LGPD', async () => {
    await expect(
      atualizarPerfil('1', { ...input, consentimentoLgpd: false }),
    ).rejects.toMatchObject({ message: 'Para salvar, precisamos do seu consentimento.' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('lista perfis em ordem alfabética', async () => {
    const base = { ...input, criadoEm: AGORA.toISOString(), atualizadoEm: AGORA.toISOString() }
    fetchMock.mockResolvedValue(
      json(200, [
        { ...base, id: '2', apelido: 'Zeca' },
        { ...base, id: '1', apelido: 'Ana' },
      ]),
    )
    const { itens } = await listarPerfis()
    expect(itens.map((p) => p.apelido)).toEqual(['Ana', 'Zeca'])
  })

  it('exclui em cascata: registros do perfil primeiro, depois o perfil', async () => {
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      if (init.method === 'DELETE') return Promise.resolve(json(200, {}))
      // MockAPI devolve também o perfil 10 ao filtrar perfilId=1
      return Promise.resolve(
        json(200, [registro('a', '1'), registro('b', '10'), registro('c', '1')]),
      )
    })
    const r = await excluirPerfilEmCascata('1')
    expect(r.registrosApagados).toBe(2)
    const deletes = fetchMock.mock.calls
      .filter((c) => (c[1] as RequestInit).method === 'DELETE')
      .map((c) => c[0])
    expect(deletes).toEqual([`${BASE}/registros/a`, `${BASE}/registros/c`, `${BASE}/perfis/1`])
  })

  it('continua a cascata se um registro já tiver sumido (404)', async () => {
    fetchMock.mockImplementation((url: string, init: RequestInit) => {
      if (init.method === 'DELETE') {
        return Promise.resolve(url.endsWith('/a') ? json(404, 'Not found') : json(200, {}))
      }
      return Promise.resolve(json(200, [registro('a', '1')]))
    })
    await expect(excluirPerfilEmCascata('1')).resolves.toEqual({ registrosApagados: 1 })
  })
})

describe('registrosService', () => {
  it('filtra com igualdade exata e ordena do mais recente para o mais antigo', async () => {
    fetchMock.mockResolvedValue(
      json(200, [
        registro('a', '1', { inicio: '2026-11-17T10:00:00.000Z' }),
        registro('b', '12'),
        registro('c', '1', { inicio: '2026-11-18T10:00:00.000Z' }),
        registro('d', '1', { categoria: 'alerta', gatilho: 'ajuda' }),
      ]),
    )
    const { itens } = await listarRegistros('1', { categoria: 'exposicao' })
    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/registros?perfilId=1&categoria=exposicao`)
    expect(itens.map((r) => r.id)).toEqual(['c', 'a'])
  })

  it('devolve lista vazia quando o MockAPI responde 404 ao filtro', async () => {
    fetchMock.mockResolvedValue(json(404, 'Not found'))
    await expect(listarRegistros('1')).resolves.toEqual({ itens: [], descartados: 0 })
  })

  it('grava um episódio de exposição completo', async () => {
    fetchMock.mockImplementation((_url: string, init: RequestInit) =>
      Promise.resolve(json(201, { id: 'x', ...JSON.parse(init.body as string) })),
    )
    await criarExposicao(
      '1',
      {
        inicio: '2026-11-18T10:00:00.000Z',
        fim: '2026-11-18T10:00:45.000Z',
        duracaoSeg: 45,
        picoDb: 88,
        gatilho: 'pico',
      },
      'metro',
    )
    expect(corpoDaChamada(fetchMock, 0)).toMatchObject({
      categoria: 'exposicao',
      gatilho: 'pico',
      cenario: 'metro',
      acao: null,
    })
  })

  it('grava auditoria com a ação', async () => {
    fetchMock.mockImplementation((_url: string, init: RequestInit) =>
      Promise.resolve(json(201, { id: 'x', ...JSON.parse(init.body as string) })),
    )
    const r = await criarAuditoria('1', 'perfil_criado', AGORA)
    expect(r.acao).toBe('perfil_criado')
    expect(r.categoria).toBe('auditoria')
  })

  it('atualiza só a nota, com trim, e recusa nota longa', async () => {
    fetchMock.mockResolvedValue(json(200, registro('a', '1', { nota: 'Fiquei bem' })))
    await atualizarNota('a', '  Fiquei bem  ')
    expect(corpoDaChamada(fetchMock, 0)).toEqual({ nota: 'Fiquei bem' })
    await expect(atualizarNota('a', 'x'.repeat(281))).rejects.toMatchObject({ tipo: 'requisicao' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
