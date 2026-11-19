import { useCallback, useEffect, useRef, useState } from 'react'
import {
  HISTORICO_CURTO_TAMANHO,
  INTERVALO_LEITURA_MS,
  PICO_SIMULADO_DB,
  PICO_SIMULADO_DURACAO_MS,
  type CenarioId,
} from '../domain/constants'
import { estimarDb, rmsDe } from '../domain/audio'
import { obterCenario, proximaLeituraSimulada } from '../domain/simulador'
import type { FonteMonitor, Leitura } from '../domain/types'

interface OpcoesMonitor {
  fonte?: FonteMonitor
  cenario: CenarioId
  intervaloMs?: number
  /** Microfone escolhido (ex.: o do fone). Sem valor, usa o padrão do aparelho. */
  dispositivoId?: string | null
}

export interface MicrofoneEmUso {
  id: string
  nome: string
}

export interface NoiseMonitor {
  db: number
  /** Muda a cada leitura (use como dependência em vez de `db`). */
  leitura: Leitura
  historicoCurto: Leitura[]
  /** Fonte em uso de fato (volta para "simulador" se o microfone falhar). */
  fonte: FonteMonitor
  erroMicrofone: string | null
  /** Qual microfone está sendo usado de fato (só no modo microfone). */
  microfoneEmUso: MicrofoneEmUso | null
  limparErroMicrofone: () => void
  /** Injeta 92 dB por 2 s (útil na apresentação). Só no simulador. */
  simularPico: () => void
}

/** Com que frequência o sinal do microfone é amostrado dentro de cada leitura. */
const AMOSTRAGEM_MICROFONE_MS = 100

function mensagemErroMicrofone(erro: unknown): string {
  const nome = erro instanceof DOMException ? erro.name : ''
  if (nome === 'NotAllowedError' || nome === 'SecurityError') {
    return 'Sem permissão para usar o microfone. Voltamos ao simulador. Se quiser, permita o acesso nas configurações do navegador.'
  }
  if (nome === 'NotFoundError' || nome === 'OverconstrainedError') {
    return 'Não encontramos um microfone. Voltamos ao simulador.'
  }
  if (nome === 'NotReadableError') {
    return 'O microfone está em uso por outro aplicativo. Voltamos ao simulador.'
  }
  return 'Não conseguimos usar o microfone aqui. Voltamos ao simulador.'
}

/**
 * Lê o volume do ambiente.
 * - "simulador": leituras geradas por cenário
 * - "microfone": estimativa a partir do nível do sinal. NUNCA grava áudio:
 *   sem MediaRecorder, sem guardar amostras, sem enviar nada. Só o número em dB é usado.
 */
