import { Button } from './Button'

interface AvisoErroProps {
  mensagem: string
  aoTentarDeNovo?: () => void
  tentando?: boolean
}

/** Erro de carregamento no tom da marca, com opção de tentar de novo. */
export function AvisoErro({ mensagem, aoTentarDeNovo, tentando = false }: AvisoErroProps) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-3xl border border-coral/30 bg-coral-soft p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-ink">{mensagem}</p>
      {aoTentarDeNovo && (
        <Button variante="secondary" tamanho="sm" onClick={aoTentarDeNovo} carregando={tentando}>
          Tentar de novo
        </Button>
      )}
    </div>
  )
}
