import { Outlet } from 'react-router-dom'
import { AnuncioProtecao } from './AnuncioProtecao'
import { Header } from './Header'
import { NavBar } from './NavBar'

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-2xl bg-teal px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>

      <Header />
      <AnuncioProtecao />

      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto w-full max-w-md flex-1 px-4 pt-6 pb-28 outline-none lg:max-w-5xl lg:pb-12"
      >
        <Outlet />
      </main>

      <NavBar
        variante="inferior"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:hidden"
      />
    </div>
  )
}
