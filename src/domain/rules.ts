/**
 * Regras de negócio puras (RN01–RN05, RF08).
 * Nada aqui conhece React, fetch ou relógio: o tempo sempre entra por parâmetro.
 */
import {
  DB_PICO_IMEDIATO,
  LIMITE_MAX_DB,
  LIMITE_MIN_DB,
  MARGEM_ATENCAO_DB,
  MARGEM_HISTERESE_DB,
  TEMPO_ACIMA_PARA_LIGAR_MS,
  TEMPO_ALERTA_PERSISTENTE_MS,
  TEMPO_CALMO_PARA_DESLIGAR_MS,
} from './constants'
import type { Episodio, EstadoProtecao, Faixa, Perfil, PerfilInput } from './types'

// ---------- Faixas ----------

export function classificarFaixa(db: number, limite: number): Faixa {
  if (db >= limite) return 'alto'
  if (db >= limite - MARGEM_ATENCAO_DB) return 'atencao'
  return 'tranquilo'
}

export const ROTULO_FAIXA: Record<Faixa, string> = {
  tranquilo: 'Tranquilo',
  atencao: 'Atenção',
  alto: 'Alto',
}

/** "Acima do limite" usa o mesmo corte da faixa "alto" (db ≥ limite). */
export function estaAcimaDoLimite(db: number, limite: number): boolean {
  return db >= limite
}

/** RN03: o ambiente só conta como calmo 10 dB abaixo do limite. */
export function estaCalmo(db: number, limite: number): boolean {
  return db <= limite - MARGEM_HISTERESE_DB
}

/** RN02 */
export function ehPicoImediato(db: number): boolean {
  return db >= DB_PICO_IMEDIATO
}

// ---------- Máquina de estados da proteção ----------

export const ESTADO_PROTECAO_INICIAL: EstadoProtecao = {
  ativa: false,
  motivo: null,
  ligadaEm: null,
  acimaDesde: null,
  calmoDesde: null,
  picoDb: 0,
  alertaPersistenteEnviado: false,
}

/**
 * Calcula o próximo estado da proteção a partir de uma leitura.
 *
 * - RN01: liga com ruído acima do limite por 2 s seguidos.
 * - RN02: liga na hora com leitura ≥ 85 dB.
 * - RN03: desliga após 30 s seguidos com ruído 10 dB abaixo do limite.
 *         Se foi ligada pelo Modo Calma, nunca desliga sozinha.
 */
export function proximoEstadoProtecao(
  estado: EstadoProtecao,
  db: number,
  limite: number,
  agora: number,
): EstadoProtecao {
  const acima = estaAcimaDoLimite(db, limite)
  const acimaDesde = acima ? (estado.acimaDesde ?? agora) : null

  if (!estado.ativa) {
    const motivo = ehPicoImediato(db)
      ? 'pico'
      : acimaDesde !== null && agora - acimaDesde >= TEMPO_ACIMA_PARA_LIGAR_MS
        ? 'automatico'
        : null

    if (motivo === null) {
      return { ...ESTADO_PROTECAO_INICIAL, acimaDesde }
    }

    return {
      ativa: true,
      motivo,
      ligadaEm: agora,
      acimaDesde,
      calmoDesde: null,
      picoDb: db,
      alertaPersistenteEnviado: false,
    }
  }

  // Proteção ligada: acompanha pico e tempo de calma.
  const picoDb = Math.max(estado.picoDb, db)

  if (estado.motivo === 'modo_calma') {
    return { ...estado, acimaDesde, calmoDesde: null, picoDb }
  }

  const calmoDesde = estaCalmo(db, limite) ? (estado.calmoDesde ?? agora) : null

  if (calmoDesde !== null && agora - calmoDesde >= TEMPO_CALMO_PARA_DESLIGAR_MS) {
    return { ...ESTADO_PROTECAO_INICIAL }
  }

  return { ...estado, acimaDesde, calmoDesde, picoDb }
}

