/** Textos curtos para exibir dados do domínio na interface. */
import { CENARIOS } from './constants'
import type { AcaoAuditoria, Gatilho, OrigemLeitura } from './types'

export const ROTULO_GATILHO: Record<Gatilho, string> = {
  automatico: 'Ligou sozinho',
  pico: 'Pico de barulho',
  modo_calma: 'Modo Calma',
  ajuda: 'Você pediu ajuda',
  persistente: 'Barulho alto por mais de 10 minutos',
}

export const ROTULO_ACAO: Record<AcaoAuditoria, string> = {
  perfil_criado: 'Perfil criado',
  perfil_editado: 'Perfil editado',
  dados_exportados: 'Dados exportados',
  perfil_excluido: 'Perfil excluído',
}

export function rotuloOrigem(origem: OrigemLeitura | null): string | null {
  if (origem === null) return null
  if (origem === 'microfone') return 'Microfone (estimativa)'
  return CENARIOS.find((c) => c.id === origem)?.nome ?? null
}
