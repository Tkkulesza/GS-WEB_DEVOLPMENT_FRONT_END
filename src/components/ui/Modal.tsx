import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'

interface ModalProps {
  aberto: boolean
  titulo: string
  descricao?: ReactNode
  aoFechar: () => void
  children?: ReactNode
  /** Botões no rodapé. */
  rodape?: ReactNode
  /** Bloqueia o fechamento (ex.: enquanto salva). */
  bloqueado?: boolean
}

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Janela modal acessível sobre <dialog>:
 * - showModal() deixa o resto da página inerte
 * - Tab e Shift+Tab ficam presos dentro do modal
 * - Esc fecha; o foco volta para quem abriu
 */
export function Modal({
  aberto,
  titulo,
  descricao,
  aoFechar,
  children,
  rodape,
  bloqueado = false,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const quemAbriu = useRef<HTMLElement | null>(null)
  const idTitulo = useId()
  const idDescricao = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return

    if (aberto && !dialogo.open) {
      quemAbriu.current = document.activeElement as HTMLElement | null
      dialogo.showModal()
      // Foca o elemento marcado com data-autofocus, ou o primeiro focável.
      const alvo =
        dialogo.querySelector<HTMLElement>('[data-autofocus]') ??
        dialogo.querySelector<HTMLElement>(FOCAVEIS)
      alvo?.focus()
    }

    if (!aberto && dialogo.open) {
      dialogo.close()
      quemAbriu.current?.focus()
      quemAbriu.current = null
    }
  }, [aberto])

  // Se o componente sumir com o modal aberto, devolve o foco mesmo assim.
  useEffect(() => {
    const origem = quemAbriu
    return () => origem.current?.focus()
  }, [])

  function prenderFoco(evento: KeyboardEvent<HTMLDialogElement>) {
    if (evento.key !== 'Tab' || !ref.current) return
    const focaveis = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCAVEIS))
    if (focaveis.length === 0) return
    const primeiro = focaveis[0]
    const ultimo = focaveis[focaveis.length - 1]
    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault()
      ultimo.focus()
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault()
      primeiro.focus()
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      aria-describedby={descricao ? idDescricao : undefined}
      onCancel={(e) => {
        e.preventDefault() // o estado de "aberto" é controlado pelo React
        if (!bloqueado) aoFechar()
      }}
      // Revisado (a11y): o <dialog> escuta o teclado só para prender o Tab, e o clique
      // só para fechar pelo fundo; Esc é a alternativa de teclado para fechar.
      onKeyDown={prenderFoco}
      onClick={(e) => {
        // Clique no fundo escurecido (fora do conteúdo) fecha.
        if (e.target === ref.current && !bloqueado) aoFechar()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-line bg-card p-0 text-ink backdrop:bg-ink/50"
    >
      <div className="p-6">
        <h2 id={idTitulo} className="text-xl font-semibold">
          {titulo}
        </h2>
        {descricao && (
          <div id={idDescricao} className="mt-2 text-muted">
            {descricao}
          </div>
        )}
        {children && <div className="mt-4">{children}</div>}
        {rodape && (
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {rodape}
          </div>
        )}
      </div>
    </dialog>
  )
}
