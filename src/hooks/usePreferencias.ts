import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  aplicarPreferencias,
  lerPreferencias,
  salvarPreferencias,
  type Preferencias,
} from '../services/preferencias'

const CONSULTA_MOVIMENTO = '(prefers-reduced-motion: reduce)'

function assinarMovimento(aviso: () => void) {
  const mq = window.matchMedia(CONSULTA_MOVIMENTO)
  mq.addEventListener('change', aviso)
  return () => mq.removeEventListener('change', aviso)
}

/** Tema, tamanho do texto e movimento: aplica na hora e guarda neste navegador. */
export function usePreferencias() {
  const [preferencias, setPreferencias] = useState<Preferencias>(lerPreferencias)
  // O aparelho está pedindo menos movimento? (ex.: "Efeitos de animação" desligado no Windows)
  const aparelhoPedeMenosMovimento = useSyncExternalStore(
    assinarMovimento,
    () => window.matchMedia(CONSULTA_MOVIMENTO).matches,
    () => false,
  )

  useEffect(() => {
    aplicarPreferencias(preferencias)
    salvarPreferencias(preferencias)
  }, [preferencias])

  return {
    preferencias,
    aparelhoPedeMenosMovimento,
    mudarTema: (tema: Preferencias['tema']) => setPreferencias((p) => ({ ...p, tema })),
    mudarTexto: (texto: Preferencias['texto']) => setPreferencias((p) => ({ ...p, texto })),
    mudarMovimento: (movimento: Preferencias['movimento']) =>
      setPreferencias((p) => ({ ...p, movimento })),
  }
}
