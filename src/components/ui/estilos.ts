/**
 * Classes compartilhadas dos componentes de UI.
 * Ficam fora dos .tsx para que um <Link> possa ter a mesma cara de um <Button>.
 */
export type VarianteBotao = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost'
export type TamanhoBotao = 'sm' | 'md' | 'lg'

const BASE_BOTAO =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTES: Record<VarianteBotao, string> = {
  primary: 'bg-teal text-white hover:bg-teal-hover',
  secondary: 'border-2 border-teal bg-card text-teal-dark hover:bg-teal-soft',
  ghost: 'text-teal-dark hover:bg-teal-soft',
  danger: 'bg-coral-forte text-white hover:bg-coral-forte-hover',
  'danger-ghost': 'text-coral hover:bg-coral-soft',
}

const TAMANHOS: Record<TamanhoBotao, string> = {
  sm: 'min-h-11 px-3 text-base',
  md: 'min-h-12 px-5 text-base',
  lg: 'min-h-16 px-6 text-lg',
}

export function classesBotao(
  variante: VarianteBotao = 'primary',
  tamanho: TamanhoBotao = 'md',
  extra = '',
): string {
  return [BASE_BOTAO, VARIANTES[variante], TAMANHOS[tamanho], extra].filter(Boolean).join(' ')
}

export const CLASSES_INPUT =
  'block w-full min-h-12 rounded-2xl border-2 border-line-strong bg-card px-4 py-2 text-base text-ink placeholder:text-muted hover:border-ink focus:border-teal aria-[invalid=true]:border-coral'
