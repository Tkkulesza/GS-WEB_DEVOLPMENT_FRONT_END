import { useEffect, useState } from 'react'
import { pareceMicrofoneDeFone } from '../domain/audio'

export interface Microfone {
  id: string
  nome: string
  /** O nome sugere microfone de fone (perto do ouvido: estimativa mais precisa). */
  ehFone: boolean
}

/**
 * Lista os microfones do aparelho. Os nomes só aparecem depois da permissão,
 * por isso a lista é recarregada quando `chave` muda (ex.: o microfone começou a ser usado)
 * e quando um aparelho é conectado ou desconectado (fone Bluetooth, por exemplo).
 */
export function useMicrofones(ativo: boolean, chave: string | null): Microfone[] {
  const [lista, setLista] = useState<Microfone[]>([])

  useEffect(() => {
    const dispositivos = navigator.mediaDevices
    if (!ativo || !dispositivos?.enumerateDevices) return
    let vivo = true

    async function atualizar() {
      const todos = await dispositivos.enumerateDevices()
      if (!vivo) return
      setLista(
        todos
          // "communications" é um apelido do Windows para outro microfone da lista.
          .filter((d) => d.kind === 'audioinput' && d.deviceId !== 'communications')
          .map((d, i) => {
            const nome = d.label || `Microfone ${i + 1}`
            return {
              id: d.deviceId,
              nome:
                d.deviceId === 'default'
                  ? `Padrão do aparelho (${nome.replace(/^Padrão - |^Default - /, '')})`
                  : nome,
              ehFone: pareceMicrofoneDeFone(d.label),
            }
          }),
      )
    }

    void atualizar()
    dispositivos.addEventListener('devicechange', atualizar)
    return () => {
      vivo = false
      dispositivos.removeEventListener('devicechange', atualizar)
    }
  }, [ativo, chave])

  return ativo ? lista : []
}
