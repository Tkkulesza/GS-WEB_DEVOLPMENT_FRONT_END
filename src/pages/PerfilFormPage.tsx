import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { CarregandoPagina } from '../components/layout/CarregandoPagina'
import { FormPerfil } from '../components/perfil/FormPerfil'
import { AvisoErro } from '../components/ui/AvisoErro'
import { EmptyState } from '../components/ui/EmptyState'
import { classesBotao } from '../components/ui/estilos'
import type { Perfil } from '../domain/types'
import { TOTAL_ETAPAS, useFormularioPerfil } from '../hooks/useFormularioPerfil'
import { usePerfilAtivo } from '../hooks/usePerfilAtivo'
import { useTituloPagina } from '../hooks/useTituloPagina'
import { useToast } from '../hooks/useToast'
import { mensagemDeErro } from '../services/http'

/** Liga o hook do formulário às ações de salvar. */
function EditorPerfil({ perfil }: { perfil: Perfil | null }) {
  const modo = perfil ? 'editar' : 'criar'
  const form = useFormularioPerfil(perfil)
  const { criar, atualizar, selecionarPerfil } = usePerfilAtivo()
  const { mostrar } = useToast()
  const navegar = useNavigate()
  const [salvando, setSalvando] = useState(false)

  async function concluir(): Promise<boolean> {
    const dados = form.concluir()
    if (!dados) return false
    setSalvando(true)
    try {
      if (perfil) {
        await atualizar(perfil.id, dados)
        mostrar('Pronto. As alterações do perfil foram salvas.', 'sucesso')
        navegar('/perfis')
      } else {
        const novo = await criar(dados)
        selecionarPerfil(novo.id)
        mostrar(
          `Perfil salvo. O cancelamento vai ligar quando o som passar de ${novo.limiteDb} dB.`,
          'sucesso',
        )
        navegar('/')
      }
      return true
    } catch (e) {
      mostrar(mensagemDeErro(e), 'erro')
      setSalvando(false)
      return true // o erro não é de um campo; o foco fica onde está
    }
  }

  return (
    <FormPerfil
      modo={modo}
      etapa={form.etapa}
      totalEtapas={TOTAL_ETAPAS}
      valores={form.valores}
      erros={form.erros}
      salvando={salvando}
      hrefCancelar="/perfis"
      aoAlterar={form.alterar}
      aoSairDoCampo={form.validarCampo}
      aoAvancar={form.avancar}
      aoVoltar={form.voltar}
      aoConcluir={concluir}
    />
  )
}

export function PerfilFormPage() {
  const { id } = useParams()
  const editando = id !== undefined
  const titulo = editando ? 'Editar perfil' : 'Criar perfil'
  useTituloPagina(titulo)
  const { perfis, carregando, erro, recarregar } = usePerfilAtivo()

  if (!editando) {
    return (
      <>
        <CabecalhoPagina titulo={titulo} />
        <EditorPerfil perfil={null} />
      </>
    )
  }

  if (carregando) {
    return <CarregandoPagina titulo={titulo} rotulo="Carregando perfil" />
  }

  if (erro) {
    return (
      <>
        <CabecalhoPagina titulo={titulo} />
        <AvisoErro mensagem={erro} aoTentarDeNovo={recarregar} />
      </>
    )
  }

  const perfil = perfis.find((p) => p.id === id)
  if (!perfil) {
    return (
      <>
        <h1 className="sr-only">{titulo}</h1>
        <EmptyState
          icone="perfis"
          titulo="Não encontramos esse perfil"
          descricao="Ele pode ter sido excluído."
          acao={
            <Link to="/perfis" className={classesBotao('primary', 'md')}>
              Ver perfis
            </Link>
          }
        />
      </>
    )
  }

  return (
    <>
      <CabecalhoPagina titulo={`${titulo}: ${perfil.apelido}`} />
      {/* key: se trocar de perfil pela URL, o formulário recomeça com os dados certos */}
      <EditorPerfil key={perfil.id} perfil={perfil} />
    </>
  )
}
