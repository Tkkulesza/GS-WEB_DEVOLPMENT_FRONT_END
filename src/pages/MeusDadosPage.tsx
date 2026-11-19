import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { useTituloPagina } from '../hooks/useTituloPagina'

export function MeusDadosPage() {
  useTituloPagina('Meus dados')
  return (
    <CabecalhoPagina
      titulo="Meus dados"
      descricao="Aqui você vai ver, exportar ou apagar seus dados."
    />
  )
}
