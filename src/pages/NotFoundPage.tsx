import { Link } from 'react-router-dom'
import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { useTituloPagina } from '../hooks/useTituloPagina'

export function NotFoundPage() {
  useTituloPagina('Página não encontrada')
  return (
    <>
      <CabecalhoPagina
        titulo="Essa página não existe"
        descricao="O endereço pode ter mudado. Você pode voltar para o início."
      />
      <Link
        to="/"
        className="inline-flex min-h-11 items-center rounded-2xl bg-teal px-5 font-semibold text-white hover:bg-teal-dark"
      >
        Voltar para o início
      </Link>
    </>
  )
}
