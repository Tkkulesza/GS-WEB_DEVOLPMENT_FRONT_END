import { SONS, type SomId } from '../../domain/constants'

interface ChipsSonsProps {
  selecionados: SomId[]
  aoMudar: (sons: SomId[]) => void
  /** id do título que nomeia o grupo. */
  idRotulo: string
  idErro?: string
  erro?: string
}

/** Seleção múltipla em "chips". Cada chip é um checkbox de verdade (teclado e leitor de tela). */
export function ChipsSons({ selecionados, aoMudar, idRotulo, idErro, erro }: ChipsSonsProps) {
  function alternar(id: SomId) {
    aoMudar(
      selecionados.includes(id) ? selecionados.filter((s) => s !== id) : [...selecionados, id],
    )
  }

  return (
    <div
      role="group"
      aria-labelledby={idRotulo}
      aria-describedby={erro ? idErro : undefined}
      data-invalido={erro ? 'true' : undefined}
    >
      <ul className="flex flex-wrap gap-3">
        {SONS.map((som) => {
          const marcado = selecionados.includes(som.id)
          return (
            <li key={som.id}>
              <label
                className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-2 px-4 font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-teal-dark ${
                  marcado
                    ? 'border-teal bg-teal text-white'
                    : 'border-line bg-card text-ink hover:border-teal'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={marcado}
                  onChange={() => alternar(som.id)}
                />
                <span aria-hidden="true">{marcado ? '✓' : '+'}</span>
                {som.rotulo}
              </label>
            </li>
          )
        })}
      </ul>
      {erro && (
        <p id={idErro} className="mt-3 flex items-start gap-2 font-semibold text-coral">
          <span aria-hidden="true">•</span>
          {erro}
        </p>
      )}
    </div>
  )
}
