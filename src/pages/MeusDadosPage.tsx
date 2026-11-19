import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { formatarDataCompleta } from '../components/historico/formatos'
import { AvisoErro } from '../components/ui/AvisoErro'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { classesBotao } from '../components/ui/estilos'
import { Spinner } from '../components/ui/Spinner'
import { ROTULO_ACAO } from '../domain/rotulos'
import { useMeusDados } from '../hooks/useMeusDados'
import { usePerfilAtivo } from '../hooks/usePerfilAtivo'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { useToast } from '../hooks/useToast'
import { mensagemDeErro } from '../services/http'

const O_QUE_GUARDAMOS = [
  {
    dado: 'Apelido',
    porque: 'Para te chamar pelo nome que você escolheu. Nunca pedimos nome completo.',
  },
  {
    dado: 'Sons que incomodam e limite de conforto',
    porque: 'Para saber quando ligar o cancelamento. É um dado sensível e fica só no seu perfil.',
  },
  {
    dado: 'Responsável (opcional)',
    porque: 'Só para avisos que você pedir ou permitir, e apenas com o consentimento dele.',
  },
  {
    dado: 'Episódios e avisos',
    porque: 'Quando o cancelamento ligou, por quanto tempo e o pico. Nunca gravamos áudio.',
  },
]

export function MeusDadosPage() {
  useTituloPagina('Meus dados')
  const { perfilAtivo, carregando } = usePerfilAtivo()
  const dados = useMeusDados(perfilAtivo)
  const { mostrar } = useToast()
  const navegar = useNavigate()
  const [confirmando, setConfirmando] = useState(false)

  async function exportar() {
    try {
      await dados.exportar()
      mostrar('Pronto. O arquivo com seus dados foi baixado.', 'sucesso')
    } catch (e) {
      mostrar(mensagemDeErro(e), 'erro')
    }
  }

  async function excluirTudo() {
    if (!perfilAtivo) return
    const { apelido } = perfilAtivo
    try {
      await dados.excluirTudo()
      setConfirmando(false)
      mostrar(`Tudo do perfil ${apelido} foi apagado.`, 'sucesso')
      navegar('/')
    } catch (e) {
      mostrar(mensagemDeErro(e), 'erro')
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-12 text-teal-dark">
        <Spinner rotulo="Carregando" className="size-8" />
      </div>
    )
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Meus dados"
        descricao="O que o Hearmony guarda, por quê, e o que você pode fazer com isso."
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card as="section" aria-labelledby="titulo-guardamos">
          <h2 id="titulo-guardamos" className="text-xl font-semibold">
            O que fica salvo
          </h2>
          <dl className="mt-4 space-y-4">
            {O_QUE_GUARDAMOS.map((item) => (
              <div key={item.dado}>
                <dt className="font-semibold">{item.dado}</dt>
                <dd className="text-muted">{item.porque}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 rounded-2xl bg-paper2 p-4">
            Protótipo acadêmico: os dados ficam numa API de teste pública. Use só dados fictícios.
          </p>
        </Card>

        {!perfilAtivo ? (
          <EmptyState
            icone="dados"
            titulo="Nenhum perfil salvo"
            descricao="Sem perfil, o Hearmony não guarda nada sobre você."
            acao={
              <Link to="/perfis/novo" className={classesBotao('primary', 'md')}>
                Criar meu perfil
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            <Card as="section" aria-labelledby="titulo-exportar">
              <h2 id="titulo-exportar" className="text-xl font-semibold">
                Exportar meus dados
              </h2>
              <p className="mt-2 text-muted">
                Baixe um arquivo com o perfil {perfilAtivo.apelido} e todo o histórico dele. O
                arquivo é gerado aqui no seu navegador.
              </p>
              <Button
                className="mt-4"
                variante="secondary"
                onClick={() => void exportar()}
                carregando={dados.exportando}
              >
                Exportar meus dados
              </Button>
            </Card>

            <Card as="section" aria-labelledby="titulo-atividade">
              <h2 id="titulo-atividade" className="text-xl font-semibold">
                Atividade da conta
              </h2>
              <p className="mt-2 text-muted">Quando o perfil foi criado, editado ou exportado.</p>
              <div className="mt-4">
                {dados.carregandoAtividade ? (
                  <Spinner rotulo="Carregando atividade" />
                ) : dados.erroAtividade ? (
                  <AvisoErro
                    mensagem={dados.erroAtividade}
                    aoTentarDeNovo={dados.recarregarAtividade}
                  />
                ) : dados.atividade.length === 0 ? (
                  <p>Nenhuma atividade registrada ainda.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {dados.atividade.map((r) => (
                      <li key={r.id} className="flex flex-wrap justify-between gap-x-4 py-3">
                        <span className="font-semibold">
                          {r.acao ? ROTULO_ACAO[r.acao] : 'Atividade'}
                        </span>
                        <span className="text-muted">{formatarDataCompleta(r.inicio)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            <Card as="section" aria-labelledby="titulo-excluir" tom="alerta">
              <h2 id="titulo-excluir" className="text-xl font-semibold">
                Excluir tudo
              </h2>
              <p className="mt-2">
                Apaga o perfil {perfilAtivo.apelido}, o histórico e a atividade da conta. Não dá pra
                desfazer.
              </p>
              <Button className="mt-4" variante="danger" onClick={() => setConfirmando(true)}>
                Excluir tudo
              </Button>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        aberto={confirmando}
        titulo="Excluir tudo?"
        mensagem={`O perfil ${perfilAtivo?.apelido ?? ''}, o histórico e a atividade da conta serão apagados. Não dá pra desfazer.`}
        textoConfirmar="Excluir tudo"
        perigoso
        carregando={dados.excluindo}
        aoConfirmar={() => void excluirTudo()}
        aoCancelar={() => setConfirmando(false)}
      />
    </>
  )
}