/** Modo Calma: liga agora, mesmo abaixo do limite, e só desliga manualmente. */
export function ativarModoCalma(estado: EstadoProtecao, db: number, agora: number): EstadoProtecao {
  if (estado.ativa) {
    return {
      ...estado,
      motivo: 'modo_calma',
      calmoDesde: null,
      picoDb: Math.max(estado.picoDb, db),
    }
  }
  return {
    ...ESTADO_PROTECAO_INICIAL,
    ativa: true,
    motivo: 'modo_calma',
    ligadaEm: agora,
    acimaDesde: estado.acimaDesde,
    picoDb: db,
  }
}

/** Botão "Desativar": desliga em qualquer modo. */
export function desativarProtecao(): EstadoProtecao {
  return { ...ESTADO_PROTECAO_INICIAL }
}

export function segundosLigada(estado: EstadoProtecao, agora: number): number {
  if (!estado.ativa || estado.ligadaEm === null) return 0
  return Math.max(0, Math.floor((agora - estado.ligadaEm) / 1_000))
}

/**
 * Monta o episódio encerrado a partir do estado ANTES de desligar.
 * Devolve null se o estado não representa uma proteção ligada.
 */
export function montarEpisodio(estadoAnterior: EstadoProtecao, agora: number): Episodio | null {
  if (!estadoAnterior.ativa || estadoAnterior.ligadaEm === null || estadoAnterior.motivo === null) {
    return null
  }
  return {
    inicio: new Date(estadoAnterior.ligadaEm).toISOString(),
    fim: new Date(agora).toISOString(),
    duracaoSeg: Math.max(0, Math.round((agora - estadoAnterior.ligadaEm) / 1_000)),
    picoDb: Math.round(estadoAnterior.picoDb),
    gatilho: estadoAnterior.motivo,
  }
}

// ---------- RF08: alerta por exposição persistente ----------

/**
 * Verdadeiro quando o ruído está acima do limite há mais de 10 minutos
 * com a proteção ligada, e o alerta ainda não foi enviado neste episódio.
 */
export function deveAlertarPersistente(estado: EstadoProtecao, agora: number): boolean {
  if (!estado.ativa || estado.alertaPersistenteEnviado) return false
  if (estado.acimaDesde === null || estado.ligadaEm === null) return false
  const desde = Math.max(estado.acimaDesde, estado.ligadaEm)
  return agora - desde > TEMPO_ALERTA_PERSISTENTE_MS
}

export function marcarAlertaPersistenteEnviado(estado: EstadoProtecao): EstadoProtecao {
  return { ...estado, alertaPersistenteEnviado: true }
}

// ---------- RN04: limite ----------

export function limiteValido(limite: number): boolean {
  return Number.isInteger(limite) && limite >= LIMITE_MIN_DB && limite <= LIMITE_MAX_DB
}

// ---------- RN05: responsável ----------

function preenchido(valor: string | null | undefined): boolean {
  return typeof valor === 'string' && valor.trim().length > 0
}

export function temResponsavel(
  perfil: Pick<PerfilInput, 'responsavelNome' | 'responsavelContato'>,
): boolean {
  return preenchido(perfil.responsavelNome) || preenchido(perfil.responsavelContato)
}

/**
 * Para salvar: se houver qualquer dado de responsável, o consentimento dele é obrigatório.
 */
export function consentimentoResponsavelValido(
  perfil: Pick<PerfilInput, 'responsavelNome' | 'responsavelContato' | 'consentimentoResponsavel'>,
): boolean {
  return !temResponsavel(perfil) || perfil.consentimentoResponsavel === true
}

/**
 * RN05: o alerta só vai para um responsável cadastrado (nome e contato) e com consentimento.
 * Sem isso, o botão "Avisar meu responsável" não aparece.
 */
export function podeAvisarResponsavel(
  perfil: Pick<
    Perfil,
    'responsavelNome' | 'responsavelContato' | 'consentimentoResponsavel'
  > | null,
): boolean {
  if (!perfil) return false
  return (
    preenchido(perfil.responsavelNome) &&
    preenchido(perfil.responsavelContato) &&
    perfil.consentimentoResponsavel === true
  )
}

/** Consentimento LGPD é sempre obrigatório para salvar o perfil. */
export function podeSalvarPerfil(perfil: PerfilInput): boolean {
  return (
    perfil.consentimentoLgpd === true &&
    limiteValido(perfil.limiteDb) &&
    consentimentoResponsavelValido(perfil)
  )
}
