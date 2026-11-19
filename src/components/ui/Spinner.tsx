interface SpinnerProps {
  /** Texto lido pelo leitor de tela. Use `decorativo` quando já houver texto ao lado. */
  rotulo?: string
  decorativo?: boolean
  className?: string
}

/** Indicador de carregamento com giro lento (parado com movimento reduzido). */
export function Spinner({
  rotulo = 'Carregando',
  decorativo = false,
  className = 'size-5',
}: SpinnerProps) {
  const icone = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`${className} animate-[spin_1.6s_linear_infinite]`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )

  if (decorativo) return icone

  return (
    <span role="status" className="inline-flex items-center gap-2">
      {icone}
      <span className="sr-only">{rotulo}</span>
    </span>
  )
}
