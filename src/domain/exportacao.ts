/** Montagem do arquivo de portabilidade (LGPD, art. 18, V). Função pura. */
import type { Perfil, Registro } from './types'

export interface ExportacaoHearmony {
  app: 'Hearmony'
  formato: 1
  exportadoEm: string
  observacao: string
  perfil: Perfil
  registros: Registro[]
}

export function montarExportacao(
  perfil: Perfil,
  registros: Registro[],
  agora: Date,
): ExportacaoHearmony {
  return {
    app: 'Hearmony',
    formato: 1,
    exportadoEm: agora.toISOString(),
    observacao:
      'Cópia dos dados guardados pelo Hearmony para este perfil: o perfil sensorial e todos os registros (episódios de proteção, avisos e atividade da conta).',
    perfil,
    registros: [...registros].sort((a, b) => Date.parse(a.inicio) - Date.parse(b.inicio)),
  }
}

/** "hearmony-lu-2026-11-18.json" (sem acentos nem espaços). */
export function nomeArquivoExportacao(apelido: string, agora: Date): string {
  const slug =
    apelido
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'perfil'
  return `hearmony-${slug}-${agora.toISOString().slice(0, 10)}.json`
}
