import type { Faixa } from '../../domain/types'

/** Cores por faixa. Sempre usadas junto com texto e ícone, nunca sozinhas. */
export const COR_FAIXA: Record<Faixa, { traco: string; fundo: string; texto: string }> = {
  tranquilo: { traco: 'stroke-teal', fundo: 'bg-teal-soft', texto: 'text-teal-dark' },
  atencao: { traco: 'stroke-amber', fundo: 'bg-amber-soft', texto: 'text-amber' },
  alto: { traco: 'stroke-coral', fundo: 'bg-coral-soft', texto: 'text-coral' },
}
