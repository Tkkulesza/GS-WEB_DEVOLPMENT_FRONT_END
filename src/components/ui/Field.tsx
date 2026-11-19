import { useId, type ReactNode } from 'react'

/** Atributos que o Field entrega ao controle para associar rótulo, descrição e erro. */
export interface PropsControle {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

interface FieldProps {
  rotulo: ReactNode
  descricao?: ReactNode
  erro?: string | null
  /** Renderiza o controle com os atributos de acessibilidade já ligados. */
  children: (props: PropsControle) => ReactNode
  id?: string
  className?: string
}

/**
 * Rótulo + controle + descrição + erro, associados por `aria-describedby`.
 * O erro aparece em texto (nunca só pela cor da borda).
 */
export function Field({ rotulo, descricao, erro, children, id, className = '' }: FieldProps) {
  const gerado = useId()
  const idControle = id ?? gerado
  const idDescricao = `${idControle}-descricao`
  const idErro = `${idControle}-erro`

  const descritoPor = [descricao ? idDescricao : null, erro ? idErro : null]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <label htmlFor={idControle} className="block font-semibold text-ink">
        {rotulo}
      </label>
      {descricao && (
        <p id={idDescricao} className="mt-1 text-muted">
          {descricao}
        </p>
      )}
      <div className="mt-2">
        {children({
          id: idControle,
          'aria-describedby': descritoPor || undefined,
          'aria-invalid': erro ? true : undefined,
        })}
      </div>
      {erro && (
        <p id={idErro} className="mt-2 flex items-start gap-2 font-semibold text-coral">
          <span aria-hidden="true">•</span>
          {erro}
        </p>
      )}
    </div>
  )
}
