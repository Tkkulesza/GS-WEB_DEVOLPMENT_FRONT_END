import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMonitor } from '../../hooks/useMonitor'

/**
 * Sempre montado no layout:
 * - anuncia (polite) quando a proteção liga ou desliga, em qualquer página
 * - fora do Início, mostra uma faixa discreta com atalho para lá
 */
export function AnuncioProtecao() {
  const { protecao } = useMonitor()
  const { pathname } = useLocation()
  const ativa = protecao.ativa
  // Só anuncia o desligamento depois que a proteção ligou alguma vez.
  const [jaLigou, setJaLigou] = useState(false)
  if (ativa && !jaLigou) setJaLigou(true)

  const anuncio = ativa
    ? 'Ativamos o cancelamento de ruído.'
    : jaLigou
      ? 'O cancelamento de ruído foi desligado.'
      : ''

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>
      {ativa && pathname !== '/' && (
        <div className="border-b border-teal/30 bg-teal-soft">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-2 lg:max-w-5xl">
            <p className="font-semibold text-teal-dark">O cancelamento de ruído está ligado.</p>
            <Link
              to="/"
              className="flex min-h-11 items-center rounded-2xl px-3 font-semibold text-teal-dark underline underline-offset-4 hover:bg-card"
            >
              Ver no Início
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
