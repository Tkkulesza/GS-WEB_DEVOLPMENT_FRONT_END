import { formatarDuracao } from '../../domain/stats'
import { rotuloOrigem } from '../../domain/rotulos'
import type { Gatilho, Registro } from '../../domain/types'
import { Button } from '../ui/Button'
import { Icone, type NomeIcone } from '../ui/Icone'
import { formatarDiaHora } from './formatos'

interface ItemRegistroProps {
  registro: Registro
  aoEditarNota: (r: Registro) => void
  aoExcluir: (r: Registro) => void
}

/** Título, ícone e cor por tipo. A cor nunca é a única informação: há título e ícone. */
const VISUAL: Record<Gatilho, { titulo: string; icone: NomeIcone; cor: string }> = {
  automatico: { titulo: 'Ligou sozinho', icone: 'ondas', cor: 'bg-teal-soft text-teal-dark' },
  pico: { titulo: 'Pico de barulho', icone: 'raio', cor: 'bg-coral-soft text-coral' },
  modo_calma: { titulo: 'Modo Calma', icone: 'coracao', cor: 'bg-teal-soft text-teal-dark' },
  ajuda: { titulo: 'Você pediu ajuda', icone: 'sino', cor: 'bg-amber-soft text-amber' },
  persistente: {
    titulo: 'Barulho alto por muito tempo',
    icone: 'sino',
    cor: 'bg-amber-soft text-amber',
  },
}

export function ItemRegistro({ registro, aoEditarNota, aoExcluir }: ItemRegistroProps) {
  const ehAlerta = registro.categoria === 'alerta'
  const visual = VISUAL[registro.gatilho ?? 'automatico']
  const quando = formatarDiaHora(registro.inicio)

  const detalhes = [
    registro.duracaoSeg !== null && !ehAlerta ? formatarDuracao(registro.duracaoSeg) : null,
    registro.picoDb !== null ? `pico de ${registro.picoDb} dB` : null,
    rotuloOrigem(registro.cenario),
  ].filter(Boolean)

  return (
    <li className="flex gap-3 rounded-2xl border border-line bg-card p-4">
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${visual.cor}`}
        aria-hidden="true"
      >
        <Icone nome={visual.icone} className="size-6" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <h3 className="font-semibold">
            <span className="sr-only">
              {ehAlerta ? 'Aviso ao responsável: ' : 'Cancelamento ativado: '}
            </span>
            {visual.titulo}
          </h3>
          <p className="text-muted">{quando}</p>
        </div>
        {detalhes.length > 0 && <p className="text-muted">{detalhes.join(' · ')}</p>}
        {registro.nota && (
          <p className="mt-2 border-l-4 border-teal/40 pl-3">
            <span className="sr-only">Sua nota: </span>“{registro.nota}”
          </p>
        )}

        <div className="mt-2 -ml-3 flex flex-wrap">
          {!ehAlerta && (
            <Button variante="ghost" tamanho="sm" onClick={() => aoEditarNota(registro)}>
              {registro.nota ? 'Editar nota' : 'Escrever como me senti'}
            </Button>
          )}
          <Button
            variante="danger-ghost"
            tamanho="sm"
            onClick={() => aoExcluir(registro)}
            aria-label={`Excluir registro de ${quando}`}
          >
            Excluir
          </Button>
        </div>
      </div>
    </li>
  )
}
