import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { FiltroGatilho, type ValorFiltro } from '../components/historico/FiltroGatilho'
import { formatarDiaHora } from '../components/historico/formatos'
import { GraficoSemana } from '../components/historico/GraficoSemana'
import { ListaRegistros } from '../components/historico/ListaRegistros'
import { ModalNota } from '../components/historico/ModalNota'
import { AvisoErro } from '../components/ui/AvisoErro'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { classesBotao } from '../components/ui/estilos'
import { Spinner } from '../components/ui/Spinner'
import { rotuloOrigem } from '../domain/rotulos'
import type { Registro } from '../domain/types'
import { usePerfilAtivo } from '../hooks/usePerfilAtivo'
import { useRegistros } from '../hooks/useRegistros'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { useToast } from '../hooks/useToast'
import { mensagemDeErro } from '../services/http'

function passaNoFiltro(r: Registro, filtro: ValorFiltro): boolean {
  if (r.categoria === 'auditoria') return false // fica em "Meus dados"
  if (filtro === 'todos') return true
  if (filtro === 'alertas') return r.categoria === 'alerta'
  return r.categoria === 'exposicao' && r.gatilho === filtro
}

export function HistoricoPage() {
  useTituloPagina('Histórico')
  const { perfilAtivo, carregando: carregandoPerfis } = usePerfilAtivo()
  const { registros, stats, carregando, erro, aviso, atualizarNota, remover, recarregar } =
    useRegistros(perfilAtivo?.id ?? null)
  const { mostrar } = useToast()

  const [filtro, setFiltro] = useState<ValorFiltro>('todos')
  const [editando, setEditando] = useState<Registro | null>(null)
  const [paraExcluir, setParaExcluir] = useState<Registro | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const listaRef = useRef<HTMLElement>(null)

  const visiveis = useMemo(
    () => registros.filter((r) => passaNoFiltro(r, filtro)),
    [registros, filtro],
  )
  const temRegistros = registros.some((r) => passaNoFiltro(r, 'todos'))

  async function confirmarExclusao() {
    if (!paraExcluir) return
    setExcluindo(true)
    try {
      await remover(paraExcluir.id)
      setParaExcluir(null)
      mostrar('Registro excluído.', 'sucesso')
      requestAnimationFrame(() => listaRef.current?.focus())
    } catch (e) {
      mostrar(mensagemDeErro(e), 'erro')
    } finally {
      setExcluindo(false)
    }
  }

  if (carregandoPerfis) {
    return (
      <div className="flex justify-center py-12 text-teal-dark">
        <Spinner rotulo="Carregando" className="size-8" />
      </div>
    )
  }

  if (!perfilAtivo) {
    return (
      <>
        <CabecalhoPagina titulo="Histórico" />
        <EmptyState
          icone="historico"
          titulo="Sem perfil, sem histórico"
          descricao="Crie um perfil para o Hearmony começar a registrar quando o cancelamento liga."
          acao={
            <Link to="/perfis/novo" className={classesBotao('primary', 'lg')}>
              Criar meu perfil
            </Link>
          }
        />
      </>
    )
  }

  const maisAlto = stats.momentoMaisAlto

  return (
    <>
      <CabecalhoPagina
        titulo="Histórico"
        descricao={`Quando o cancelamento ligou para ${perfilAtivo.apelido}.`}
        acao={
          <Button variante="ghost" onClick={recarregar} disabled={carregando}>
            Atualizar
          </Button>
        }
      />

      {aviso && <p className="mb-4 rounded-2xl bg-paper2 p-4">{aviso}</p>}

      {carregando ? (
        <div className="flex justify-center py-12 text-teal-dark">
          <Spinner rotulo="Carregando histórico" className="size-8" />
        </div>
      ) : erro ? (
        <AvisoErro mensagem={erro} aoTentarDeNovo={recarregar} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-4">
            <Card espacamento="lg">
              <GraficoSemana dias={stats.porDia} totalMinutos={stats.totalMinutos} />
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <h2 className="text-muted">Momento mais alto</h2>
                {maisAlto ? (
                  <>
                    <p className="mt-1 font-display text-3xl font-semibold">{maisAlto.picoDb} dB</p>
                    <p className="mt-1 text-muted">
                      {[formatarDiaHora(maisAlto.inicio), rotuloOrigem(maisAlto.cenario)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </>
                ) : (
                  <p className="mt-1">Nenhum episódio nesta semana.</p>
                )}
              </Card>
              <Card>
                <h2 className="text-muted">Cancelamento ativado</h2>
                <p className="mt-1 font-display text-3xl font-semibold">
                  {stats.ativacoes} {stats.ativacoes === 1 ? 'vez' : 'vezes'}
                </p>
                <p className="mt-1 text-muted">{stats.ativacoesModoCalma} pelo Modo Calma</p>
              </Card>
            </div>
          </div>

          <section
            ref={listaRef}
            tabIndex={-1}
            aria-labelledby="titulo-registros"
            className="space-y-4 outline-none"
          >
            <h2 id="titulo-registros" className="text-xl font-semibold">
              Registros
            </h2>
            {!temRegistros ? (
              <EmptyState
                icone="historico"
                titulo="Ainda não há registros"
                descricao="Quando o cancelamento ligar e desligar, o episódio aparece aqui."
              />
            ) : (
              <>
                <FiltroGatilho valor={filtro} aoMudar={setFiltro} />
                <p className="text-muted" aria-live="polite">
                  {visiveis.length} {visiveis.length === 1 ? 'registro' : 'registros'}
                </p>
                {visiveis.length > 0 && (
                  <ListaRegistros
                    registros={visiveis}
                    aoEditarNota={setEditando}
                    aoExcluir={setParaExcluir}
                  />
                )}
              </>
            )}
          </section>
        </div>
      )}

      {editando && (
        <ModalNota
          key={editando.id}
          registro={editando}
          salvar={atualizarNota}
          aoFechar={() => setEditando(null)}
        />
      )}

      <ConfirmDialog
        aberto={paraExcluir !== null}
        titulo="Excluir este registro?"
        mensagem="Ele sai do histórico e das contas da semana. Não dá pra desfazer."
        textoConfirmar="Excluir registro"
        perigoso
        carregando={excluindo}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setParaExcluir(null)}
      />
    </>
  )
}
