/** Ícones de traço simples. São decorativos: o texto ao lado sempre explica a ação. */
const CAMINHOS = {
  inicio: 'M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z',
  historico: 'M5 19V11M10 19V6M15 19v-9M20 19v-5',
  perfis: 'M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5',
  dados: 'M12 3.5 5 6.5v5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9v-5zM9 12l2 2 4-4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  ondas: 'M6 10v4M10 7v10M14 9v6M18 11v2',
} as const

export type NomeIcone = keyof typeof CAMINHOS

interface IconeProps {
  nome: NomeIcone
  className?: string
}

export function Icone({ nome, className = 'size-6' }: IconeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={CAMINHOS[nome]} />
    </svg>
  )
}
