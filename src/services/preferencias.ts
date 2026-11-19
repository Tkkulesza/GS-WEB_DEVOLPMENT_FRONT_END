/**
 * Preferências de conforto visual. Ficam só neste navegador (localStorage):
 * não são dados pessoais e não vão para a API.
 */
import { lerPreferencia, salvarPreferencia } from './armazenamentoLocal'

export type Tema = 'sistema' | 'clara' | 'suave'
export type TamanhoTexto = 'normal' | 'grande' | 'maior'

export interface Preferencias {
  tema: Tema
  texto: TamanhoTexto
}

const TEMAS: Tema[] = ['sistema', 'clara', 'suave']
const TAMANHOS: TamanhoTexto[] = ['normal', 'grande', 'maior']

export function lerPreferencias(): Preferencias {
  const tema = lerPreferencia('tema') as Tema | null
  const texto = lerPreferencia('texto') as TamanhoTexto | null
  return {
    tema: tema && TEMAS.includes(tema) ? tema : 'sistema',
    texto: texto && TAMANHOS.includes(texto) ? texto : 'normal',
  }
}

export function salvarPreferencias(p: Preferencias): void {
  salvarPreferencia('tema', p.tema)
  salvarPreferencia('texto', p.texto)
}

/** Aplica no <html>; o CSS (index.css) troca as cores e o tamanho da fonte. */
export function aplicarPreferencias(p: Preferencias): void {
  const html = document.documentElement
  html.dataset.tema = p.tema
  html.dataset.texto = p.texto
}
