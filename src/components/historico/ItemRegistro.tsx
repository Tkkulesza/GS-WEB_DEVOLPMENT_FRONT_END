import { formatarDuracao } from '../../domain/stats'
import { ROTULO_GATILHO, rotuloOrigem } from '../../domain/rotulos'
import type { Registro } from '../../domain/types'
import { Button } from '../ui/Button'
import { formatarDiaHora } from './formatos'

interface ItemRegistroProps {
  registro: Registro
  aoEditarNota: (r: Registro) => void
  aoExcluir: (r: Registro) => void
}

export function ItemRegistro({ registro, aoEditarNota, aoExcluir }: ItemRegistroProps) {
  const ehAlerta = registro.categoria === 'alerta'
  const titulo = ehAlerta ? 'Aviso ao responsável' : 'Cancelamento ativado'
  const origem = rotuloOrigem(registro.cenario)

  const detalhes = [
    registro.gatilho ? ROTULO_GATILHO[registro.gatilho] : null,
    registro.duracaoSeg !== null && !ehAlerta ? formatarDuracao(registro.duracaoSeg) : null,
    registro.picoDb !== null ? `pico de ${registro.picoDb} dB` : null,
    origem,
  ].filter(Boolean)

  return (
    <li className="rounded-3xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-lg font-semibold">{titulo}</h3>
        <p className="text-muted">{formatarDiaHora(registro.inicio)}</p>
      </div>
      <p className="mt-1">{detalhes.join(' · ')}</p>

      {!ehAlerta && (
        <p className={`mt-3 rounded-2xl p-3 ${registro.nota ? 'bg-paper' : 'text-muted'}`}>
          {registro.nota ? (
            <>
              <span className="sr-only">Sua nota: </span>“{registro.nota}”
            </>
          ) : (
            'Sem nota.'
          )}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!ehAlerta && (
          <Button variante="secondary" tamanho="sm" onClick={() => aoEditarNota(registro)}>
            {registro.nota ? 'Editar nota' : 'Escrever como me senti'}
          </Button>
        )}
        <Button
          variante="danger-ghost"
          tamanho="sm"
          onClick={() => aoExcluir(registro)}
          aria-label={`Excluir registro de ${formatarDiaHora(registro.inicio)}`}
        >
          Excluir
        </Button>
      </div>
    </li>
  )
}
