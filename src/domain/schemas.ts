/**
 * Validação de dados com zod.
 * - Entrada: formulário de perfil, nota do episódio e corpo enviado à API.
 * - Saída: toda resposta da API passa por aqui antes de chegar na tela.
 * As mensagens seguem o tom da marca: calmas, curtas e sem culpar a pessoa.
 */
import { z } from 'zod'
import {
  APELIDO_MAX,
  APELIDO_MIN,
  CENARIOS,
  LIMITE_MAX_DB,
  LIMITE_MIN_DB,
  NOTA_MAX,
  RESPONSAVEL_CONTATO_MAX,
  RESPONSAVEL_NOME_MAX,
  SONS_IDS,
} from './constants'
import { contatoValido, mensagemContatoInvalido, nomeValido } from './contato'
import { temResponsavel } from './rules'
import type { Perfil, PerfilInput, Registro, RegistroInput } from './types'

// ---------- Blocos reutilizáveis ----------

const CENARIO_IDS = CENARIOS.map((c) => c.id) as [
  (typeof CENARIOS)[number]['id'],
  ...(typeof CENARIOS)[number]['id'][],
]

const CATEGORIAS = ['exposicao', 'alerta', 'auditoria'] as const
const GATILHOS = ['automatico', 'pico', 'modo_calma', 'ajuda', 'persistente'] as const
const ACOES = ['perfil_criado', 'perfil_editado', 'dados_exportados', 'perfil_excluido'] as const

/** Texto opcional: aplica trim, limita tamanho e transforma "" em null. */
function textoOpcional(max: number, mensagemMax: string) {
  return z
    .string()
    .trim()
    .max(max, { error: mensagemMax })
    .nullish()
    .transform((v) => (v ? v : null))
}

/** Campo que pode vir ausente da API: normaliza para null. */
function nulo<T extends z.ZodType>(schema: T) {
  return schema.nullish().transform((v) => v ?? null)
}

const dataIso = z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
  error: 'Data em formato inesperado.',
})

/** Regras de nome e contato do responsável ficam em ./contato (reexportadas aqui). */
export { contatoValido }

// ---------- Campos do perfil (usados por etapa no formulário) ----------

export const ApelidoSchema = z
  .string()
  .trim()
  .min(APELIDO_MIN, { error: `Escreva um apelido com pelo menos ${APELIDO_MIN} letras.` })
  .max(APELIDO_MAX, { error: `Use um apelido de até ${APELIDO_MAX} caracteres.` })

export const SonsGatilhoSchema = z
  .array(z.enum(SONS_IDS))
  .min(1, { error: 'Escolha pelo menos um som. Se nenhum combinar, marque "Outro".' })

export const LimiteSchema = z
  .number({ error: 'Escolha um valor no controle.' })
  .int({ error: 'Use um número inteiro.' })
  .min(LIMITE_MIN_DB, {
    error: `O limite precisa ficar entre ${LIMITE_MIN_DB} e ${LIMITE_MAX_DB} dB.`,
  })
  .max(LIMITE_MAX_DB, {
    error: `O limite precisa ficar entre ${LIMITE_MIN_DB} e ${LIMITE_MAX_DB} dB.`,
  })

// ---------- Entrada: perfil ----------