export function useNoiseMonitor({
  fonte = 'simulador',
  cenario,
  intervaloMs = INTERVALO_LEITURA_MS,
  dispositivoId = null,
}: OpcoesMonitor): NoiseMonitor {
  const [historico, setHistorico] = useState<Leitura[]>(() => [
    { db: obterCenario(cenario).mediaDb, em: Date.now(), seq: 0 },
  ])
  const [erroMicrofone, setErroMicrofone] = useState<string | null>(null)
  const [microfone, setMicrofone] = useState<MicrofoneEmUso | null>(null)
  const ultima = historico[historico.length - 1]
  const ultimaRef = useRef(ultima)
  const picoAteRef = useRef(0)
  const cenarioRef = useRef(cenario)

  // Se o microfone falhou, a fonte efetiva volta a ser o simulador.
  const fonteEfetiva: FonteMonitor =
    fonte === 'microfone' && erroMicrofone === null ? 'microfone' : 'simulador'

  useEffect(() => {
    ultimaRef.current = ultima
  }, [ultima])

  useEffect(() => {
    cenarioRef.current = cenario
  }, [cenario])

  const registrar = useCallback((db: number) => {
    const nova: Leitura = { db, em: Date.now(), seq: ultimaRef.current.seq + 1 }
    ultimaRef.current = nova
    setHistorico((atual) => [...atual, nova].slice(-HISTORICO_CURTO_TAMANHO))
  }, [])

  // ----- Simulador -----
  useEffect(() => {
    if (fonteEfetiva !== 'simulador') return
    const id = setInterval(() => {
      const db =
        Date.now() < picoAteRef.current
          ? PICO_SIMULADO_DB
          : proximaLeituraSimulada(cenarioRef.current, ultimaRef.current.db)
      registrar(db)
    }, intervaloMs)
    return () => clearInterval(id)
  }, [fonteEfetiva, intervaloMs, registrar])

  // ----- Microfone (estimativa, sem gravação) -----
  useEffect(() => {
    if (fonteEfetiva !== 'microfone') return

    let cancelado = false
    let stream: MediaStream | null = null
    let contexto: AudioContext | null = null
    let amostrador: ReturnType<typeof setInterval> | undefined
    let emissor: ReturnType<typeof setInterval> | undefined

    async function iniciar() {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new DOMException('Microfone indisponível', 'NotSupportedError')
      }
      // Sem processamento do navegador: queremos o nível real do ambiente.
      const semProcessamento = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: dispositivoId
            ? { ...semProcessamento, deviceId: { exact: dispositivoId } }
            : semProcessamento,
        })
      } catch (erro) {
        // O microfone escolhido sumiu (ex.: fone desconectado): volta ao padrão do aparelho.
        const sumiu =
          erro instanceof DOMException &&
          (erro.name === 'OverconstrainedError' || erro.name === 'NotFoundError')
        if (!dispositivoId || !sumiu) throw erro
        stream = await navigator.mediaDevices.getUserMedia({ audio: semProcessamento })
      }
      if (cancelado) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }

      const faixa = stream.getAudioTracks()[0]
      setMicrofone({ id: faixa?.getSettings().deviceId ?? '', nome: faixa?.label ?? '' })

      contexto = new AudioContext()
      await contexto.resume().catch(() => undefined)
      const origem = contexto.createMediaStreamSource(stream)
      const analisador = contexto.createAnalyser()
      analisador.fftSize = 2048
      // Não conecta ao destino: nenhum som é reproduzido.
      origem.connect(analisador)

      // Buffer reaproveitado: cada amostragem sobrescreve a anterior; nada é acumulado.
      const buffer = new Float32Array(analisador.fftSize)
      let somaQuadrados = 0
      let quantidade = 0

      amostrador = setInterval(() => {
        analisador.getFloatTimeDomainData(buffer)
        const rms = rmsDe(buffer)
        somaQuadrados += rms * rms
        quantidade++
      }, AMOSTRAGEM_MICROFONE_MS)

      emissor = setInterval(() => {
        if (quantidade === 0) return
        registrar(estimarDb(Math.sqrt(somaQuadrados / quantidade)))
        somaQuadrados = 0
        quantidade = 0
      }, intervaloMs)
    }

    iniciar().catch((e: unknown) => {
      if (!cancelado) setErroMicrofone(mensagemErroMicrofone(e))
    })

    return () => {
      cancelado = true
      clearInterval(amostrador)
      clearInterval(emissor)
      stream?.getTracks().forEach((t) => t.stop())
      void contexto?.close().catch(() => undefined)
    }
  }, [fonteEfetiva, intervaloMs, registrar, dispositivoId])

  const simularPico = useCallback(() => {
    if (fonteEfetiva !== 'simulador') return
    picoAteRef.current = Date.now() + PICO_SIMULADO_DURACAO_MS
    registrar(PICO_SIMULADO_DB) // responde na hora, sem esperar o próximo intervalo
  }, [fonteEfetiva, registrar])

  const limparErroMicrofone = useCallback(() => setErroMicrofone(null), [])

  return {
    db: ultima.db,
    leitura: ultima,
    historicoCurto: historico,
    fonte: fonteEfetiva,
    erroMicrofone,
    microfoneEmUso: fonteEfetiva === 'microfone' ? microfone : null,
    limparErroMicrofone,
    simularPico,
  }
}
