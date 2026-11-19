import type { ReactNode } from 'react'
import { Icone, type NomeIcone } from './Icone'

interface EmptyStateProps {
  titulo: string
  descricao?: ReactNode
  icone?: NomeIcone
  /** Uma única ação principal (ex.: botão "Criar meu perfil"). */
  acao?: ReactNode
}

export function EmptyState({ titulo, descricao, icone = 'ondas', acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-card px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-teal-soft text-teal-dark">
        <Icone nome={icone} className="size-8" />
      </span>
      <h2 className="mt-4 text-xl font-semibold">{titulo}</h2>
      {descricao && <p className="mt-2 max-w-sm text-muted">{descricao}</p>}
      {acao && <div className="mt-6">{acao}</div>}
    </div>
  )
}
