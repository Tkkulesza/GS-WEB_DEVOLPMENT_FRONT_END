import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { useTituloPagina } from '../hooks/useTituloPagina'

export function PerfisPage() {
  useTituloPagina('Perfis')
  return (
    <CabecalhoPagina
      titulo="Perfis"
      descricao="Aqui você vai escolher, editar ou excluir perfis."
    />
  )
}
