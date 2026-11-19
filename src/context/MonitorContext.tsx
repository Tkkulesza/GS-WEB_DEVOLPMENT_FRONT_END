import { useMemo, useState, type ReactNode } from 'react'
import { CENARIO_PADRAO, type CenarioId } from '../domain/constants'
import { useNoiseMonitor } from '../hooks/useNoiseMonitor'
import { usePerfilAtivo } from '../hooks/usePerfilAtivo'
import { useProtecao } from '../hooks/useProtecao'
import { MonitorContext, type MonitorApi } from './monitor'

/**
 * Mantém o "sensor" e a proteção rodando no app inteiro,
 * para que trocar de página não interrompa um episódio de proteção.
 */
export function MonitorProvider({ children }: { children: ReactNode }) {
  const { perfilAtivo } = usePerfilAtivo()
  const [cenario, setCenario] = useState<CenarioId>(CENARIO_PADRAO)
  const monitor = useNoiseMonitor({ cenario })
  const protecao = useProtecao({
    leitura: monitor.leitura,
    limite: perfilAtivo?.limiteDb ?? null,
  })

  const valor = useMemo<MonitorApi>(
    () => ({ monitor, protecao, cenario, setCenario }),
    [monitor, protecao, cenario],
  )

  return <MonitorContext.Provider value={valor}>{children}</MonitorContext.Provider>
}
