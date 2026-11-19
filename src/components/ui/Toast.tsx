import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type TipoToast, type ToastItem } from '../../context/toastContext'

/** Tempo generoso para ler com calma. */
const DURACAO_MS = 7_000
const MAXIMO_VISIVEIS = 3

const ESTILOS: Record<TipoToast, string> = {
  sucesso: 'border-teal/40 bg-teal-soft',
  info: 'border-line bg-card',
  erro: 'border-coral/40 bg-coral-soft',
}

interface ToastProps {
  item: ToastItem
  aoFechar: (id: number) => void
}

function Toast({ item, aoFechar }: ToastProps) {
  // Pausa enquanto o mouse ou o foco estiver no aviso, para dar tempo de ler.
  const [pausado, setPausado] = useState(false)

  useEffect(() => {
    if (pausado) return
    const id = setTimeout(() => aoFechar(item.id), DURACAO_MS)
    return () => clearTimeout(id)
  }, [item.id, aoFechar, pausado])

  return (
    <li
      // Revisado (a11y): mouse e foco só pausam o tempo do aviso; não disparam ação.
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      className={`flex items-start justify-between gap-3 rounded-2xl border-2 p-4 text-ink shadow-sm ${ESTILOS[item.tipo]}`}
    >
      <p className="pt-2">{item.mensagem}</p>
      <button
        type="button"
        onClick={() => aoFechar(item.id)}
        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-paper2 hover:text-ink"
      >
        <span aria-hidden="true">✕</span>
        <span className="sr-only">Fechar aviso</span>
      </button>
    </li>
  )
}

/** Provider dos avisos. A região é `aria-live="polite"`: anuncia sem interromper. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ToastItem[]>([])
  const proximoId = useRef(1)

  const fechar = useCallback((id: number) => {
    setItens((atual) => atual.filter((t) => t.id !== id))
  }, [])

  const mostrar = useCallback((mensagem: string, tipo: TipoToast = 'info') => {
    const id = proximoId.current++
    setItens((atual) => [...atual, { id, mensagem, tipo }].slice(-MAXIMO_VISIVEIS))
  }, [])

  const api = useMemo(() => ({ mostrar }), [mostrar])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:top-20 lg:right-4 lg:bottom-auto lg:left-auto lg:justify-end"
      >
        <ul className="pointer-events-auto flex w-full max-w-md flex-col gap-2">
          {itens.map((item) => (
            <Toast key={item.id} item={item} aoFechar={fechar} />
          ))}
        </ul>
      </div>
    </ToastContext.Provider>
  )
}
