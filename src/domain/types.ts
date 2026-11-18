import type { CenarioId, SomId } from './constants'

/** Faixa de exibição do volume em relação ao limite pessoal. */
export type Faixa = 'tranquilo' | 'atencao' | 'alto'

export type CategoriaRegistro = 'exposicao' | 'alerta' | 'auditoria'

/** O que ligou a proteção (exposicao) ou o que gerou o alerta. */
export type Gatilho = 'automatico' | 'pico' | 'modo_calma' | 'ajuda' | 'persistente'

/** Motivos possíveis para a proteção estar ligada. */
export type MotivoProtecao = Extract<Gatilho, 'automatico' | 'pico' | 'modo_calma'>

export type AcaoAuditoria =
  'perfil_criado' | 'perfil_editado' | 'dados_exportados' | 'perfil_excluido'

/** Origem da leitura: um cenário do simulador ou o microfone do navegador. */
export type OrigemLeitura = CenarioId | 'microfone'

export type FonteMonitor = 'simulador' | 'microfone'

export interface Perfil {
  id: string
  apelido: string
  sonsGatilho: SomId[]
  limiteDb: number
  responsavelNome: string | null
  responsavelContato: string | null
  consentimentoResponsavel: boolean
  consentimentoLgpd: boolean
  criadoEm: string
  atualizadoEm: string
}

/** Dados que a pessoa preenche no formulário (sem id e datas). */
export type PerfilInput = Omit<Perfil, 'id' | 'criadoEm' | 'atualizadoEm'>

export interface Registro {
  id: string
  perfilId: string
  categoria: CategoriaRegistro
  /** Início do episódio (exposicao) ou momento do evento (alerta, auditoria). */
  inicio: string
  fim: string | null
  duracaoSeg: number | null
  picoDb: number | null
  gatilho: Gatilho | null
  cenario: OrigemLeitura | null
  nota: string | null
  acao: AcaoAuditoria | null
}

export type RegistroInput = Omit<Registro, 'id'>

/**
 * Estado da máquina de proteção. É um valor imutável:
 * `proximoEstadoProtecao` recebe um estado e devolve outro.
 * Tempos em milissegundos (epoch).
 */
export interface EstadoProtecao {
  ativa: boolean
  motivo: MotivoProtecao | null
  /** Quando ligou. */
  ligadaEm: number | null
  /** Desde quando o ruído está continuamente acima do limite (RN01 e RF08). */
  acimaDesde: number | null
  /** Desde quando o ruído está continuamente 10 dB abaixo do limite (RN03). */
  calmoDesde: number | null
  /** Maior leitura durante o episódio atual. */
  picoDb: number
  /** Evita mandar o alerta de exposição persistente mais de uma vez por episódio. */
  alertaPersistenteEnviado: boolean
}

/** Dados de um episódio encerrado, prontos para virar um Registro `exposicao`. */
export interface Episodio {
  inicio: string
  fim: string
  duracaoSeg: number
  picoDb: number
  gatilho: MotivoProtecao
}