export const PerfilInputSchema = z
  .object({
    apelido: ApelidoSchema,
    sonsGatilho: SonsGatilhoSchema,
    limiteDb: LimiteSchema,
    responsavelNome: textoOpcional(
      RESPONSAVEL_NOME_MAX,
      `Use um nome de até ${RESPONSAVEL_NOME_MAX} caracteres.`,
    ),
    responsavelContato: textoOpcional(
      RESPONSAVEL_CONTATO_MAX,
      `Use um contato de até ${RESPONSAVEL_CONTATO_MAX} caracteres.`,
    ),
    consentimentoResponsavel: z.boolean(),
    consentimentoLgpd: z.boolean(),
  })
  .superRefine((p, ctx) => {
    if (!p.consentimentoLgpd) {
      ctx.addIssue({
        code: 'custom',
        path: ['consentimentoLgpd'],
        message: 'Para salvar, precisamos do seu consentimento.',
      })
    }

    if (!temResponsavel(p)) return

    if (!p.responsavelNome) {
      ctx.addIssue({
        code: 'custom',
        path: ['responsavelNome'],
        message: 'Escreva o nome do responsável, ou deixe os dois campos em branco.',
      })
    } else if (!nomeValido(p.responsavelNome)) {
      ctx.addIssue({
        code: 'custom',
        path: ['responsavelNome'],
        message: 'Use só letras no nome, como Ana ou João da Silva.',
      })
    }
    if (!p.responsavelContato) {
      ctx.addIssue({
        code: 'custom',
        path: ['responsavelContato'],
        message: 'Escreva um e-mail ou telefone, ou deixe os dois campos em branco.',
      })
    } else if (!contatoValido(p.responsavelContato)) {
      ctx.addIssue({
        code: 'custom',
        path: ['responsavelContato'],
        message: mensagemContatoInvalido(p.responsavelContato),
      })
    }
    if (!p.consentimentoResponsavel) {
      ctx.addIssue({
        code: 'custom',
        path: ['consentimentoResponsavel'],
        message: 'Para cadastrar um responsável, marque que ele concorda em receber avisos.',
      })
    }
  }) satisfies z.ZodType<PerfilInput, unknown>

// ---------- Entrada: nota do episódio ----------

export const NotaSchema = z
  .string()
  .trim()
  .max(NOTA_MAX, { error: `A nota pode ter até ${NOTA_MAX} caracteres.` })
  .transform((v) => (v ? v : null))

// ---------- Saída (respostas da API) ----------

export const PerfilSchema = z.object({
  id: z.string().min(1),
  apelido: z.string().min(1).max(APELIDO_MAX),
  sonsGatilho: z.array(z.enum(SONS_IDS)),
  limiteDb: LimiteSchema,
  responsavelNome: nulo(z.string()),
  responsavelContato: nulo(z.string()),
  consentimentoResponsavel: z.boolean(),
  consentimentoLgpd: z.boolean(),
  criadoEm: dataIso,
  atualizadoEm: dataIso,
}) satisfies z.ZodType<Perfil, unknown>

const registroCampos = {
  perfilId: z.string().min(1),
  categoria: z.enum(CATEGORIAS),
  inicio: dataIso,
  fim: nulo(dataIso),
  duracaoSeg: nulo(z.number().nonnegative()),
  picoDb: nulo(z.number()),
  gatilho: nulo(z.enum(GATILHOS)),
  cenario: nulo(z.enum([...CENARIO_IDS, 'microfone'])),
  nota: nulo(z.string().max(NOTA_MAX)),
  acao: nulo(z.enum(ACOES)),
}

export const RegistroSchema = z.object({
  id: z.string().min(1),
  ...registroCampos,
}) satisfies z.ZodType<Registro, unknown>

/** Validação do corpo antes de enviar um registro novo à API. */
export const RegistroInputSchema = z.object(registroCampos) satisfies z.ZodType<
  RegistroInput,
  unknown
>

// ---------- Utilitários ----------

export interface ListaValidada<T> {
  itens: T[]
  /** Quantos itens vieram com formato inesperado e foram descartados. */
  descartados: number
}

/**
 * Valida uma lista item a item: um registro estranho não derruba a tela inteira.
 * Se a resposta nem for uma lista, devolve null (o chamador trata como erro).
 */
export function validarLista<T>(schema: z.ZodType<T>, dados: unknown): ListaValidada<T> | null {
  if (!Array.isArray(dados)) return null
  const itens: T[] = []
  let descartados = 0
  for (const item of dados) {
    const r = schema.safeParse(item)
    if (r.success) itens.push(r.data)
    else descartados++
  }
  return { itens, descartados }
}

/** Converte os erros do zod em { campo: primeira mensagem }, para exibir no formulário. */
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const mapa: Record<string, string> = {}
  for (const issue of erro.issues) {
    const campo = issue.path.join('.') || '_'
    if (!(campo in mapa)) mapa[campo] = issue.message
  }
  return mapa
}
