import type { Faixa } from '../../domain/types'
import { COR_FAIXA } from './estilosFaixa'

/** Escala do medidor. */
const ESCALA_MIN = 30
const ESCALA_MAX = 110
const MARCAS = [40, 60, 80, 100]
const RAIO = 80
const CENTRO = { x: 100, y: 100 }
/** Área do desenho, com margem para os números da escala. */
const VISTA = { x: -26, y: -24, largura: 252, altura: 136 }

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

/** Converte um ponto do desenho em posição CSS (%) para os rótulos em HTML. */
function posicao(p: { x: number; y: number }) {
  return {
    left: `${((p.x - VISTA.x) / VISTA.largura) * 100}%`,
    top: `${((p.y - VISTA.y) / VISTA.altura) * 100}%`,
  }
}

const ARCO = `M ${CENTRO.x - RAIO} ${CENTRO.y} A ${RAIO} ${RAIO} 0 0 1 ${CENTRO.x + RAIO} ${CENTRO.y}`
const COMPRIMENTO = Math.PI * RAIO

/**
 * Medidor em arco (SVG) com o número grande em dB, a escala e a marca do limite.
 * O desenho e os rótulos da escala são decorativos; o número e a faixa estão em texto.
 * Os rótulos são HTML (não texto do SVG) para manter 16 px em qualquer tela.
 */
export function DecibelGauge({ db, limite, faixa }: DecibelGaugeProps) {
  const preenchido = fracao(db) * COMPRIMENTO
  const fLimite = limite !== null ? fracao(limite) : null
  // A marca do limite atravessa o arco, para ser vista sobre qualquer cor.
  const linhaLimite =
    fLimite !== null
      ? { de: pontoNoArco(fLimite, RAIO - 12), ate: pontoNoArco(fLimite, RAIO + 16) }
      : null

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <svg
        viewBox={`${VISTA.x} ${VISTA.y} ${VISTA.largura} ${VISTA.altura}`}
        className="w-full"
        aria-hidden="true"
      >
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
        {MARCAS.map((m) => {
          const a = pontoNoArco(fracao(m), RAIO + 11)
          const b = pontoNoArco(fracao(m), RAIO + 16)
          return (
            <line
              key={m}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-muted"
            />
          )
        })}
        {linhaLimite && (
          <line
            x1={linhaLimite.de.x}
            y1={linhaLimite.de.y}
            x2={linhaLimite.ate.x}
            y2={linhaLimite.ate.y}
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-ink"
          />
        )}
      </svg>

      <div aria-hidden="true">
        {MARCAS.map((m) => (
          <span
            key={m}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-muted tabular-nums"
            style={posicao(pontoNoArco(fracao(m), RAIO + 31))}
          >
            {m}
          </span>
        ))}
        {fLimite !== null && (
          <span
            className="absolute -translate-x-1/2 -translate-y-1/2 font-semibold whitespace-nowrap text-ink"
            style={posicao(pontoNoArco(fLimite, RAIO - 30))}
          >
            limite
          </span>
        )}
      </div>

      <p className="absolute inset-x-0 bottom-0 text-center font-display text-ink">
        <span className="sr-only">Volume agora: </span>
        <span className="text-6xl font-semibold tabular-nums">{Math.round(db)}</span>
        <span className="ml-1 text-2xl">dB</span>
      </p>
    </div>
  )
}
