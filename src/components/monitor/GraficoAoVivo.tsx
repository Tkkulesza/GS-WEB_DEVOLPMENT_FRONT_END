import { HISTORICO_CURTO_TAMANHO } from '../../domain/constants'
import type { Leitura } from '../../domain/types'

const ESCALA_MIN = 30
const ESCALA_MAX = 110
const LARGURA = 300
const ALTURA = 100

interface GraficoAoVivoProps {
  leituras: Leitura[]
  limite: number
}

function y(db: number) {
  const f =
    (Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, db)) - ESCALA_MIN) / (ESCALA_MAX - ESCALA_MIN)
  return ALTURA - f * ALTURA
}

/**
 * Volume dos últimos 30 segundos, com a linha do limite.
 * Atualiza uma vez por segundo, sem animação. O desenho é decorativo:
 * o resumo em texto vai para o leitor de tela.
 */
export function GraficoAoVivo({ leituras, limite }: GraficoAoVivoProps) {
  const ultimas = leituras.slice(-HISTORICO_CURTO_TAMANHO)
  const passo = LARGURA / (HISTORICO_CURTO_TAMANHO - 1)
  // A leitura mais recente fica sempre na borda direita.
  const deslocamento = (HISTORICO_CURTO_TAMANHO - ultimas.length) * passo
  const pontos = ultimas.map(
    (l, i) => `${(deslocamento + i * passo).toFixed(1)},${y(l.db).toFixed(1)}`,
  )
  const linha = pontos.join(' ')
  const area =
    pontos.length > 1 ? `${pontos[0].split(',')[0]},${ALTURA} ${linha} ${LARGURA},${ALTURA}` : ''

  const valores = ultimas.map((l) => l.db)
  const minimo = valores.length ? Math.min(...valores) : 0
  const maximo = valores.length ? Math.max(...valores) : 0
  const acima = valores.filter((v) => v >= limite).length

  return (
    <figure>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 className="text-lg font-semibold">Últimos 30 segundos</h2>
        <span className="text-muted">
          entre {Math.round(minimo)} e {Math.round(maximo)} dB
        </span>
      </figcaption>
      <p className="sr-only">
        O volume variou entre {Math.round(minimo)} e {Math.round(maximo)} decibéis. Ficou acima do
        seu limite em {acima} {acima === 1 ? 'segundo' : 'segundos'}.
      </p>

      <div className="relative mt-4 h-32" aria-hidden="true">
        <svg
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          {area && <polygon points={area} className="fill-teal/15" />}
          <line
            x1={0}
            x2={LARGURA}
            y1={y(limite)}
            y2={y(limite)}
            strokeWidth={2}
            strokeDasharray="6 5"
            vectorEffect="non-scaling-stroke"
            className="stroke-coral"
          />
          {pontos.length > 1 && (
            <polyline
              points={linha}
              fill="none"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="stroke-teal-dark"
            />
          )}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-muted" aria-hidden="true">
        <span>30 s atrás</span>
        <span>agora</span>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1" aria-hidden="true">
        <span className="flex items-center gap-2">
          <span className="h-1 w-6 rounded-full bg-teal-dark" />
          volume
        </span>
        <span className="flex items-center gap-2 font-semibold text-coral">
          <span className="w-6 border-t-2 border-dashed border-coral" />
          seu limite · {limite} dB
        </span>
      </p>
    </figure>
  )
}
