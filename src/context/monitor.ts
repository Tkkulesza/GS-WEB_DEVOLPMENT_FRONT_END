import { createContext } from 'react'
import type { CenarioId } from '../domain/constants'
import type { NoiseMonitor } from '../hooks/useNoiseMonitor'
import type { Protecao } from '../hooks/useProtecao'

export interface MonitorApi {
  monitor: NoiseMonitor
  protecao: Protecao
  cenario: CenarioId
  setCenario: (c: CenarioId) => void
}

export const MonitorContext = createContext<MonitorApi | null>(null)
