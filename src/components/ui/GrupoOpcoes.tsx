import { useId } from 'react'

interface Opcao<T extends string> {
  valor: T
  rotulo: string
  descricao?: string
}

interface GrupoOpcoesProps<T extends string> {
  legenda: string
  opcoes: Opcao<T>[]
  valor: T
  aoMudar: (v: T) => void
  /** "linha" põe as opções lado a lado (para rótulos curtos). */
  disposicao?: 'coluna' | 'linha'
}

/** Grupo de radios em cartões (teclado: setas; selecionado indicado também com ✓). */
export function GrupoOpcoes<T extends string>({
  legenda,
  opcoes,
  valor,
  aoMudar,
  disposicao = 'coluna',
}: GrupoOpcoesProps<T>) {
  const nome = useId()
  return (
    <fieldset>
      <legend className="font-semibold">{legenda}</legend>
      <div className={`mt-2 grid gap-2 ${disposicao === 'linha' ? 'grid-cols-3' : ''}`}>
        {opcoes.map((o) => {
          const marcado = o.valor === valor
          return (
            <label
              key={o.valor}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 py-2 ${disposicao === 'linha' ? 'flex-col justify-center px-2 text-center' : 'px-4'} has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-teal-dark ${
                marcado
                  ? 'border-teal bg-teal-soft'
                  : 'border-line-strong bg-card hover:border-teal'
              }`}
            >
              <input
                type="radio"
                name={nome}
                checked={marcado}
                onChange={() => aoMudar(o.valor)}
                className="size-5 shrink-0 accent-teal"
              />
              <span>
                <span className="block font-semibold">{o.rotulo}</span>
                {o.descricao && <span className="block text-muted">{o.descricao}</span>}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
