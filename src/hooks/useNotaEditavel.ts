import { useCallback, useEffect, useRef, useState } from 'react'
import { DEBOUNCE_NOTA_MS, NOTA_MAX } from '../domain/constants'
import type { Registro } from '../domain/types'
import { mensagemDeErro } from '../services/http'

export type StatusNota = 'ocioso' | 'pendente' | 'salvando' | 'salvo' | 'erro'

/**
 * Edição da nota "como me senti" com salvamento automático.
 * Debounce de 600 ms: só salva quando a pessoa para de digitar (limita as escritas na API).
 */
export function useNotaEditavel(
  registro: Registro | null,
  salvar: (id: string, nota: string) => Promise<unknown>,
) {
  const [texto, setTexto] = useState(registro?.nota ?? '')
  const [status, setStatus] = useState<StatusNota>('ocioso')
  const [erro, setErro] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ultimoSalvo = useRef(registro?.nota ?? '')

  const executar = useCallback(
    async (valor: string) => {
      if (!registro || valor.trim() === ultimoSalvo.current.trim()) {
        setStatus((s) => (s === 'pendente' ? 'ocioso' : s))
        return
      }
      setStatus('salvando')
      try {
        await salvar(registro.id, valor)
        ultimoSalvo.current = valor
        setStatus('salvo')
        setErro(null)
      } catch (e) {
        setStatus('erro')
        setErro(mensagemDeErro(e))
      }
    },
    [registro, salvar],
  )

  const alterar = useCallback(
    (valor: string) => {
      const cortado = valor.slice(0, NOTA_MAX)
      setTexto(cortado)
      setStatus('pendente')
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => void executar(cortado), DEBOUNCE_NOTA_MS)
    },
    [executar],
  )

  /** Salva na hora o que estiver pendente (ao fechar o modal). */
  const finalizar = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
      await executar(texto)
    }
  }, [executar, texto])

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  return { texto, status, erro, alterar, finalizar, restantes: NOTA_MAX - texto.length }
}
