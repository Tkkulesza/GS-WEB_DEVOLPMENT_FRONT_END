import { NavLink } from 'react-router-dom'
import { Icone, type NomeIcone } from '../ui/Icone'

const ITENS: { para: string; rotulo: string; icone: NomeIcone; fim?: boolean }[] = [
  { para: '/', rotulo: 'Início', icone: 'inicio', fim: true },
  { para: '/historico', rotulo: 'Histórico', icone: 'historico' },
  { para: '/perfis', rotulo: 'Perfis', icone: 'perfis' },
  { para: '/meus-dados', rotulo: 'Meus dados', icone: 'dados' },
]

interface NavBarProps {
  /** "inferior" no celular, "topo" no desktop. */
  variante: 'inferior' | 'topo'
  className?: string
}

export function NavBar({ variante, className = '' }: NavBarProps) {
  const inferior = variante === 'inferior'

  return (
    <nav aria-label="Navegação principal" className={className}>
      <ul className={inferior ? 'grid grid-cols-4' : 'flex items-center gap-1'}>
        {ITENS.map((item) => (
          <li key={item.para}>
            <NavLink
              to={item.para}
              end={item.fim}
              className={({ isActive }) =>
                [
                  'flex min-h-11 items-center rounded-2xl font-semibold transition-colors',
                  inferior
                    ? 'min-h-16 flex-col justify-start gap-1 px-1 pt-2 pb-1 text-base leading-tight'
                    : 'justify-center gap-2 px-4 py-2 text-base',
                  isActive
                    ? 'bg-teal-soft text-teal-dark'
                    : 'text-muted hover:bg-paper2 hover:text-ink',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icone nome={item.icone} className={inferior ? 'size-6' : 'size-5'} />
                  <span className={isActive ? 'underline decoration-2 underline-offset-4' : ''}>
                    {item.rotulo}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
