/**
 * CRUD do resource `perfis` no MockAPI.
 * Toda entrada é validada com zod antes de sair do navegador (RN04, RN05, LGPD).
 */
import { PerfilInputSchema, PerfilSchema, type ListaValidada } from '../domain/schemas'
import type { Perfil, PerfilInput } from '../domain/types'
import { comLista, comSchema, ignorarNaoEncontrado, requisitar, validarEntrada } from './http'
import { removerRegistrosDoPerfil } from './registrosService'

const RECURSO = 'perfis'

function caminho(id: string) {
  return `${RECURSO}/${encodeURIComponent(id)}`
}

export async function listarPerfis(signal?: AbortSignal): Promise<ListaValidada<Perfil>> {
  const r = await requisitar(RECURSO, {
    parse: comLista(PerfilSchema),
    vazioEm404: true,
    signal,
  })
  const itens = [...r.itens].sort((a, b) => a.apelido.localeCompare(b.apelido, 'pt-BR'))
  return { itens, descartados: r.descartados }
}

export function obterPerfil(id: string, signal?: AbortSignal): Promise<Perfil> {
  return requisitar(caminho(id), { parse: comSchema(PerfilSchema), signal })
}

export async function criarPerfil(dados: PerfilInput, agora = new Date()): Promise<Perfil> {
  const valido = validarEntrada(PerfilInputSchema, dados)
  const quando = agora.toISOString()
  return requisitar(RECURSO, {
    metodo: 'POST',
    corpo: { ...valido, criadoEm: quando, atualizadoEm: quando },
    parse: comSchema(PerfilSchema),
  })
}

export async function atualizarPerfil(
  id: string,
  dados: PerfilInput,
  agora = new Date(),
): Promise<Perfil> {
  const valido = validarEntrada(PerfilInputSchema, dados)
  return requisitar(caminho(id), {
    metodo: 'PUT',
    corpo: { ...valido, atualizadoEm: agora.toISOString() },
    parse: comSchema(PerfilSchema),
  })
}

/** Remove só o perfil. Prefira `excluirPerfilEmCascata` para não deixar registros órfãos. */
export async function removerPerfil(id: string): Promise<void> {
  await ignorarNaoEncontrado(requisitar(caminho(id), { metodo: 'DELETE', parse: () => undefined }))
}

/**
 * Exclusão em cascata: apaga todos os registros do perfil (inclusive a auditoria)
 * e depois o próprio perfil. Direito de eliminação (LGPD, art. 18, VI).
 */
export async function excluirPerfilEmCascata(id: string): Promise<{ registrosApagados: number }> {
  const registrosApagados = await removerRegistrosDoPerfil(id)
  await removerPerfil(id)
  return { registrosApagados }
}
