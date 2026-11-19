import { Spinner } from '../ui/Spinner'

interface CarregandoPaginaProps {
  /** Título da página (h1 para leitores de tela enquanto carrega). */
  titulo: string
  rotulo?: string
}

/** Estado de carregamento de página inteira, sempre com um h1. */
export function CarregandoPagina({ titulo, rotulo = 'Carregando' }: CarregandoPaginaProps) {
  return (
    <>
      <h1 className="sr-only">{titulo}</h1>
      <div className="flex justify-center py-12 text-teal-dark">
        <Spinner rotulo={rotulo} className="size-8" />
      </div>
    </>
  )
}
