interface StepIndicatorProps {
  atual: number
  total: number
  /** Nome curto da etapa atual (ex.: "Sons"). */
  nome: string
}

/** "Etapa X de 4" em texto, com barras decorativas. */
export function StepIndicator({ atual, total, nome }: StepIndicatorProps) {
  return (
    <div className="mb-6">
      <p className="font-semibold text-teal-dark">
        Etapa {atual} de {total}
        <span className="text-muted"> · {nome}</span>
      </p>
      <div className="mt-2 flex gap-2" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full ${i < atual ? 'bg-teal' : 'bg-line'}`}
          />
        ))}
      </div>
    </div>
  )
}
