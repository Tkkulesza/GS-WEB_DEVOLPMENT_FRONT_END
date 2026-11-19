import { useEffect, useRef, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * A cada troca de rota, leva o foco para o título (h1) da nova página
 * (ou para o <main>, se ainda não houver título). Assim o leitor de tela
 * anuncia a página nova e o teclado recomeça do topo do conteúdo.
 *
 * Compara com a rota anterior em vez de usar uma flag de "primeira vez":
 * no StrictMode o efeito roda duas vezes e a flag moveria o foco ao abrir a página.
 */
export function useFocoAoNavegar(principal: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation()
  const rotaAnterior = useRef(pathname)

  useEffect(() => {
    if (rotaAnterior.current === pathname) return
    rotaAnterior.current = pathname
    const main = principal.current
    if (!main) return
    const titulo = main.querySelector<HTMLElement>('h1')
    const alvo = titulo ?? main
    if (titulo && !titulo.hasAttribute('tabindex')) titulo.setAttribute('tabindex', '-1')
    window.scrollTo({ top: 0 })
    alvo.focus({ preventScroll: true })
  }, [pathname, principal])
}
