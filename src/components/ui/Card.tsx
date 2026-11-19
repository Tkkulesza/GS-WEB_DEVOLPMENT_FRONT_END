import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li'
  /** "destaque" usa o fundo verde suave; "alerta", o coral suave. */
  tom?: 'neutro' | 'destaque' | 'alerta'
  espacamento?: 'sm' | 'md' | 'lg'
}

const TONS = {
  neutro: 'border-line bg-card',
  destaque: 'border-teal/30 bg-teal-soft',
  alerta: 'border-coral/30 bg-coral-soft',
}

const ESPACOS = { sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' }

export function Card({
  as: Tag = 'div',
  tom = 'neutro',
  espacamento = 'md',
  className = '',
  ...resto
}: CardProps) {
  return (
    <Tag
      className={`rounded-3xl border ${TONS[tom]} ${ESPACOS[espacamento]} ${className}`}
      {...resto}
    />
  )
}
