import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ApiError, comLista, comSchema, obterApiUrl, requisitar } from './http'

const Item = z.object({ id: z.string() })

function resposta(status: number, corpo: unknown = {}) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubEnv('VITE_API_URL', 'https://exemplo.mockapi.io/api/v1/')
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

/** Executa a requisição avançando os timers até ela terminar. */
async function rodar<T>(p: Promise<T>): Promise<T> {
  const capturada = p.catch((e: unknown) => e)
  await vi.runAllTimersAsync()
  const r = await capturada
  if (r instanceof Error) throw r
  return r as T
}

describe('configuração', () => {
  it('remove a barra final da URL', () => {
    expect(obterApiUrl()).toBe('https://exemplo.mockapi.io/api/v1')
  })

  it('falha com erro de configuração se a URL não existir', async () => {
    vi.stubEnv('VITE_API_URL', '')
    await expect(requisitar('perfis', { parse: comSchema(Item) })).rejects.toMatchObject({
      tipo: 'config',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('requisitar', () => {
  it('monta a URL com query string e valida a resposta', async () => {
    fetchMock.mockResolvedValue(resposta(200, [{ id: '1' }, { nome: 'sem id' }]))
    const r = await rodar(
      requisitar('/registros', {
        query: { perfilId: '7', categoria: undefined },
        parse: comLista(Item),
      }),
    )
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://exemplo.mockapi.io/api/v1/registros?perfilId=7',
    )
    expect(r).toEqual({ itens: [{ id: '1' }], descartados: 1 })
  })

  it('envia JSON no corpo do POST', async () => {
    fetchMock.mockResolvedValue(resposta(201, { id: '1' }))
    await rodar(requisitar('perfis', { metodo: 'POST', corpo: { a: 1 }, parse: comSchema(Item) }))
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"a":1}')
  })

  it('transforma resposta inválida em erro de validação', async () => {
    fetchMock.mockResolvedValue(resposta(200, { id: 42 }))
    await expect(rodar(requisitar('perfis/1', { parse: comSchema(Item) }))).rejects.toMatchObject({
      tipo: 'validacao',
    })
  })

  it('trata 404 como lista vazia quando pedido (filtro sem resultado no MockAPI)', async () => {
    fetchMock.mockResolvedValue(resposta(404, 'Not found'))
    const r = await rodar(requisitar('registros', { parse: comLista(Item), vazioEm404: true }))
    expect(r.itens).toEqual([])
  })

  it('devolve 404 tipado quando não é lista', async () => {
    fetchMock.mockResolvedValue(resposta(404, 'Not found'))
    await expect(rodar(requisitar('perfis/9', { parse: comSchema(Item) }))).rejects.toMatchObject({
      tipo: 'nao_encontrado',
      status: 404,
    })
  })
})

describe('retry com backoff', () => {
  it('repete GET em 5xx e acerta na terceira tentativa', async () => {
    fetchMock
      .mockResolvedValueOnce(resposta(500))
      .mockResolvedValueOnce(resposta(503))
      .mockResolvedValueOnce(resposta(200, { id: '1' }))
    const r = await rodar(requisitar('perfis/1', { parse: comSchema(Item) }))
    expect(r).toEqual({ id: '1' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('desiste depois de 3 novas tentativas (500 ms, 1 s, 2 s)', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(resposta(500)))
    await expect(rodar(requisitar('perfis', { parse: comSchema(Item) }))).rejects.toBeInstanceOf(
      ApiError,
    )
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('repete GET em falha de rede', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(resposta(200, { id: '1' }))
    await rodar(requisitar('perfis/1', { parse: comSchema(Item) }))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('não repete POST em 5xx (evita gravar duas vezes)', async () => {
    fetchMock.mockResolvedValue(resposta(500))
    await expect(
      rodar(requisitar('perfis', { metodo: 'POST', corpo: {}, parse: comSchema(Item) })),
    ).rejects.toMatchObject({ tipo: 'servidor' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('repete POST em 429', async () => {
    fetchMock.mockResolvedValueOnce(resposta(429)).mockResolvedValueOnce(resposta(201, { id: '1' }))
    await rodar(requisitar('perfis', { metodo: 'POST', corpo: {}, parse: comSchema(Item) }))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('não repete erro 400', async () => {
    fetchMock.mockResolvedValue(resposta(400))
    await expect(rodar(requisitar('perfis', { parse: comSchema(Item) }))).rejects.toMatchObject({
      tipo: 'requisicao',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('timeout e cancelamento', () => {
  /** fetch que só termina quando é abortado. */
  function fetchPendurado(_url: string, init: RequestInit) {
    return new Promise((_, reject) => {
      init.signal?.addEventListener('abort', () =>
        reject(new DOMException('aborted', 'AbortError')),
      )
    })
  }

  it('aborta após 8 s e informa timeout (depois das novas tentativas)', async () => {
    fetchMock.mockImplementation(fetchPendurado)
    await expect(rodar(requisitar('perfis', { parse: comSchema(Item) }))).rejects.toMatchObject({
      tipo: 'timeout',
    })
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('para na hora quando quem chamou cancela, sem novas tentativas', async () => {
    fetchMock.mockImplementation(fetchPendurado)
    const controle = new AbortController()
    const p = requisitar('perfis', { parse: comSchema(Item), signal: controle.signal })
    controle.abort()
    await expect(rodar(p)).rejects.toMatchObject({ tipo: 'cancelado' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
