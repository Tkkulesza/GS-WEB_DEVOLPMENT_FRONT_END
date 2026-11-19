import type { Registro } from '../../domain/types'
import { useNotaEditavel, type StatusNota } from '../../hooks/useNotaEditavel'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { TextArea } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { formatarDiaHora } from './formatos'

const TEXTO_STATUS: Record<StatusNota, string> = {
  ocioso: '',
  pendente: '',
  salvando: 'Salvando…',
  salvo: 'Nota salva.',
  erro: '',
}

interface ModalNotaProps {
  registro: Registro
  salvar: (id: string, nota: string) => Promise<unknown>
  aoFechar: () => void
}

/** Nota "como me senti", salva sozinha enquanto a pessoa escreve. */
export function ModalNota({ registro, salvar, aoFechar }: ModalNotaProps) {
  const nota = useNotaEditavel(registro, salvar)

  async function fechar() {
    await nota.finalizar()
    aoFechar()
  }

  return (
    <Modal
      aberto
      titulo="Como você se sentiu?"
      descricao={`Episódio de ${formatarDiaHora(registro.inicio)}. A nota é salva sozinha.`}
      aoFechar={() => void fechar()}
      bloqueado={nota.status === 'salvando'}
      rodape={
        <Button onClick={() => void fechar()} carregando={nota.status === 'salvando'}>
          Pronto
        </Button>
      }
    >
      <Field
        rotulo="Sua nota"
        descricao={`Até 280 caracteres. Faltam ${nota.restantes}.`}
        erro={nota.erro}
      >
        {(props) => (
          <TextArea
            {...props}
            value={nota.texto}
            onChange={(e) => nota.alterar(e.target.value)}
            maxLength={280}
            data-autofocus
          />
        )}
      </Field>
      <p className="mt-2 min-h-6 text-muted" aria-live="polite">
        {TEXTO_STATUS[nota.status]}
      </p>
    </Modal>
  )
}
