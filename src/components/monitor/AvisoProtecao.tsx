import { ROTULO_FAIXA } from '../../domain/rules'
import type { Faixa, MotivoProtecao } from '../../domain/types'
import { Button } from '../ui/Button'
import { COR_FAIXA } from './estilosFaixa'
import { GuiaRespiracao } from './GuiaRespiracao'

interface AvisoProtecaoProps {
  db: number
  faixa: Faixa
  motivo: MotivoProtecao | null
  ligadaHaSeg: number
  /** RN05: só mostra "Avisar meu responsável" com responsável e consentimento. */
  podeAvisar: boolean
  avisando: boolean
  aoDesativar: () => void
  aoAvisar: () => void
}

function formatarTempo(seg: number) {
  if (seg < 60) return `${seg} s`
  const min = Math.floor(seg / 60)
  return `${min} min ${String(seg % 60).padStart(2, '0')} s`
}

/**
 * Painel "Proteção ativada". Não rouba o foco: o anúncio é feito
 * por uma região aria-live polite no layout.
 */
export function AvisoProtecao({
  db,
  faixa,
  motivo,
  ligadaHaSeg,
  podeAvisar,
  avisando,
  aoDesativar,
  aoAvisar,
}: AvisoProtecaoProps) {
  const modoCalma = motivo === 'modo_calma'
  const cor = COR_FAIXA[faixa]

  return (
    <section
      aria-labelledby="titulo-protecao"
      className="rounded-3xl border-2 border-teal/40 bg-teal-soft p-6 text-center sm:p-8"
    >
      <p
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${cor.fundo} ${cor.texto}`}
      >
        <span className="tabular-nums">{Math.round(db)} dB</span>
        <span aria-hidden="true">·</span>
        {ROTULO_FAIXA[faixa]}
      </p>

      <h2 id="titulo-protecao" className="mt-4 text-2xl font-semibold text-balance">
        {modoCalma
          ? 'Modo Calma ligado. Ativamos o cancelamento de ruído.'
          : 'Barulho alto por perto. Ativamos o cancelamento de ruído.'}
      </h2>
      <p className="mt-2 text-muted">
        {modoCalma
          ? 'Fica ligado até você desativar.'
          : 'Ele desliga sozinho quando o lugar ficar mais calmo.'}
      </p>

      {/* Círculo de respiração: ciclo lento de 10 s; parado com movimento reduzido. */}
      <div className="my-8 flex flex-col items-center" aria-hidden="true">
        <div className="flex size-44 items-center justify-center rounded-full bg-teal/15">
          <div className="size-32 animate-respirar rounded-full bg-teal/35" />
        </div>
      </div>
      <p className="so-com-movimento -mt-4 mb-6 text-muted">
        Se quiser, respire junto com o círculo.
      </p>
      <GuiaRespiracao />

      <p className="font-semibold text-teal-dark">
        Ligado há <span className="tabular-nums">{formatarTempo(ligadaHaSeg)}</span>
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Button tamanho="lg" larguraTotal onClick={aoDesativar}>
          Desativar
        </Button>
        {podeAvisar && (
          <Button
            variante="secondary"
            tamanho="lg"
            larguraTotal
            onClick={aoAvisar}
            carregando={avisando}
          >
            Avisar meu responsável
          </Button>
        )}
      </div>
    </section>
  )
}
