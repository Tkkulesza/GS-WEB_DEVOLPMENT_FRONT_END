import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { useTituloPagina } from '../hooks/useTituloPagina'

export function InicioPage() {
  useTituloPagina('Início')
  return (
    <CabecalhoPagina titulo="Início" descricao="Aqui você vai acompanhar o som ao seu redor." />
  )
}
