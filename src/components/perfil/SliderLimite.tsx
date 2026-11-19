import { useId } from 'react'
import { LIMITE_MAX_DB, LIMITE_MIN_DB, REFERENCIAS_LIMITE } from '../../domain/constants'

interface SliderLimiteProps {
  valor: number
  aoMudar: (valor: number) => void
  erro?: string
}

/** Referência mais próxima, para dar sentido ao número. */
function referenciaDoLimite(db: number): string {
  const maisPerto = REFERENCIAS_LIMITE.reduce((a, b) =>
    Math.abs(b.db - db) < Math.abs(a.db - db) ? b : a,
  )
  return `parecido com ${maisPerto.comparacao}`
}

function limitar(v: number) {
  return Math.min(LIMITE_MAX_DB, Math.max(LIMITE_MIN_DB, Math.round(v)))
}

/** RN04: o controle só permite valores entre 40 e 90 dB. */
export function SliderLimite({ valor, aoMudar, erro }: SliderLimiteProps) {
  const id = useId()
  const idDescricao = `${id}-descricao`
  const idErro = `${id}-erro`
  const referencia = referenciaDoLimite(valor)

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <label htmlFor={id} className="font-semibold">
          Seu limite de conforto
        </label>
        <p className="font-display text-ink" aria-hidden="true">
          <span className="text-5xl font-semibold">{valor}</span>
          <span className="ml-1 text-xl">dB</span>
        </p>
      </div>
      <p id={idDescricao} className="mt-1 text-muted">
        {valor} dB é {referencia}. O cancelamento liga sozinho quando o som passa disso.
      </p>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => aoMudar(limitar(valor - 1))}
          disabled={valor <= LIMITE_MIN_DB}
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-line bg-card text-2xl font-semibold hover:border-teal disabled:opacity-50"
        >
          <span aria-hidden="true">−</span>
          <span className="sr-only">Diminuir 1 dB</span>
        </button>
        <input
          id={id}
          type="range"
          min={LIMITE_MIN_DB}
          max={LIMITE_MAX_DB}
          step={1}
          value={valor}
          onChange={(e) => aoMudar(limitar(Number(e.target.value)))}
          aria-valuetext={`${valor} decibéis, ${referencia}`}
          aria-describedby={[idDescricao, erro ? idErro : ''].filter(Boolean).join(' ')}
          aria-invalid={erro ? true : undefined}
          className="h-12 w-full cursor-pointer accent-teal"
        />
        <button
          type="button"
          onClick={() => aoMudar(limitar(valor + 1))}
          disabled={valor >= LIMITE_MAX_DB}
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-line bg-card text-2xl font-semibold hover:border-teal disabled:opacity-50"
        >
          <span aria-hidden="true">+</span>
          <span className="sr-only">Aumentar 1 dB</span>
        </button>
      </div>

      <ul className="mt-3 flex justify-between text-muted" aria-label="Referências">
        {REFERENCIAS_LIMITE.map((r) => (
          <li key={r.db} className="text-center">
            <span className="block font-semibold text-ink">{r.db} dB</span>
            {r.rotulo}
          </li>
        ))}
      </ul>

      {erro && (
        <p id={idErro} className="mt-3 flex items-start gap-2 font-semibold text-coral">
          <span aria-hidden="true">•</span>
          {erro}
        </p>
      )}
    </div>
  )
}
