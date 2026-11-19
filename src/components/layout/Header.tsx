import { Link, NavLink } from 'react-router-dom'
import { Icone } from '../ui/Icone'
import { AjustesVisuais } from './AjustesVisuais'
import { NavBar } from './NavBar'

export function Header() {
  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-md items-center justify-between gap-4 px-4 py-3 lg:max-w-5xl">
        <Link
          to="/"
          className="flex min-h-11 items-center gap-2 font-display text-xl font-semibold text-ink"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-teal text-paper">
            <Icone nome="ondas" className="size-6" />
          </span>
          Hearmony
        </Link>

        <NavBar variante="topo" className="hidden lg:block" />

        <div className="flex items-center gap-1">
          <AjustesVisuais />
          <NavLink
            to="/sobre"
            className={({ isActive }) =>
              [
                'flex min-h-11 items-center gap-2 rounded-2xl px-3 font-semibold',
                isActive
                  ? 'bg-teal-soft text-teal-dark'
                  : 'text-muted hover:bg-paper2 hover:text-ink',
              ].join(' ')
            }
          >
            <Icone nome="info" className="size-5" />
            Sobre
          </NavLink>
        </div>
      </div>
    </header>
  )
}
