import { useContext } from 'react'
import { MonitorContext, type MonitorApi } from '../context/monitor'

/** Leituras, proteção e cenário atual. Precisa do <MonitorProvider> acima. */
export function useMonitor(): MonitorApi {
  const api = useContext(MonitorContext)
  if (!api) throw new Error('useMonitor precisa estar dentro de <MonitorProvider>.')
  return api
}
