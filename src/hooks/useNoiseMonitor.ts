import { useCallback, useEffect, useRef, useState } from 'react'
import {
  HISTORICO_CURTO_TAMANHO,
  INTERVALO_LEITURA_MS,
  PICO_SIMULADO_DB,
  PICO_SIMULADO_DURACAO_MS,
  type CenarioId,
} from '../domain/constants'
import { obterCenario, proximaLeituraSimulada } from '../domain/simulador'
import type { FonteMonitor, Leitura } from '../domain/types'

interface OpcoesMonitor {
  fonte?: FonteMonitor
  cenario: CenarioId
  intervaloMs?: number
}

export interface NoiseMonitor {
  db: number
  /** Muda a cada leitura (use como dependência em vez de `db`). */
  leitura: Leitura
  historicoCurto: Leitura[]
  fonte: FonteMonitor
  erroMicrofone: string | null
  /** Injeta 92 dB por 2 s (útil na apresentação). */
  simularPico: () => void
}

/** Lê o volume do ambiente. Nesta versão a fonte é o simulador de cenários. */
export function useNoiseMonitor({
  fonte = 'simulador',
  cenario,
  intervaloMs = INTERVALO_LEITURA_MS,
}: OpcoesMonitor): NoiseMonitor {
  const [historico, setHistorico] = useState<Leitura[]>(() => [
    { db: obterCenario(cenario).mediaDb, em: Date.now(), seq: 0 },
  ])
  const ultima = historico[historico.length - 1]
  const ultimaRef = useRef(ultima)
  const picoAteRef = useRef(0)
  const cenarioRef = useRef(cenario)

  useEffect(() => {
    ultimaRef.current = ultima
  }, [ultima])

  useEffect(() => {
    cenarioRef.current = cenario
  }, [cenario])

  const registrar = useCallback((db: number) => {
    const agora = Date.now()
    const nova: Leitura = { db, em: agora, seq: ultimaRef.current.seq + 1 }
    ultimaRef.current = nova
    setHistorico((atual) => [...atual, nova].slice(-HISTORICO_CURTO_TAMANHO))
  }, [])

  useEffect(() => {
    if (fonte !== 'simulador') return
    const id = setInterval(() => {
      const agora = Date.now()
      const db =
        agora < picoAteRef.current
          ? PICO_SIMULADO_DB
          : proximaLeituraSimulada(cenarioRef.current, ultimaRef.current.db)
      registrar(db)
    }, intervaloMs)
    return () => clearInterval(id)
  }, [fonte, intervaloMs, registrar])

  const simularPico = useCallback(() => {
    picoAteRef.current = Date.now() + PICO_SIMULADO_DURACAO_MS
    registrar(PICO_SIMULADO_DB) // responde na hora, sem esperar o próximo intervalo
  }, [registrar])

  return {
    db: ultima.db,
    leitura: ultima,
    historicoCurto: historico,
    fonte,
    erroMicrofone: null,
    simularPico,
  }
}
