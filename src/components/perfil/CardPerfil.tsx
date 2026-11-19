import { Link } from 'react-router-dom'
import { ROTULO_SOM } from '../../domain/constants'
import { podeAvisarResponsavel } from '../../domain/rules'
import type { Perfil } from '../../domain/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { classesBotao } from '../ui/estilos'

interface CardPerfilProps {
  perfil: Perfil
  ativo: boolean
  hrefEditar: string
  aoSelecionar: (perfil: Perfil) => void
  aoExcluir: (perfil: Perfil) => void
}

export function CardPerfil({
  perfil,
  ativo,
  hrefEditar,
  aoSelecionar,
  aoExcluir,
}: CardPerfilProps) {
  const sons = perfil.sonsGatilho.map((id) =>
    id === 'outro' && perfil.outroSom ? `Outro: ${perfil.outroSom}` : ROTULO_SOM[id],
  )
  const avisaResponsavel = podeAvisarResponsavel(perfil)

  return (
    <Card as="li" tom={ativo ? 'destaque' : 'neutro'} className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-xl font-semibold break-words">{perfil.apelido}</h2>
        {ativo && (
          <span className="rounded-full bg-teal px-3 py-1 text-base font-semibold text-white">
            Em uso
          </span>
        )}
      </div>

      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-muted">Limite de conforto</dt>
          <dd className="font-display text-2xl font-semibold">{perfil.limiteDb} dB</dd>
        </div>
        <div>
          <dt className="text-muted">Sons que incomodam</dt>
          <dd>
            <ul className="mt-1 flex flex-wrap gap-2" aria-label="Sons que incomodam">
              {sons.map((som) => (
                <li key={som} className="rounded-full border border-line bg-paper px-3 py-1">
                  {som}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-muted">Responsável</dt>
          <dd>
            {avisaResponsavel
              ? `${perfil.responsavelNome} pode receber avisos`
              : 'Nenhum responsável para avisos'}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
        {!ativo && (
          <Button tamanho="sm" onClick={() => aoSelecionar(perfil)}>
            Usar este perfil
          </Button>
        )}
        <Link
          to={hrefEditar}
          className={classesBotao('secondary', 'sm')}
          aria-label={`Editar o perfil ${perfil.apelido}`}
        >
          Editar
        </Link>
        <Button
          variante="danger-ghost"
          tamanho="sm"
          onClick={() => aoExcluir(perfil)}
          aria-label={`Excluir o perfil ${perfil.apelido}`}
        >
          Excluir
        </Button>
      </div>
    </Card>
  )
}
