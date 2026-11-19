import type { ReactNode } from 'react'

interface CabecalhoPaginaProps {
  titulo: string
  descricao?: ReactNode
  /** Ação opcional à direita (ex.: botão "Novo perfil"). */
  acao?: ReactNode
}

/** Título (h1) e descrição padrão de cada página. */
export function CabecalhoPagina({ titulo, descricao, acao }: CabecalhoPaginaProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{titulo}</h1>
        {descricao && <p className="mt-2 max-w-prose text-muted">{descricao}</p>}
      </div>
      {acao}
    </div>
  )
}
