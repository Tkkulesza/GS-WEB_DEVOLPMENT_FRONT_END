/**
 * Nome e contato do responsável (funções puras).
 * - Nome: só letras (com acento), espaço, apóstrofo e hífen.
 * - Contato: telefone brasileiro com DDD (formatado enquanto digita) ou e-mail.
 */

export type TipoContato = 'vazio' | 'telefone' | 'email'

/** DDDs em uso no Brasil (Anatel). */
const DDDS_VALIDOS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
])

const MAX_DIGITOS_TELEFONE = 11
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

// ---------- Nome ----------

/**
 * Limpa o nome enquanto a pessoa digita: remove números e símbolos,
 * não deixa começar com espaço nem repetir espaços.
 */
export function limparNome(valor: string): string {
  return valor
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
}

/** Nome com pelo menos 2 letras, formado por palavras separadas por espaço, apóstrofo ou hífen. */
export function nomeValido(valor: string): boolean {
  const nome = valor.trim()
  const letras = nome.match(/\p{L}/gu)?.length ?? 0
  return letras >= 2 && /^\p{L}+(?:[\s'-]\p{L}+)*$/u.test(nome)
}

// ---------- Contato ----------

/** Telefone se só houver números e sinais de telefone; e-mail se houver letra ou @. */
export function tipoContato(valor: string): TipoContato {
  if (valor.trim() === '') return 'vazio'
  if (/[\p{L}@]/u.test(valor)) return 'email'
  return 'telefone'
}

/** Formata até 11 dígitos como (11) 3456-7890 ou (11) 98765-4321. */
export function formatarTelefone(digitos: string): string {
  const d = digitos.replace(/\D/g, '').slice(0, MAX_DIGITOS_TELEFONE)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  const ddd = d.slice(0, 2)
  const resto = d.slice(2)
  if (resto.length <= 4) return `(${ddd}) ${resto}`
  if (d.length <= 10) return `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`
  return `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`
}

/**
 * Formata o contato enquanto a pessoa digita:
 * números viram telefone com máscara; com letra ou @, vira e-mail (sem espaços).
 */
export function formatarContato(valor: string): string {
  const tipo = tipoContato(valor)
  if (tipo === 'vazio') return ''
  if (tipo === 'telefone') return formatarTelefone(valor)
  // Se começou como telefone e virou e-mail (ex.: "123abc@..."), desfaz a máscara.
  const semMascara = valor.startsWith('(') ? valor.replace(/[()\s-]/g, '') : valor
  return semMascara.replace(/\s/g, '')
}

export function telefoneValido(valor: string): boolean {
  const d = valor.replace(/\D/g, '')
  if (d.length !== 10 && d.length !== 11) return false
  if (!DDDS_VALIDOS.has(Number(d.slice(0, 2)))) return false
  // Celular: 9 dígitos começando com 9. Fixo: 8 dígitos começando com 2 a 5.
  return d.length === 11 ? d[2] === '9' : /[2-5]/.test(d[2])
}

export function emailValido(valor: string): boolean {
  return EMAIL_RE.test(valor.trim())
}

export function contatoValido(valor: string): boolean {
  const tipo = tipoContato(valor)
  if (tipo === 'telefone') return telefoneValido(valor)
  if (tipo === 'email') return emailValido(valor)
  return false
}

/** Mensagem específica para cada tipo de contato inválido. */
export function mensagemContatoInvalido(valor: string): string {
  if (tipoContato(valor) === 'telefone') {
    return 'Confira o telefone: use DDD e número, como (11) 98765-4321.'
  }
  return 'Confira o e-mail: ele precisa ser como nome@exemplo.com.'
}
