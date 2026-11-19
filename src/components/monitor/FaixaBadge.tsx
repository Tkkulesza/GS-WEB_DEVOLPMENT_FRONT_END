import { ROTULO_FAIXA } from '../../domain/rules'
import type { Faixa } from '../../domain/types'
import { COR_FAIXA } from './estilosFaixa'

/** Formas diferentes por faixa: a informação não depende só da cor. */
function Forma({ faixa }: { faixa: Faixa }) {
  const classe = 'size-3.5 fill-current'
  if (faixa === 'tranquilo')
    return (
      <svg viewBox="0 0 14 14" className={classe} aria-hidden="true">
        <circle cx="7" cy="7" r="6" />
      </svg>
    )
  if (faixa === 'atencao')
    return (
      <svg viewBox="0 0 14 14" className={classe} aria-hidden="true">
        <path d="M7 1 13 13H1z" />
      </svg>
    )
  return (
    <svg viewBox="0 0 14 14" className={classe} aria-hidden="true">
      <rect x="1" y="1" width="12" height="12" rx="2" />
    </svg>
  )
}

interface FaixaBadgeProps {
  faixa: Faixa
  tamanho?: 'md' | 'lg'
}

export function FaixaBadge({ faixa, tamanho = 'md' }: FaixaBadgeProps) {
  const cor = COR_FAIXA[faixa]
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-semibold ${cor.fundo} ${cor.texto} ${
        tamanho === 'lg' ? 'px-4 py-2 text-lg' : 'px-3 py-1 text-base'
      }`}
    >
      <Forma faixa={faixa} />
      {ROTULO_FAIXA[faixa]}
    </span>
  )
}
