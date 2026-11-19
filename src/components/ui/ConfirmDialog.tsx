import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  aberto: boolean
  titulo: string
  mensagem: ReactNode
  textoConfirmar: string
  textoCancelar?: string
  /** Ações destrutivas usam o botão coral. */
  perigoso?: boolean
  carregando?: boolean
  aoConfirmar: () => void
  aoCancelar: () => void
}

/**
 * Confirmação antes de ações importantes. O foco começa em "Cancelar",
 * para que um Enter sem querer não apague nada.
 */
export function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  textoConfirmar,
  textoCancelar = 'Cancelar',
  perigoso = false,
  carregando = false,
  aoConfirmar,
  aoCancelar,
}: ConfirmDialogProps) {
  return (
    <Modal
      aberto={aberto}
      titulo={titulo}
      descricao={mensagem}
      aoFechar={aoCancelar}
      bloqueado={carregando}
      rodape={
        <>
          <Button variante="ghost" onClick={aoCancelar} disabled={carregando} data-autofocus>
            {textoCancelar}
          </Button>
          <Button
            variante={perigoso ? 'danger' : 'primary'}
            onClick={aoConfirmar}
            carregando={carregando}
          >
            {textoConfirmar}
          </Button>
        </>
      }
    />
  )
}
