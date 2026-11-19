import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { CardPerfil } from '../components/perfil/CardPerfil'
import { AvisoErro } from '../components/ui/AvisoErro'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { classesBotao } from '../components/ui/estilos'
import { Spinner } from '../components/ui/Spinner'
import type { Perfil } from '../domain/types'
import { usePerfilAtivo } from '../hooks/usePerfilAtivo'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { useToast } from '../hooks/useToast'
import { mensagemDeErro } from '../services/http'

export function PerfisPage() {
  useTituloPagina('Perfis')
  const { perfis, perfilAtivo, carregando, erro, aviso, recarregar, selecionarPerfil, remover } =
    usePerfilAtivo()
  const { mostrar } = useToast()
  const [paraExcluir, setParaExcluir] = useState<Perfil | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const listaRef = useRef<HTMLElement>(null)

  function selecionar(perfil: Perfil) {
    selecionarPerfil(perfil.id)
    mostrar(`Agora o perfil ${perfil.apelido} está em uso.`, 'sucesso')
  }

  async function confirmarExclusao() {
    if (!paraExcluir) return
    const { apelido } = paraExcluir
    setExcluindo(true)
    try {
      await remover(paraExcluir.id)
      setParaExcluir(null)
      mostrar(`O perfil ${apelido} e o histórico dele foram excluídos.`, 'sucesso')
      // O botão que abriu a confirmação sumiu: leva o foco para a lista.
      requestAnimationFrame(() => listaRef.current?.focus())
    } catch (e) {
      mostrar(mensagemDeErro(e), 'erro')
    } finally {
      setExcluindo(false)
    }
  }

  const botaoNovo = (
    <Link to="/perfis/novo" className={classesBotao('primary', 'md')}>
      Novo perfil
    </Link>
  )

  return (
    <>
      <CabecalhoPagina
        titulo="Perfis"
        descricao="Cada perfil guarda um limite de conforto e os sons que mais incomodam."
        acao={perfis.length > 0 ? botaoNovo : undefined}
      />

      {aviso && <p className="mb-4 rounded-2xl bg-paper2 p-4">{aviso}</p>}

      {carregando ? (
        <div className="flex justify-center py-12 text-teal-dark">
          <Spinner rotulo="Carregando perfis" className="size-8" />
        </div>
      ) : erro ? (
        <AvisoErro mensagem={erro} aoTentarDeNovo={recarregar} />
      ) : perfis.length === 0 ? (
        <EmptyState
          icone="perfis"
          titulo="Ainda não há nenhum perfil"
          descricao="Crie um perfil para o Hearmony saber até onde o som fica confortável pra você."
          acao={
            <Link to="/perfis/novo" className={classesBotao('primary', 'lg')}>
              Criar meu perfil
            </Link>
          }
        />
      ) : (
        <section ref={listaRef} tabIndex={-1} aria-label="Seus perfis" className="outline-none">
          <ul className="grid gap-4 lg:grid-cols-2">
            {perfis.map((perfil) => (
              <CardPerfil
                key={perfil.id}
                perfil={perfil}
                ativo={perfil.id === perfilAtivo?.id}
                hrefEditar={`/perfis/${perfil.id}/editar`}
                aoSelecionar={selecionar}
                aoExcluir={setParaExcluir}
              />
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        aberto={paraExcluir !== null}
        titulo={paraExcluir ? `Excluir o perfil ${paraExcluir.apelido}?` : 'Excluir perfil?'}
        mensagem="Excluir o perfil e todo o histórico dele? Não dá pra desfazer."
        textoConfirmar="Excluir perfil e histórico"
        perigoso
        carregando={excluindo}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setParaExcluir(null)}
      />
    </>
  )
}
