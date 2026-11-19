/**
 * Cliente HTTP do Hearmony.
 * - URL base em VITE_API_URL
 * - timeout de 8 s com AbortController
 * - retry com backoff exponencial (500 ms, 1 s, 2 s):
 *     GET  → falha de rede, timeout, 429 e 5xx
 *     demais métodos → só 429 (o servidor recusou sem processar, então repetir é seguro)
 * - erros tipados (ApiError) com mensagem em português no tom da marca
 * - validação da resposta antes de devolver (dado inválido vira erro, não quebra a tela)
 */
import type { z } from 'zod'
import { HTTP_RETRY_DELAYS_MS, HTTP_TIMEOUT_MS } from '../domain/constants'
import { validarLista, type ListaValidada } from '../domain/schemas'

export type TipoErroApi =
  | 'config'
  | 'rede'
  | 'timeout'
  | 'nao_encontrado'
  | 'limite_requisicoes'
  | 'servidor'
  | 'requisicao'
  | 'validacao'
  | 'cancelado'

const MENSAGENS: Record<TipoErroApi, string> = {
  config: 'A conexão com o servidor ainda não foi configurada. Veja as instruções do arquivo .env.',
  rede: 'Não conseguimos falar com o servidor. Vamos tentar de novo?',
  timeout: 'O servidor demorou para responder. Vamos tentar de novo?',
  nao_encontrado: 'Não encontramos esse dado. Ele pode ter sido apagado.',
  limite_requisicoes: 'Foram muitas tentativas seguidas. Espere um pouco e tente de novo.',
  servidor: 'O servidor está com dificuldade agora. Vamos tentar de novo?',
  requisicao: 'O servidor não aceitou esses dados. Confira e tente de novo.',
  validacao: 'Recebemos dados num formato inesperado. Vamos tentar de novo?',
  cancelado: 'A ação foi cancelada.',
}

export class ApiError extends Error {
  readonly status: number
  readonly tipo: TipoErroApi

  constructor(tipo: TipoErroApi, status = 0, mensagem = MENSAGENS[tipo]) {
    super(mensagem)
    this.name = 'ApiError'
    this.tipo = tipo
    this.status = status
  }
}

export function ehApiError(erro: unknown): erro is ApiError {
  return erro instanceof ApiError
}

/** Mensagem amigável para qualquer erro, inclusive os que não vieram da API. */
export function mensagemDeErro(erro: unknown): string {
  return ehApiError(erro) ? erro.message : MENSAGENS.rede
}

/** Verdadeiro quando a requisição foi cancelada por quem chamou (ex.: componente desmontado). */
export function foiCancelado(erro: unknown): boolean {
  return ehApiError(erro) && erro.tipo === 'cancelado'
}

// ---------- Configuração ----------

export function obterApiUrl(): string | null {
  const bruto: unknown = import.meta.env.VITE_API_URL
  if (typeof bruto !== 'string') return null
  const url = bruto.trim().replace(/\/+$/, '')
  if (!/^https?:\/\/[^\s<>]+$/.test(url)) return null
  return url
}

export function apiConfigurada(): boolean {
  return obterApiUrl() !== null
}

// ---------- Validação de resposta ----------

export type Parser<T> = (dados: unknown) => T

/** Valida a resposta com um schema zod. */
export function comSchema<T>(schema: z.ZodType<T>): Parser<T> {
  return (dados) => {
    const r = schema.safeParse(dados)
    if (!r.success) throw new ApiError('validacao')
    return r.data
  }
}

/** Valida uma lista item a item, descartando os que vierem com formato inesperado. */
export function comLista<T>(schema: z.ZodType<T>): Parser<ListaValidada<T>> {
  return (dados) => {
    const r = validarLista(schema, dados)
    if (r === null) throw new ApiError('validacao')
    return r
  }
}

/**
 * Valida o corpo ANTES de enviar. Mesmo com o formulário validado,
 * o service confere de novo para nada inválido chegar à API.
 */
export function validarEntrada<T>(schema: z.ZodType<T>, dados: unknown): T {
  const r = schema.safeParse(dados)
  if (!r.success) {
    throw new ApiError('requisicao', 0, r.error.issues[0]?.message ?? MENSAGENS.requisicao)
  }
  return r.data
}

