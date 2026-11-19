import { createContext } from 'react'
import type { CenarioId } from '../domain/constants'
import type { FonteMonitor } from '../domain/types'
import type { NoiseMonitor } from '../hooks/useNoiseMonitor'
import type { Protecao } from '../hooks/useProtecao'

export interface MonitorApi {
  monitor: NoiseMonitor
  protecao: Protecao
  cenario: CenarioId
  setCenario: (c: CenarioId) => void
  /** Troca entre simulador e microfone (o microfone só com consentimento na tela). */
  escolherFonte: (f: FonteMonitor) => void
}

export const MonitorContext = createContext<MonitorApi | null>(null)
