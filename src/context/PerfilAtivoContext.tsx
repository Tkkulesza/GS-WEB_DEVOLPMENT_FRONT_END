import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePerfis } from '../hooks/usePerfis'
import { lerPreferencia, salvarPreferencia } from '../services/armazenamentoLocal'
import { PerfilAtivoContext, type PerfilAtivoApi } from './perfilAtivo'

const CHAVE = 'perfilAtivoId'

/**
 * Guarda qual perfil está em uso. Só o id fica no navegador (localStorage);
 * os dados do perfil vêm da API por meio de usePerfis, numa única fonte para o app todo.
 */
export function PerfilAtivoProvider({ children }: { children: ReactNode }) {
  const perfisApi = usePerfis()
  const [idEscolhido, setIdEscolhido] = useState<string | null>(() => lerPreferencia(CHAVE))

  // Se o id salvo não existe mais (perfil excluído), usa o primeiro da lista.
  const perfilAtivo =
    perfisApi.perfis.find((p) => p.id === idEscolhido) ?? perfisApi.perfis[0] ?? null

  const idEfetivo = perfilAtivo?.id ?? null
  const carregando = perfisApi.carregando

  useEffect(() => {
    if (!carregando) salvarPreferencia(CHAVE, idEfetivo)
  }, [idEfetivo, carregando])

  const valor = useMemo<PerfilAtivoApi>(
    () => ({ ...perfisApi, perfilAtivo, selecionarPerfil: setIdEscolhido }),
    [perfisApi, perfilAtivo],
  )

  return <PerfilAtivoContext.Provider value={valor}>{children}</PerfilAtivoContext.Provider>
}
