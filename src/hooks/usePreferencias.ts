import { useEffect, useState } from 'react'
import {
  aplicarPreferencias,
  lerPreferencias,
  salvarPreferencias,
  type Preferencias,
} from '../services/preferencias'

/** Tema e tamanho do texto: aplica na hora e guarda neste navegador. */
export function usePreferencias() {
  const [preferencias, setPreferencias] = useState<Preferencias>(lerPreferencias)

  useEffect(() => {
    aplicarPreferencias(preferencias)
    salvarPreferencias(preferencias)
  }, [preferencias])

  return {
    preferencias,
    mudarTema: (tema: Preferencias['tema']) => setPreferencias((p) => ({ ...p, tema })),
    mudarTexto: (texto: Preferencias['texto']) => setPreferencias((p) => ({ ...p, texto })),
  }
}
