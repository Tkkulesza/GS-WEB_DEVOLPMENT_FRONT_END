import type { ButtonHTMLAttributes } from 'react'
import { classesBotao, type TamanhoBotao, type VarianteBotao } from './estilos'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao
  tamanho?: TamanhoBotao
  /** Mostra o indicador e bloqueia novos cliques (evita envio duplo). */
  carregando?: boolean
  larguraTotal?: boolean
}

export function Button({
  variante = 'primary',
  tamanho = 'md',
  carregando = false,
  larguraTotal = false,
  disabled,
  className = '',
  type = 'button',
  children,
  ...resto
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={classesBotao(variante, tamanho, `${larguraTotal ? 'w-full' : ''} ${className}`)}
      {...resto}
    >
      {carregando && <Spinner decorativo />}
      {children}
    </button>
  )
}
