import { useEffect, useState } from 'react'

/** Mesmo ritmo do círculo animado: 5 s inspirando, 5 s soltando o ar. */
const FASE_MS = 5_000

/**
 * Guia da respiração em texto, para quando não há movimento na tela
 * (aparelho pedindo menos movimento ou "Sem movimento" em Ajustes).
 * Trocar o texto não é animação. Fica fora do leitor de tela para não repetir a cada 5 s.
 */
export function GuiaRespiracao() {
  const [inspirando, setInspirando] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setInspirando((v) => !v), FASE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="so-sem-movimento -mt-4 mb-6" aria-hidden="true">
      <p className="text-muted">Se quiser, respire no ritmo:</p>
      <p className="mt-1 font-display text-2xl font-semibold text-teal-dark">
        {inspirando ? 'Inspire devagar…' : 'Solte o ar devagar…'}
      </p>
    </div>
  )
}
