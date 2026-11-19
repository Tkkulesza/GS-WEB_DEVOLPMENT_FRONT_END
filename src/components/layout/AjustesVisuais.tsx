import { useState } from 'react'
import { usePreferencias } from '../../hooks/usePreferencias'
import type { TamanhoTexto, Tema } from '../../services/preferencias'
import { Button } from '../ui/Button'
import { GrupoOpcoes } from '../ui/GrupoOpcoes'
import { Icone } from '../ui/Icone'
import { Modal } from '../ui/Modal'

const TEMAS: { valor: Tema; rotulo: string; descricao: string }[] = [
  {
    valor: 'sistema',
    rotulo: 'Igual ao aparelho',
    descricao: 'Segue o modo claro ou escuro do sistema.',
  },
  { valor: 'clara', rotulo: 'Clara', descricao: 'Fundo claro, como papel.' },
  { valor: 'suave', rotulo: 'Suave', descricao: 'Fundo escuro, com menos brilho na tela.' },
]

const TAMANHOS: { valor: TamanhoTexto; rotulo: string }[] = [
  { valor: 'normal', rotulo: 'Normal' },
  { valor: 'grande', rotulo: 'Grande' },
  { valor: 'maior', rotulo: 'Maior' },
]

/** Botão do cabeçalho que abre os ajustes de conforto visual. */
export function AjustesVisuais() {
  const [aberto, setAberto] = useState(false)
  const { preferencias, mudarTema, mudarTexto } = usePreferencias()

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-2xl px-3 font-semibold text-muted hover:bg-paper2 hover:text-ink"
      >
        <Icone nome="ajustes" className="size-5" />
        <span className="sr-only sm:not-sr-only">Ajustes</span>
        <span className="sr-only"> de conforto visual</span>
      </button>

      <Modal
        aberto={aberto}
        titulo="Conforto visual"
        descricao="As mudanças valem na hora e ficam salvas neste aparelho."
        aoFechar={() => setAberto(false)}
        rodape={<Button onClick={() => setAberto(false)}>Pronto</Button>}
      >
        <div className="space-y-6">
          <GrupoOpcoes
            legenda="Tela"
            opcoes={TEMAS}
            valor={preferencias.tema}
            aoMudar={mudarTema}
          />
          <GrupoOpcoes
            legenda="Tamanho do texto"
            opcoes={TAMANHOS}
            valor={preferencias.texto}
            aoMudar={mudarTexto}
            disposicao="linha"
          />
        </div>
      </Modal>
    </>
  )
}
