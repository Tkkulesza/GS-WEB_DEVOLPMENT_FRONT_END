import { useState } from 'react'
import type { FonteMonitor } from '../../domain/types'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'

interface SeletorFonteProps {
  fonte: FonteMonitor
  erroMicrofone: string | null
  aoUsarMicrofone: () => void
  aoUsarSimulador: () => void
}

/**
 * Alterna entre simulador e microfone. O microfone só liga depois de um
 * consentimento explícito nesta tela (além da permissão do navegador).
 */
export function SeletorFonte({
  fonte,
  erroMicrofone,
  aoUsarMicrofone,
  aoUsarSimulador,
}: SeletorFonteProps) {
  const [pedindo, setPedindo] = useState(false)
  const [concorda, setConcorda] = useState(false)

  if (fonte === 'microfone') {
    return (
      <div className="space-y-3 rounded-2xl border-2 border-teal/40 bg-teal-soft p-4">
        <p className="font-semibold">Usando o microfone</p>
        <p>
          O número é uma <strong>estimativa, não calibrada</strong>. Só o volume é calculado aqui no
          navegador. Nenhum áudio é gravado ou enviado.
        </p>
        <Button variante="secondary" larguraTotal onClick={aoUsarSimulador}>
          Voltar ao simulador
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {erroMicrofone && (
        <p role="status" className="rounded-2xl bg-paper2 p-4">
          {erroMicrofone}
        </p>
      )}

      {!pedindo ? (
        <Button variante="ghost" larguraTotal onClick={() => setPedindo(true)}>
          Usar o microfone do aparelho
        </Button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-line bg-paper p-4">
          <p className="font-semibold">Antes de ligar o microfone</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>O navegador vai pedir permissão.</li>
            <li>Calculamos só o volume, em números, aqui no aparelho.</li>
            <li>Nenhum áudio é gravado, guardado ou enviado.</li>
            <li>O valor é uma estimativa, sem calibração.</li>
          </ul>
          <Checkbox
            marcado={concorda}
            aoMudar={setConcorda}
            rotulo="Entendi e quero usar o microfone"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              disabled={!concorda}
              onClick={() => {
                setPedindo(false)
                setConcorda(false)
                aoUsarMicrofone()
              }}
            >
              Ligar microfone
            </Button>
            <Button variante="ghost" onClick={() => setPedindo(false)}>
              Agora não
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
