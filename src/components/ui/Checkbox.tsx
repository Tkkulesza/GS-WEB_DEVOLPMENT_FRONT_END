import { useId, type ReactNode } from 'react'

interface CheckboxProps {
  marcado: boolean
  aoMudar: (marcado: boolean) => void
  rotulo: ReactNode
  descricao?: ReactNode
  erro?: string | null
  disabled?: boolean
}

/** Caixa de seleção com área de toque grande (o rótulo inteiro é clicável). */
export function Checkbox({ marcado, aoMudar, rotulo, descricao, erro, disabled }: CheckboxProps) {
  const id = useId()
  const idDescricao = `${id}-descricao`
  const idErro = `${id}-erro`
  const descritoPor = [descricao ? idDescricao : null, erro ? idErro : null]
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <label
        htmlFor={id}
        className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 ${
          erro ? 'border-coral' : marcado ? 'border-teal bg-teal-soft' : 'border-line bg-card'
        }`}
      >
        <input
          id={id}
          type="checkbox"
          checked={marcado}
          onChange={(e) => aoMudar(e.target.checked)}
          disabled={disabled}
          aria-describedby={descritoPor || undefined}
          aria-invalid={erro ? true : undefined}
          className="mt-0.5 size-6 shrink-0 accent-teal"
        />
        <span>
          <span className="block font-semibold">{rotulo}</span>
          {descricao && (
            <span id={idDescricao} className="mt-1 block text-muted">
              {descricao}
            </span>
          )}
        </span>
      </label>
      {erro && (
        <p id={idErro} className="mt-2 flex items-start gap-2 font-semibold text-coral">
          <span aria-hidden="true">•</span>
          {erro}
        </p>
      )}
    </div>
  )
}
