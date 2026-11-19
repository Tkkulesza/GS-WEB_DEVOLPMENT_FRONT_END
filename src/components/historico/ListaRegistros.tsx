import type { Registro } from '../../domain/types'
import { ItemRegistro } from './ItemRegistro'

interface ListaRegistrosProps {
  registros: Registro[]
  aoEditarNota: (r: Registro) => void
  aoExcluir: (r: Registro) => void
}

export function ListaRegistros({ registros, aoEditarNota, aoExcluir }: ListaRegistrosProps) {
  return (
    <ul className="space-y-2">
      {registros.map((r) => (
        <ItemRegistro key={r.id} registro={r} aoEditarNota={aoEditarNota} aoExcluir={aoExcluir} />
      ))}
    </ul>
  )
}
