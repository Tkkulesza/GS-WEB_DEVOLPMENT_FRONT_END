import { useEffect, useId, useRef, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type {
  CampoFormPerfil,
  Etapa,
  ErrosFormPerfil,
  ValoresFormPerfil,
} from '../../hooks/useFormularioPerfil'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { classesBotao } from '../ui/estilos'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'
import { ChipsSons } from './ChipsSons'
import { SliderLimite } from './SliderLimite'
import { StepIndicator } from './StepIndicator'

const NOMES_ETAPAS = ['Apelido', 'Sons', 'Limite', 'Responsável e consentimento'] as const

interface FormPerfilProps {
  modo: 'criar' | 'editar'
  etapa: Etapa
  totalEtapas: number
  valores: ValoresFormPerfil
  erros: ErrosFormPerfil
  salvando: boolean
  hrefCancelar: string
  aoAlterar: <C extends CampoFormPerfil>(campo: C, valor: ValoresFormPerfil[C]) => void
  /** Valida e avança; devolve se avançou. */
  aoAvancar: () => boolean
  aoVoltar: () => void
  /** Última etapa; devolve se salvou. */
  aoConcluir: () => Promise<boolean>
}

/** Formulário de perfil em 4 etapas. Só apresentação: o estado vem por props. */
export function FormPerfil({
  modo,
  etapa,
  totalEtapas,
  valores,
  erros,
  salvando,
  hrefCancelar,
  aoAlterar,
  aoAvancar,
  aoVoltar,
  aoConcluir,
}: FormPerfilProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const idTitulo = useId()
  const idErroSons = useId()
  // Compara com a etapa anterior (no StrictMode o efeito roda duas vezes ao montar).
  const etapaAnterior = useRef(etapa)

  // A cada etapa, o foco vai para o título (o leitor de tela anuncia a pergunta nova).
  useEffect(() => {
    if (etapaAnterior.current === etapa) return
    etapaAnterior.current = etapa
    tituloRef.current?.focus()
  }, [etapa])

  function focarPrimeiroErro() {
    requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalido="true"] input')
        ?.focus()
    })
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (salvando) return
    const ok = etapa < totalEtapas ? aoAvancar() : await aoConcluir()
    if (!ok) focarPrimeiroErro()
  }

  const titulo = (texto: string) => (
    <h2 id={idTitulo} ref={tituloRef} tabIndex={-1} className="text-2xl font-semibold outline-none">
      {texto}
    </h2>
  )

  return (
    <form ref={formRef} onSubmit={enviar} noValidate className="max-w-xl">
      <StepIndicator atual={etapa} total={totalEtapas} nome={NOMES_ETAPAS[etapa - 1]} />

      <div className="rounded-3xl border border-line bg-card p-5 sm:p-8">
        {etapa === 1 && (
          <div className="space-y-5">
            {titulo(modo === 'criar' ? 'Oi. Vamos montar seu perfil.' : 'Seu apelido')}
            <p className="text-muted">
              {modo === 'criar'
                ? 'Leva uns dois minutos. Você pode mudar tudo depois.'
                : 'Você pode revisar cada etapa e salvar no final.'}
            </p>
            <Field
              rotulo="Como você quer ser chamado?"
              descricao="Use um apelido. Não precisa do nome completo."
              erro={erros.apelido}
            >
              {(props) => (
                <Input
                  {...props}
                  value={valores.apelido}
                  onChange={(e) => aoAlterar('apelido', e.target.value)}
                  maxLength={30}
                  autoComplete="nickname"
                />
              )}
            </Field>
          </div>
        )}

        {etapa === 2 && (
          <div className="space-y-5">
            {titulo('Quais sons mais te incomodam?')}
            <p className="text-muted">Escolha quantos quiser.</p>
            <ChipsSons
              selecionados={valores.sonsGatilho}
              aoMudar={(sons) => aoAlterar('sonsGatilho', sons)}
              idRotulo={idTitulo}
              idErro={idErroSons}
              erro={erros.sonsGatilho}
            />
          </div>
        )}

        {etapa === 3 && (
          <div className="space-y-5">
            {titulo('Até onde o som fica confortável pra você?')}
            <SliderLimite
              valor={valores.limiteDb}
              aoMudar={(v) => aoAlterar('limiteDb', v)}
              erro={erros.limiteDb}
            />
          </div>
        )}

        {etapa === 4 && (
          <div className="space-y-5">
            {titulo('Quer que a gente avise alguém de confiança?')}
            <p className="text-muted">
              É opcional. Se preencher, essa pessoa pode receber um aviso quando você pedir ajuda ou
              quando o barulho durar muito tempo.
            </p>
            <Field rotulo="Nome do responsável" erro={erros.responsavelNome}>
              {(props) => (
                <Input
                  {...props}
                  value={valores.responsavelNome}
                  onChange={(e) => aoAlterar('responsavelNome', e.target.value)}
                  maxLength={60}
                  autoComplete="off"
                />
              )}
            </Field>
            <Field
              rotulo="E-mail ou telefone"
              descricao="Ex.: nome@exemplo.com ou (11) 98765-4321"
              erro={erros.responsavelContato}
            >
              {(props) => (
                <Input
                  {...props}
                  value={valores.responsavelContato}
                  onChange={(e) => aoAlterar('responsavelContato', e.target.value)}
                  maxLength={80}
                  autoComplete="off"
                />
              )}
            </Field>
            <Checkbox
              marcado={valores.consentimentoResponsavel}
              aoMudar={(v) => aoAlterar('consentimentoResponsavel', v)}
              rotulo="Essa pessoa concorda em receber avisos do Hearmony"
              descricao="Sem essa confirmação, o botão de avisar o responsável não aparece."
              erro={erros.consentimentoResponsavel}
            />

            <hr className="border-line" />

            <Checkbox
              marcado={valores.consentimentoLgpd}
              aoMudar={(v) => aoAlterar('consentimentoLgpd', v)}
              rotulo="Concordo que o Hearmony guarde estes dados para me proteger"
              descricao="Guardamos só o apelido, os sons, o limite e o responsável. Você pode exportar ou apagar tudo em Meus dados."
              erro={erros.consentimentoLgpd}
            />
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {etapa === 1 ? (
          <Link to={hrefCancelar} className={classesBotao('ghost', 'md')}>
            Cancelar
          </Link>
        ) : (
          <Button variante="ghost" onClick={aoVoltar} disabled={salvando}>
            Voltar
          </Button>
        )}
        <Button type="submit" tamanho="lg" carregando={salvando}>
          {etapa < totalEtapas
            ? 'Continuar'
            : modo === 'criar'
              ? 'Salvar meu perfil'
              : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
