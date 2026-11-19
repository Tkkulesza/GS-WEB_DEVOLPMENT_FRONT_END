/** Formatação de datas em pt-BR, no fuso do navegador. */
const DIA = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
const HORA = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const COMPLETO = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' })

export function formatarDiaHora(iso: string): string {
  const d = new Date(iso)
  return `${DIA.format(d).replace(/\./g, '')} · ${HORA.format(d)}`
}

export function formatarDataCompleta(iso: string): string {
  return COMPLETO.format(new Date(iso))
}
