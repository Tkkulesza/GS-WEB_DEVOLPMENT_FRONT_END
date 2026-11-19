import { useCallback, useState } from 'react'
import { montarExportacao, nomeArquivoExportacao } from '../domain/exportacao'
import type { Perfil } from '../domain/types'
import { baixarJson } from '../services/download'
import { criarAuditoria, listarRegistros } from '../services/registrosService'
import { usePerfilAtivo } from './usePerfilAtivo'
import { useRegistros } from './useRegistros'

/**
 * Direitos do titular (LGPD): ver a atividade da conta, exportar (portabilidade)
 * e excluir tudo (eliminação).
 */
export function useMeusDados(perfil: Perfil | null) {
  const { remover } = usePerfilAtivo()
  const auditoria = useRegistros(perfil?.id ?? null, { categoria: 'auditoria' })
  const [exportando, setExportando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const recarregarAuditoria = auditoria.recarregar

  /** Registra a exportação e baixa o JSON com o perfil e todos os registros. */
  const exportar = useCallback(async () => {
    if (!perfil) return
    setExportando(true)
    try {
      try {
        await criarAuditoria(perfil.id, 'dados_exportados')
      } catch {
        // a exportação é um direito: segue mesmo se a auditoria falhar
      }
      const { itens } = await listarRegistros(perfil.id)
      const agora = new Date()
      baixarJson(
        nomeArquivoExportacao(perfil.apelido, agora),
        montarExportacao(perfil, itens, agora),
      )
      recarregarAuditoria()
    } finally {
      setExportando(false)
    }
  }, [perfil, recarregarAuditoria])

  /** Exclui o perfil e todos os registros dele, inclusive a auditoria. */
  const excluirTudo = useCallback(async () => {
    if (!perfil) return
    setExcluindo(true)
    try {
      await remover(perfil.id)
    } finally {
      setExcluindo(false)
    }
  }, [perfil, remover])

  return {
    atividade: auditoria.registros,
    carregandoAtividade: auditoria.carregando,
    erroAtividade: auditoria.erro,
    recarregarAtividade: recarregarAuditoria,
    exportar,
    exportando,
    excluirTudo,
    excluindo,
  }
}
