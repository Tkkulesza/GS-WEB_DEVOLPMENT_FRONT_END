import { CENARIOS, type CenarioId } from '../../domain/constants'

interface SeletorCenarioProps {
  valor: CenarioId
  aoMudar: (c: CenarioId) => void
  desabilitado?: boolean
}

/** Escolha do lugar simulado. Radios de verdade, navegáveis pelas setas. */
export function SeletorCenario({ valor, aoMudar, desabilitado = false }: SeletorCenarioProps) {
  return (
    <fieldset disabled={desabilitado} className="disabled:opacity-60">
      <legend className="font-semibold">Onde você está?</legend>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CENARIOS.map((c) => {
          const marcado = c.id === valor
          return (
            <label
              key={c.id}
              className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 px-4 py-2 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-teal-dark ${
                marcado ? 'border-teal bg-teal-soft' : 'border-line bg-card hover:border-teal'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="cenario"
                  value={c.id}
                  checked={marcado}
                  onChange={() => aoMudar(c.id)}
                  className="size-5 accent-teal"
                />
                <span className="font-semibold">{c.nome}</span>
              </span>
              <span className="text-muted">~{c.mediaDb} dB</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
