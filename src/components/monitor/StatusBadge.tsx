interface StatusBadgeProps {
  cancelamentoAtivo: boolean
}

/** Estado do sensor e do fone (ambos simulados neste protótipo). */
export function StatusBadge({ cancelamentoAtivo }: StatusBadgeProps) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-base font-semibold text-ink">
      <span
        className={`size-2.5 rounded-full ${cancelamentoAtivo ? 'bg-coral' : 'bg-teal'}`}
        aria-hidden="true"
      />
      {cancelamentoAtivo ? 'Cancelamento ligado' : 'Sensor e fone ok'}
      <span className="font-normal text-muted">(simulados)</span>
    </p>
  )
}
