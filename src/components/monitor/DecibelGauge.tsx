import type { Faixa } from '../../domain/types'
import { COR_FAIXA } from './estilosFaixa'

/** Escala do medidor. */
const ESCALA_MIN = 30
const ESCALA_MAX = 110
const RAIO = 80
const CENTRO = { x: 100, y: 100 }

interface DecibelGaugeProps {
  db: number
  limite: number | null
  faixa: Faixa
}

/** Posição (0–1) de um valor na escala. */
function fracao(db: number) {
  return Math.min(1, Math.max(0, (db - ESCALA_MIN) / (ESCALA_MAX - ESCALA_MIN)))
}

/** Ponto no arco de 180° (da esquerda para a direita, por cima). */
function pontoNoArco(f: number, raio = RAIO) {
  const angulo = Math.PI * (1 - f)
  return { x: CENTRO.x + raio * Math.cos(angulo), y: CENTRO.y - raio * Math.sin(angulo) }
}

const ARCO = `M ${CENTRO.x - RAIO} ${CENTRO.y} A ${RAIO} ${RAIO} 0 0 1 ${CENTRO.x + RAIO} ${CENTRO.y}`
const COMPRIMENTO = Math.PI * RAIO

/**
 * Medidor em arco (SVG) com o número grande em dB.
 * O desenho é decorativo; o número e a faixa estão em texto.
 */
export function DecibelGauge({ db, limite, faixa }: DecibelGaugeProps) {
  const preenchido = fracao(db) * COMPRIMENTO
  const marca = limite !== null ? pontoNoArco(fracao(limite)) : null
  const marcaFora = limite !== null ? pontoNoArco(fracao(limite), RAIO + 16) : null

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <svg viewBox="0 0 200 116" className="w-full" aria-hidden="true">
        <path
          d={ARCO}
          fill="none"
          strokeWidth="16"
          strokeLinecap="round"
          className="stroke-muted/25"
        />
        <path
          d={ARCO}
          fill="none"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={COMPRIMENTO}
          strokeDashoffset={COMPRIMENTO - preenchido}
          className={`${COR_FAIXA[faixa].traco} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
        {marca && marcaFora && (
          <line
            x1={marca.x}
            y1={marca.y}
            x2={marcaFora.x}
            y2={marcaFora.y}
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-ink"
          />
        )}
      </svg>
      <p className="absolute inset-x-0 bottom-0 text-center font-display text-ink">
        <span className="sr-only">Volume agora: </span>
        <span className="text-6xl font-semibold tabular-nums">{Math.round(db)}</span>
        <span className="ml-1 text-2xl">dB</span>
      </p>
    </div>
  )
}
