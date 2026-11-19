import type { MinutosDia } from '../../domain/stats'

interface GraficoSemanaProps {
  dias: MinutosDia[]
  totalMinutos: number
}

/**
 * Minutos acima do limite por dia (últimos 7 dias).
 * Feito com divs: cada dia tem o valor em texto; as barras são decorativas.
 */
export function GraficoSemana({ dias, totalMinutos }: GraficoSemanaProps) {
  const maximo = Math.max(1, ...dias.map((d) => d.minutos))
  const hoje = dias[dias.length - 1]?.data

  return (
    <figure>
      <figcaption>
        <h2 className="text-xl font-semibold">Minutos acima do limite</h2>
        <p className="mt-1 text-muted">
          Últimos 7 dias · total de <strong className="text-ink">{totalMinutos} min</strong>
        </p>
      </figcaption>

      <ul className="mt-6 grid h-56 grid-cols-7 items-end gap-2">
        {dias.map((d) => {
          const altura = d.minutos === 0 ? 0 : Math.max(6, (d.minutos / maximo) * 100)
          const ehHoje = d.data === hoje
          return (
            <li key={d.data} className="flex h-full flex-col items-center justify-end gap-1">
              <span className="text-base font-semibold tabular-nums">
                {d.minutos}
                <span className="sr-only"> minutos</span>
              </span>
              <div className="flex w-full flex-1 items-end" aria-hidden="true">
                <div
                  className={`w-full rounded-t-xl ${
                    d.minutos === 0 ? 'h-1 bg-line' : ehHoje ? 'bg-teal' : 'bg-teal/45'
                  }`}
                  style={d.minutos === 0 ? undefined : { height: `${altura}%` }}
                />
              </div>
              <span className={`text-base ${ehHoje ? 'font-semibold' : 'text-muted'}`}>
                {ehHoje ? 'hoje' : d.rotulo}
              </span>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