/** Ignora 404 (o dado já não existe) e repassa os outros erros. */
export async function ignorarNaoEncontrado(promessa: Promise<unknown>): Promise<void> {
  try {
    await promessa
  } catch (erro) {
    if (ehApiError(erro) && erro.tipo === 'nao_encontrado') return
    throw erro
  }
}

// ---------- Requisição ----------

export type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface OpcoesRequisicao<T> {
  metodo?: MetodoHttp
  corpo?: unknown
  query?: Record<string, string | number | undefined>
  parse: Parser<T>
  /** Para cancelar quando o componente desmonta. */
  signal?: AbortSignal
  /** O MockAPI responde 404 quando um filtro não encontra nada; com isto, 404 vira `[]`. */
  vazioEm404?: boolean
}

function montarUrl(base: string, caminho: string, query?: OpcoesRequisicao<unknown>['query']) {
  const url = new URL(`${base}/${caminho.replace(/^\/+/, '')}`)
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined) url.searchParams.set(chave, String(valor))
  }
  return url.toString()
}

function tipoPorStatus(status: number): TipoErroApi {
  if (status === 404) return 'nao_encontrado'
  if (status === 429) return 'limite_requisicoes'
  if (status >= 500) return 'servidor'
  return 'requisicao'
}

function podeRepetir(metodo: MetodoHttp, erro: ApiError): boolean {
  if (erro.tipo === 'limite_requisicoes') return true
  if (metodo !== 'GET') return false
  return erro.tipo === 'rede' || erro.tipo === 'timeout' || erro.tipo === 'servidor'
}

function esperar(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new ApiError('cancelado'))
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', aoCancelar)
      resolve()
    }, ms)
    function aoCancelar() {
      clearTimeout(id)
      reject(new ApiError('cancelado'))
    }
    signal?.addEventListener('abort', aoCancelar, { once: true })
  })
}

/** Uma tentativa, com timeout próprio. */
async function tentar<T>(url: string, metodo: MetodoHttp, opcoes: OpcoesRequisicao<T>): Promise<T> {
  if (opcoes.signal?.aborted) throw new ApiError('cancelado')

  const controle = new AbortController()
  let estourouTempo = false
  const timer = setTimeout(() => {
    estourouTempo = true
    controle.abort()
  }, HTTP_TIMEOUT_MS)
  const repassarCancelamento = () => controle.abort()
  opcoes.signal?.addEventListener('abort', repassarCancelamento, { once: true })

  try {
    let resposta: Response
    try {
      resposta = await fetch(url, {
        method: metodo,
        headers: opcoes.corpo !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
        signal: controle.signal,
      })
    } catch {
      if (estourouTempo) throw new ApiError('timeout')
      if (opcoes.signal?.aborted) throw new ApiError('cancelado')
      throw new ApiError('rede')
    }

    if (resposta.status === 404 && opcoes.vazioEm404) return opcoes.parse([])
    if (!resposta.ok) throw new ApiError(tipoPorStatus(resposta.status), resposta.status)

    let dados: unknown
    try {
      dados = await resposta.json()
    } catch {
      throw new ApiError('validacao', resposta.status)
    }
    return opcoes.parse(dados)
  } finally {
    clearTimeout(timer)
    opcoes.signal?.removeEventListener('abort', repassarCancelamento)
  }
}

export async function requisitar<T>(caminho: string, opcoes: OpcoesRequisicao<T>): Promise<T> {
  const base = obterApiUrl()
  if (base === null) throw new ApiError('config')

  const metodo = opcoes.metodo ?? 'GET'
  const url = montarUrl(base, caminho, opcoes.query)

  for (let tentativa = 0; ; tentativa++) {
    try {
      return await tentar(url, metodo, opcoes)
    } catch (erro) {
      const apiErro = ehApiError(erro) ? erro : new ApiError('rede')
      const espera = HTTP_RETRY_DELAYS_MS[tentativa]
      if (espera === undefined || !podeRepetir(metodo, apiErro)) throw apiErro
      await esperar(espera, opcoes.signal)
    }
  }
}
