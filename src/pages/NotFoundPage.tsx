import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { classesBotao } from '../components/ui/estilos'
import { useTituloPagina } from '../hooks/useTituloPagina'

export function NotFoundPage() {
  useTituloPagina('Página não encontrada')
  return (
    <>
      <h1 className="sr-only">Página não encontrada</h1>
      <EmptyState
        icone="info"
        titulo="Essa página não existe"
        descricao="O endereço pode ter mudado ou ter sido digitado de outro jeito. Tudo bem: você pode voltar para o início."
        acao={
          <Link to="/" className={classesBotao('primary', 'lg')}>
            Voltar para o início
          </Link>
        }
      />
    </>
  )
}
