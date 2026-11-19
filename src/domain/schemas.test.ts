import { describe, expect, it } from 'vitest'
import {
  NotaSchema,
  PerfilInputSchema,
  PerfilSchema,
  RegistroSchema,
  contatoValido,
  errosPorCampo,
  validarLista,
} from './schemas'

const entradaValida = {
  apelido: '  Lu  ',
  sonsGatilho: ['buzina', 'sirene'],
  limiteDb: 65,
  responsavelNome: '',
  responsavelContato: '',
  consentimentoResponsavel: false,
  consentimentoLgpd: true,
}

describe('PerfilInputSchema', () => {
  it('aceita um perfil válido, com trim e responsável vazio virando null', () => {
    const r = PerfilInputSchema.parse(entradaValida)
    expect(r.apelido).toBe('Lu')
    expect(r.responsavelNome).toBeNull()
    expect(r.responsavelContato).toBeNull()
  })

  it('RN04: recusa 39 e 91 dB', () => {
    expect(PerfilInputSchema.safeParse({ ...entradaValida, limiteDb: 39 }).success).toBe(false)
    expect(PerfilInputSchema.safeParse({ ...entradaValida, limiteDb: 91 }).success).toBe(false)
  })

  it('exige consentimento LGPD', () => {
    const r = PerfilInputSchema.safeParse({ ...entradaValida, consentimentoLgpd: false })
    expect(r.success).toBe(false)
    if (!r.success) expect(errosPorCampo(r.error).consentimentoLgpd).toMatch(/consentimento/)
  })

  it('RN05: exige consentimento do responsável quando ele é preenchido', () => {
    const r = PerfilInputSchema.safeParse({
      ...entradaValida,
      responsavelNome: 'Ana',
      responsavelContato: 'ana@exemplo.com',
    })
    expect(r.success).toBe(false)
    if (!r.success)
      expect(Object.keys(errosPorCampo(r.error))).toEqual(['consentimentoResponsavel'])
  })

  it('pede nome e contato juntos', () => {
    const r = PerfilInputSchema.safeParse({
      ...entradaValida,
      responsavelNome: 'Ana',
      consentimentoResponsavel: true,
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(errosPorCampo(r.error).responsavelContato).toBeDefined()
  })

  it('recusa apelido curto e som desconhecido', () => {
    expect(PerfilInputSchema.safeParse({ ...entradaValida, apelido: 'L' }).success).toBe(false)
    expect(PerfilInputSchema.safeParse({ ...entradaValida, sonsGatilho: ['trovão'] }).success).toBe(
      false,
    )
  })
})

describe('contatoValido', () => {
  it.each(['ana@exemplo.com', '(11) 98765-4321', '+55 11 98765-4321'])('%s é válido', (v) =>
    expect(contatoValido(v)).toBe(true),
  )
  it.each(['ana@', '1234', 'liga pra mim'])('%s é inválido', (v) =>
    expect(contatoValido(v)).toBe(false),
  )
})

describe('NotaSchema', () => {
  it('limita a 280 caracteres e transforma vazio em null', () => {
    expect(NotaSchema.parse('   ')).toBeNull()
    expect(NotaSchema.safeParse('a'.repeat(281)).success).toBe(false)
  })
})

describe('validação de respostas da API', () => {
  const perfilApi = {
    id: '1',
    apelido: 'Lu',
    sonsGatilho: ['buzina'],
    limiteDb: 65,
    consentimentoResponsavel: false,
    consentimentoLgpd: true,
    criadoEm: '2026-11-18T10:00:00.000Z',
    atualizadoEm: '2026-11-18T10:00:00.000Z',
  }

  it('normaliza campos opcionais ausentes para null', () => {
    const p = PerfilSchema.parse(perfilApi)
    expect(p.responsavelNome).toBeNull()
  })

  it('descarta itens inválidos da lista sem derrubar o resto', () => {
    const r = validarLista(PerfilSchema, [perfilApi, { ...perfilApi, limiteDb: 'alto' }])
    expect(r?.itens).toHaveLength(1)
    expect(r?.descartados).toBe(1)
  })

  it('devolve null se a resposta não for lista', () => {
    expect(validarLista(RegistroSchema, { erro: true })).toBeNull()
  })

  it('valida um registro de auditoria com campos de episódio vazios', () => {
    const r = RegistroSchema.parse({
      id: '9',
      perfilId: '1',
      categoria: 'auditoria',
      inicio: '2026-11-18T10:00:00.000Z',
      acao: 'perfil_criado',
    })
    expect(r.fim).toBeNull()
    expect(r.acao).toBe('perfil_criado')
  })
})
