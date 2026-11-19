import { useEffect } from 'react'

/** Define o título da aba para cada rota (ajuda leitores de tela e quem usa várias abas). */
export function useTituloPagina(titulo: string) {
  useEffect(() => {
    document.title = `${titulo} · Hearmony`
  }, [titulo])
}
