import { useParams } from 'react-router-dom'
import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { useTituloPagina } from '../hooks/useTituloPagina'

export function PerfilFormPage() {
  const { id } = useParams()
  const titulo = id ? 'Editar perfil' : 'Criar perfil'
  useTituloPagina(titulo)
  return <CabecalhoPagina titulo={titulo} descricao="O cadastro em etapas entra aqui." />
}
