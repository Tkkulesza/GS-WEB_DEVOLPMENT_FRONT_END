import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { useTituloPagina } from '../hooks/useTituloPagina'

export function HistoricoPage() {
  useTituloPagina('Histórico')
  return (
    <CabecalhoPagina
      titulo="Histórico"
      descricao="Aqui você vai ver quando o cancelamento foi ativado."
    />
  )
}
