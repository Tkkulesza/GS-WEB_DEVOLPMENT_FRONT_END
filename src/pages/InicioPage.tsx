import { Link } from 'react-router-dom'
import { AvisoProtecao } from '../components/monitor/AvisoProtecao'
import { BotaoModoCalma } from '../components/monitor/BotaoModoCalma'
import { DecibelGauge } from '../components/monitor/DecibelGauge'
import { FaixaBadge } from '../components/monitor/FaixaBadge'
import { SeletorCenario } from '../components/monitor/SeletorCenario'
import { StatusBadge } from '../components/monitor/StatusBadge'
import { AvisoErro } from '../components/ui/AvisoErro'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { classesBotao } from '../components/ui/estilos'
import { Spinner } from '../components/ui/Spinner'
import { ROTULO_FAIXA, classificarFaixa } from '../domain/rules'
import { useMonitor } from '../hooks/useMonitor'
import { usePerfilAtivo } from '../hooks/usePerfilAtivo'
import { useTituloPagina } from '../hooks/useTituloPagina'

export function InicioPage() {
  useTituloPagina('Início')
  const { perfilAtivo, carregando, erro, recarregar } = usePerfilAtivo()
  const { monitor, protecao, cenario, setCenario } = useMonitor()

  if (carregando) {
    return (
      <div className="flex justify-center py-12 text-teal-dark">
        <Spinner rotulo="Carregando seu perfil" className="size-8" />
      </div>
    )
  }

  if (erro) return <AvisoErro mensagem={erro} aoTentarDeNovo={recarregar} />

  if (!perfilAtivo) {
    return (
      <EmptyState
        icone="ondas"
        titulo="Vamos começar pelo seu perfil"
        descricao="Com ele, o Hearmony sabe até onde o som fica confortável pra você e liga o cancelamento sozinho."
        acao={
          <Link to="/perfis/novo" className={classesBotao('primary', 'lg')}>
            Criar meu perfil
          </Link>
        }
      />
    )
  }

  const limite = perfilAtivo.limiteDb
  const faixa = classificarFaixa(monitor.db, limite)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,24rem)] lg:items-start">
      <section aria-labelledby="titulo-inicio" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="titulo-inicio" className="text-3xl font-semibold break-words">
            Oi, {perfilAtivo.apelido}
          </h1>
          <StatusBadge cancelamentoAtivo={protecao.ativa} />
        </div>

        {protecao.ativa && (
          <AvisoProtecao
            db={monitor.db}
            faixa={faixa}
            motivo={protecao.motivo}
            ligadaHaSeg={protecao.ligadaHaSeg}
            podeAvisar={protecao.podeAvisar}
            avisando={protecao.avisando}
            aoDesativar={protecao.desativar}
            aoAvisar={() => void protecao.pedirAjuda()}
          />
        )}

        <Card espacamento="lg" className="text-center">
          <h2 className="sr-only">Som ao seu redor</h2>
          <DecibelGauge db={monitor.db} limite={limite} faixa={faixa} />
          <div className="mt-4 flex justify-center">
            <FaixaBadge faixa={faixa} tamanho="lg" />
          </div>
          {/* Anuncia só quando a faixa muda, não a cada leitura. */}
          <p className="sr-only" aria-live="polite">
            Ambiente {ROTULO_FAIXA[faixa]}
          </p>
          <p className="mt-4 text-muted">
            Seu limite: <strong className="text-ink">{limite} dB</strong>. O cancelamento liga
            sozinho se passar disso.
          </p>
        </Card>

        {/* Com a proteção ligada, o painel acima já oferece "Desativar". */}
        {!protecao.ativa && (
          <BotaoModoCalma
            cancelamentoAtivo={false}
            aoAtivar={protecao.ativarModoCalma}
            aoDesativar={protecao.desativar}
          />
        )}
      </section>

      <Card as="section" aria-labelledby="titulo-demo" tom="neutro" className="space-y-5">
        <div>
          <h2 id="titulo-demo" className="text-xl font-semibold">
            Modo demonstração
          </h2>
          <p className="mt-1 text-muted">
            O sensor é simulado. Escolha um lugar para ver como o Hearmony reage.
          </p>
        </div>
        <SeletorCenario valor={cenario} aoMudar={setCenario} />
        <div>
          <Button variante="secondary" larguraTotal onClick={monitor.simularPico}>
            Simular pico de barulho
          </Button>
          <p className="mt-2 text-muted">Simula 92 dB por 2 segundos, como uma buzina perto.</p>
        </div>
      </Card>
    </div>
  )
}
