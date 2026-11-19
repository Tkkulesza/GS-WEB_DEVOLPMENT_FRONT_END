import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { useTituloPagina } from '../hooks/useTituloPagina'

export function SobrePage() {
  useTituloPagina('Sobre o Hearmony')
  return (
    <CabecalhoPagina
      titulo="Sobre o Hearmony"
      descricao="Proteção auditiva automática para quem tem hipersensibilidade sonora."
    />
  )
}
