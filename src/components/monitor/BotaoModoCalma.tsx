import { useId } from 'react'

interface BotaoModoCalmaProps {
  cancelamentoAtivo: boolean
  aoAtivar: () => void
  aoDesativar: () => void
}

/** Ação principal do Início: ligar o cancelamento na hora, mesmo abaixo do limite. */
export function BotaoModoCalma({ cancelamentoAtivo, aoAtivar, aoDesativar }: BotaoModoCalmaProps) {
  const idLegenda = useId()

  if (cancelamentoAtivo) {
    return (
      <div>
        <button
          type="button"
          onClick={aoDesativar}
          aria-describedby={idLegenda}
          className="flex min-h-20 w-full items-center justify-center rounded-3xl border-2 border-teal bg-card px-6 font-display text-2xl font-semibold text-teal-dark hover:bg-teal-soft"
        >
          Desativar o cancelamento
        </button>
        <p id={idLegenda} className="mt-2 text-center text-muted">
          O cancelamento de ruído está ligado agora.
        </p>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={aoAtivar}
        aria-describedby={idLegenda}
        className="flex min-h-20 w-full items-center justify-center gap-3 rounded-3xl bg-teal px-6 font-display text-2xl font-semibold text-white hover:bg-teal-dark"
      >
        <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden="true">
          <path
            d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        Modo Calma
      </button>
      <p id={idLegenda} className="mt-2 text-center text-muted">
        Liga o cancelamento agora, mesmo abaixo do limite.
      </p>
    </div>
  )
}
