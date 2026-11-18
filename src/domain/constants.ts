/**
 * Constantes de negócio do Hearmony.
 * Os números aqui são os mesmos da entrega de Software & Total Experience Design.
 */

// ---------- RN04: limite de tolerância ----------
export const LIMITE_MIN_DB = 40
export const LIMITE_MAX_DB = 90
export const LIMITE_PADRAO_DB = 65

// ---------- Faixas de exibição ----------
/** "Atenção" começa 5 dB abaixo do limite. */
export const MARGEM_ATENCAO_DB = 5

// ---------- RN01: ligar após ruído contínuo acima do limite ----------
export const TEMPO_ACIMA_PARA_LIGAR_MS = 2_000

// ---------- RN02: pico liga na hora ----------
export const DB_PICO_IMEDIATO = 85

// ---------- RN03: histerese para desligar ----------
export const MARGEM_HISTERESE_DB = 10
export const TEMPO_CALMO_PARA_DESLIGAR_MS = 30_000

// ---------- RF08: alerta por exposição persistente ----------
export const TEMPO_ALERTA_PERSISTENTE_MS = 10 * 60 * 1_000

// ---------- Perfil ----------
export const APELIDO_MIN = 2
export const APELIDO_MAX = 30
export const RESPONSAVEL_NOME_MAX = 60
export const RESPONSAVEL_CONTATO_MAX = 80
export const NOTA_MAX = 280

export const SONS = [
  { id: 'buzina', rotulo: 'Buzina' },
  { id: 'sirene', rotulo: 'Sirene' },
  { id: 'obras', rotulo: 'Obras' },
  { id: 'metro_freando', rotulo: 'Metrô freando' },
  { id: 'multidao', rotulo: 'Multidão' },
  { id: 'alto_falante', rotulo: 'Alto-falante' },
  { id: 'cachorro_latindo', rotulo: 'Cachorro latindo' },
  { id: 'outro', rotulo: 'Outro' },
] as const

export const SONS_IDS = SONS.map((s) => s.id) as [SomId, ...SomId[]]
export type SomId = (typeof SONS)[number]['id']

/** Referências textuais exibidas no slider de limite. */
export const REFERENCIAS_LIMITE = [
  { db: 40, rotulo: 'biblioteca' },
  { db: 68, rotulo: 'rua movimentada' },
  { db: 90, rotulo: 'obra' },
] as const

// ---------- Simulador de sensor ----------
export const CENARIOS = [
  { id: 'casa', nome: 'Casa', mediaDb: 40, variacaoDb: 4, chancePico: 0.01 },
  { id: 'biblioteca', nome: 'Biblioteca', mediaDb: 35, variacaoDb: 3, chancePico: 0.005 },
  { id: 'rua', nome: 'Rua movimentada', mediaDb: 68, variacaoDb: 6, chancePico: 0.04 },
  { id: 'metro', nome: 'Plataforma do metrô', mediaDb: 80, variacaoDb: 6, chancePico: 0.06 },
  { id: 'obra', nome: 'Obra', mediaDb: 88, variacaoDb: 5, chancePico: 0.08 },
] as const

export type CenarioId = (typeof CENARIOS)[number]['id']
export const CENARIO_PADRAO: CenarioId = 'casa'

export const PICO_SIMULADO_DB = 92
export const PICO_SIMULADO_DURACAO_MS = 2_000
export const INTERVALO_LEITURA_MS = 1_000
/** Quantas leituras recentes o monitor guarda para o mini-histórico. */
export const HISTORICO_CURTO_TAMANHO = 30

// ---------- Microfone (estimativa, sem gravação) ----------
export const MICROFONE_OFFSET_DB = 94
export const MICROFONE_MIN_DB = 30
export const MICROFONE_MAX_DB = 110

// ---------- Rede e escrita ----------
export const HTTP_TIMEOUT_MS = 8_000
export const HTTP_RETRY_DELAYS_MS = [500, 1_000, 2_000] as const
export const DEBOUNCE_NOTA_MS = 600

// ---------- Histórico ----------
export const DIAS_GRAFICO = 7
