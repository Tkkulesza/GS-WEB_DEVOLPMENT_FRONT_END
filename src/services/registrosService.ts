/**
 * CRUD do resource `registros` no MockAPI.
 * Um registro é um episódio de proteção (exposicao), um alerta ou uma ação de auditoria.
 */
import {
  NotaSchema,
  RegistroInputSchema,
  RegistroSchema,
  type ListaValidada,
} from '../domain/schemas'
import type {
  AcaoAuditoria,
  CategoriaRegistro,
  Episodio,
  Gatilho,
  OrigemLeitura,
  Registro,
  RegistroInput,
} from '../domain/types'
import { comLista, comSchema, ignorarNaoEncontrado, requisitar, validarEntrada } from './http'

const RECURSO = 'registros'

export interface FiltrosRegistro {
  categoria?: CategoriaRegistro
  gatilho?: Gatilho
}

/** Mais recente primeiro. */
function ordenarPorData(a: Registro, b: Registro): number {
  return Date.parse(b.inicio) - Date.parse(a.inicio)
}

/**
 * Lista os registros de um perfil.
 * O filtro do MockAPI é por "contém" (perfilId=1 também traz 10, 11...),
 * então os mesmos filtros são reaplicados aqui com igualdade exata.
 */
export async function listarRegistros(
  perfilId: string,
  filtros: FiltrosRegistro = {},
  signal?: AbortSignal,
): Promise<ListaValidada<Registro>> {
  const r = await requisitar(RECURSO, {
    query: { perfilId, categoria: filtros.categoria, gatilho: filtros.gatilho },
    parse: comLista(RegistroSchema),
    vazioEm404: true,
    signal,
  })
  const itens = r.itens
    .filter(
      (x) =>
        x.perfilId === perfilId &&
        (filtros.categoria === undefined || x.categoria === filtros.categoria) &&
        (filtros.gatilho === undefined || x.gatilho === filtros.gatilho),
    )
    .sort(ordenarPorData)
  return { itens, descartados: r.descartados }
}

export async function criarRegistro(dados: RegistroInput): Promise<Registro> {
  const corpo = validarEntrada(RegistroInputSchema, dados)
  return requisitar(RECURSO, { metodo: 'POST', corpo, parse: comSchema(RegistroSchema) })
}

/** Grava um episódio de proteção encerrado (um por episódio, nunca por leitura). */
export function criarExposicao(
  perfilId: string,
  episodio: Episodio,
  cenario: OrigemLeitura,
): Promise<Registro> {
  return criarRegistro({
    perfilId,
    categoria: 'exposicao',
    ...episodio,
    cenario,
    nota: null,
    acao: null,
  })
}

/** Alerta simulado ao responsável (RF08). Nenhuma mensagem real é enviada. */
export function criarAlerta(
  perfilId: string,
  gatilho: Extract<Gatilho, 'ajuda' | 'persistente'>,
  picoDb: number | null,
  cenario: OrigemLeitura | null,
  agora = new Date(),
): Promise<Registro> {
  return criarRegistro({
    perfilId,
    categoria: 'alerta',
    inicio: agora.toISOString(),
    fim: null,
    duracaoSeg: null,
    picoDb: picoDb === null ? null : Math.round(picoDb),
    gatilho,
    cenario,
    nota: null,
    acao: null,
  })
}

/** Audit log: criação, edição, exportação e exclusão de perfil. */
export function criarAuditoria(
  perfilId: string,
  acao: AcaoAuditoria,
  agora = new Date(),
): Promise<Registro> {
  return criarRegistro({
    perfilId,
    categoria: 'auditoria',
    inicio: agora.toISOString(),
    fim: null,
    duracaoSeg: null,
    picoDb: null,
    gatilho: null,
    cenario: null,
    nota: null,
    acao,
  })
}

/** Edita a nota "como me senti" de um registro. */
export async function atualizarNota(id: string, nota: string): Promise<Registro> {
  const corpo = { nota: validarEntrada(NotaSchema, nota) }
  return requisitar(`${RECURSO}/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    corpo,
    parse: comSchema(RegistroSchema),
  })
}

export async function removerRegistro(id: string): Promise<void> {
  await ignorarNaoEncontrado(
    requisitar(`${RECURSO}/${encodeURIComponent(id)}`, {
      metodo: 'DELETE',
      parse: () => undefined,
    }),
  )
}

/**
 * Apaga todos os registros de um perfil, um por vez
 * (em sequência, para não estourar o limite de requisições do MockAPI).
 */
export async function removerRegistrosDoPerfil(perfilId: string): Promise<number> {
  const { itens } = await listarRegistros(perfilId)
  for (const r of itens) await removerRegistro(r.id)
  return itens.length
}
