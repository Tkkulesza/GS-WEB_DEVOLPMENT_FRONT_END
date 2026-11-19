import { useState } from 'react'
import type { FonteMonitor } from '../../domain/types'
import type { Microfone } from '../../hooks/useMicrofones'
import type { MicrofoneEmUso } from '../../hooks/useNoiseMonitor'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { CLASSES_INPUT } from '../ui/estilos'
import { Field } from '../ui/Field'

interface SeletorFonteProps {
  fonte: FonteMonitor
  erroMicrofone: string | null
  microfones: Microfone[]
  microfoneEmUso: MicrofoneEmUso | null
  aoUsarMicrofone: () => void
  aoUsarSimulador: () => void
  aoEscolherMicrofone: (id: string) => void
}

/**
 * Alterna entre simulador e microfone. O microfone só liga depois de um
 * consentimento explícito nesta tela (além da permissão do navegador).
 * Se houver um fone com microfone, sugere usá-lo: fica perto do ouvido e mede melhor.
 */
export function SeletorFonte({
  fonte,
  erroMicrofone,
  microfones,
  microfoneEmUso,
  aoUsarMicrofone,
  aoUsarSimulador,
  aoEscolherMicrofone,
}: SeletorFonteProps) {
  const [pedindo, setPedindo] = useState(false)
  const [concorda, setConcorda] = useState(false)

  if (fonte === 'microfone') {
    const emUso = microfones.find((m) => m.id === microfoneEmUso?.id)
    const fone = microfones.find((m) => m.ehFone)
    const usandoFone = emUso?.ehFone ?? false

    return (
      <div className="space-y-4 rounded-2xl border-2 border-teal/40 bg-teal-soft p-4">
        <p className="font-semibold">
          {usandoFone ? 'Usando o microfone do fone' : 'Usando o microfone'}
        </p>
        <p>
          O número é uma <strong>estimativa, não calibrada</strong>. Só o volume é calculado aqui no
          navegador. Nenhum áudio é gravado ou enviado.
        </p>

        {fone && !usandoFone && (
          <div className="rounded-2xl border-2 border-teal bg-card p-4">
            <p className="font-semibold">Encontramos o microfone do seu fone</p>
            <p className="mt-1 text-muted">
              Ele fica perto do ouvido, então mede melhor o som que chega até você.
            </p>
            <Button className="mt-3" larguraTotal onClick={() => aoEscolherMicrofone(fone.id)}>
              Usar o microfone do fone
            </Button>
          </div>
        )}

        {usandoFone && (
          <p className="rounded-2xl bg-card p-3">
            O microfone do fone fica perto do ouvido: a medida fica mais próxima do que você escuta.
          </p>
        )}

        {microfones.length > 1 && (
          <Field
            rotulo="Microfone"
            descricao={
              fone
                ? undefined
                : 'Se você usa fone com microfone, conecte-o: ele aparece aqui e mede mais perto do ouvido.'
            }
          >
            {(props) => (
              <select
                {...props}
                value={microfoneEmUso?.id ?? ''}
                onChange={(e) => aoEscolherMicrofone(e.target.value)}
                className={CLASSES_INPUT}
              >
                {microfones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.ehFone ? `${m.nome} · fone` : m.nome}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}

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
            <li>
              Se você usa fone com microfone, podemos usar o microfone dele: fica perto do ouvido e
              mede melhor o que você escuta.
            </li>
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
