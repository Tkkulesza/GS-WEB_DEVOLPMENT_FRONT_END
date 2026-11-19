import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { CENARIO_PADRAO, type CenarioId } from '../domain/constants'
import { useNoiseMonitor } from '../hooks/useNoiseMonitor'
import { usePerfilAtivo } from '../hooks/usePerfilAtivo'
import { useProtecao } from '../hooks/useProtecao'
import { useToast } from '../hooks/useToast'
import { MonitorContext, type MonitorApi } from './monitor'

/**
 * Mantém o "sensor" e a proteção rodando no app inteiro,
 * para que trocar de página não interrompa um episódio de proteção.
 */
export function MonitorProvider({ children }: { children: ReactNode }) {
  const { perfilAtivo } = usePerfilAtivo()
  const [cenario, setCenario] = useState<CenarioId>(CENARIO_PADRAO)
  const monitor = useNoiseMonitor({ cenario })
  const { mostrar } = useToast()

  const aoAvisarResponsavel = useCallback(
    (nome: string, gatilho: 'ajuda' | 'persistente') => {
      mostrar(
        gatilho === 'persistente'
          ? `O barulho continua alto há mais de 10 minutos. Avisamos ${nome}.`
          : `Avisamos ${nome}.`,
        'sucesso',
      )
    },
    [mostrar],
  )
  const aoFalhar = useCallback((mensagem: string) => mostrar(mensagem, 'erro'), [mostrar])

  const protecao = useProtecao({
    leitura: monitor.leitura,
    perfil: perfilAtivo,
    origem: monitor.fonte === 'microfone' ? 'microfone' : cenario,
    aoAvisarResponsavel,
    aoFalhar,
  })

  const valor = useMemo<MonitorApi>(
    () => ({ monitor, protecao, cenario, setCenario }),
    [monitor, protecao, cenario],
  )

  return <MonitorContext.Provider value={valor}>{children}</MonitorContext.Provider>
}
