export type ValorFiltro = 'todos' | 'automatico' | 'pico' | 'modo_calma' | 'alertas'

const OPCOES: { valor: ValorFiltro; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'automatico', rotulo: 'Ligou sozinho' },
  { valor: 'pico', rotulo: 'Pico' },
  { valor: 'modo_calma', rotulo: 'Modo Calma' },
  { valor: 'alertas', rotulo: 'Avisos' },
]

interface FiltroGatilhoProps {
  valor: ValorFiltro
  aoMudar: (v: ValorFiltro) => void
}

export function FiltroGatilho({ valor, aoMudar }: FiltroGatilhoProps) {
  return (
    <fieldset>
      <legend className="font-semibold">Mostrar</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {OPCOES.map((o) => (
          <label
            key={o.valor}
            className={`flex min-h-11 cursor-pointer items-center rounded-full border-2 px-4 font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-teal-dark ${
              o.valor === valor
                ? 'border-teal bg-teal text-white'
                : 'border-line-strong bg-card hover:border-teal'
            }`}
          >
            <input
              type="radio"
              name="filtro-gatilho"
              className="sr-only"
              checked={o.valor === valor}
              onChange={() => aoMudar(o.valor)}
            />
            {o.valor === valor && (
              <span aria-hidden="true" className="mr-1.5">
                ✓
              </span>
            )}
            {o.rotulo}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
