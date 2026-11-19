import { describe, expect, it } from 'vitest'
import {
  contatoValido,
  formatarContato,
  formatarTelefone,
  limparNome,
  mensagemContatoInvalido,
  nomeValido,
  telefoneValido,
  tipoContato,
} from './contato'

describe('nome do responsável', () => {
  it('remove números e símbolos enquanto digita', () => {
    expect(limparNome('11111111111111')).toBe('')
    expect(limparNome('Ana123 Maria!')).toBe('Ana Maria')
    expect(limparNome('  João  da   Silva')).toBe('João da Silva')
  })

  it.each(['Ana', 'João da Silva', "D'Ávila", 'Maria-Clara', 'Lu'])('%s é válido', (n) =>
    expect(nomeValido(n)).toBe(true),
  )

  it.each(['A', '123', 'Ana 2', '--', 'Ana  -', ''])('"%s" é inválido', (n) =>
    expect(nomeValido(n)).toBe(false),
  )
})

describe('formatarTelefone', () => {
  it.each([
    ['1', '(1'],
    ['11', '(11'],
    ['119', '(11) 9'],
    ['11987', '(11) 987'],
    ['1198765', '(11) 9876-5'],
    ['1134567890', '(11) 3456-7890'],
    ['11987654321', '(11) 98765-4321'],
    ['119876543219999', '(11) 98765-4321'], // limita a 11 dígitos
  ])('%s → %s', (entrada, saida) => expect(formatarTelefone(entrada)).toBe(saida))
})

describe('formatarContato', () => {
  it('formata números como telefone', () => {
    expect(formatarContato('111111111111111111')).toBe('(11) 11111-1111')
    expect(formatarContato('(11) 98765-43210')).toBe('(11) 98765-4321')
  })

  it('com letra ou @ vira e-mail, sem espaços', () => {
    expect(formatarContato('ana @exemplo.com')).toBe('ana@exemplo.com')
    expect(tipoContato('ana')).toBe('email')
  })

  it('desfaz a máscara se começou com número e virou e-mail', () => {
    expect(formatarContato('(12) 3a')).toBe('123a')
  })

  it('apagar tudo deixa vazio', () => {
    expect(formatarContato('(')).toBe('')
    expect(tipoContato('   ')).toBe('vazio')
  })
})

describe('telefoneValido', () => {
  it.each(['(11) 98765-4321', '(21) 3456-7890', '(85) 99999-0000'])('%s é válido', (t) =>
    expect(telefoneValido(t)).toBe(true),
  )

  it.each([
    ['(11) 11111-1111', 'celular precisa começar com 9'],
    ['(10) 98765-4321', 'DDD 10 não existe'],
    ['(11) 1234-5678', 'fixo precisa começar com 2 a 5'],
    ['(11) 9876-543', 'faltam dígitos'],
  ])('%s é inválido (%s)', (t) => expect(telefoneValido(t)).toBe(false))
})

describe('contatoValido', () => {
  it.each(['ana@exemplo.com', '(11) 98765-4321', 'ana.silva+avisos@empresa.com.br'])(
    '%s é válido',
    (v) => expect(contatoValido(v)).toBe(true),
  )

  it.each(['ana@', 'ana@exemplo', '1234', 'liga pra mim', '111111111111111111'])(
    '%s é inválido',
    (v) => expect(contatoValido(v)).toBe(false),
  )

  it('dá a mensagem certa para cada tipo', () => {
    expect(mensagemContatoInvalido('(11) 1234')).toMatch(/telefone/)
    expect(mensagemContatoInvalido('ana@')).toMatch(/e-mail/)
  })
})
