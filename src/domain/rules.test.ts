import { describe, expect, it } from 'vitest'
import {
  ESTADO_PROTECAO_INICIAL,
  ativarModoCalma,
  classificarFaixa,
  consentimentoResponsavelValido,
  desativarProtecao,
  deveAlertarPersistente,
  limiteValido,
  marcarAlertaPersistenteEnviado,
  montarEpisodio,
  podeAvisarResponsavel,
  podeSalvarPerfil,
  proximoEstadoProtecao,
  segundosLigada,
} from './rules'
import type { EstadoProtecao, PerfilInput } from './types'

const LIMITE = 70
const T0 = 1_700_000_000_000

/** Aplica uma sequência de leituras, uma por segundo, a partir de T0. */
function simular(
  leituras: number[],
  estado: EstadoProtecao = ESTADO_PROTECAO_INICIAL,
  inicio = T0,
) {
  let atual = estado
  leituras.forEach((db, i) => {
    atual = proximoEstadoProtecao(atual, db, LIMITE, inicio + i * 1_000)
  })
  return atual
}

/** Estado com proteção ligada automaticamente em T0. */
function ligadaAutomatica(): EstadoProtecao {
  const estado = simular([75, 75, 75])
  expect(estado.ativa).toBe(true)
  return estado
}

const perfilBase: PerfilInput = {
  apelido: 'Lu',
  sonsGatilho: ['buzina'],
  outroSom: null,
  limiteDb: 70,
  responsavelNome: null,
  responsavelContato: null,
  consentimentoResponsavel: false,
  consentimentoLgpd: true,
}

describe('classificarFaixa', () => {
  it('é tranquilo abaixo de limite − 5', () => {
    expect(classificarFaixa(64, LIMITE)).toBe('tranquilo')
  })
  it('é atenção entre limite − 5 e o limite', () => {
    expect(classificarFaixa(65, LIMITE)).toBe('atencao')
    expect(classificarFaixa(69, LIMITE)).toBe('atencao')
  })
  it('é alto a partir do limite', () => {
    expect(classificarFaixa(70, LIMITE)).toBe('alto')
    expect(classificarFaixa(95, LIMITE)).toBe('alto')
  })
})

describe('RN01 · liga após 2 s seguidos acima do limite', () => {
  it('não liga com 1 s acima do limite', () => {
    const estado = simular([75, 75]) // t=0 e t=1s
    expect(estado.ativa).toBe(false)
    expect(estado.acimaDesde).toBe(T0)
  })

  it('liga com 2 s acima do limite', () => {
    const estado = simular([75, 75, 75]) // t=0, 1s, 2s
    expect(estado.ativa).toBe(true)
    expect(estado.motivo).toBe('automatico')
    expect(estado.ligadaEm).toBe(T0 + 2_000)
  })

  it('zera a contagem se o ruído cair no meio', () => {
    const estado = simular([75, 60, 75, 75])
    expect(estado.ativa).toBe(false)
  })
})

describe('RN02 · pico a partir de 85 dB liga na hora', () => {
  it('liga na primeira leitura de 85 dB', () => {
    const estado = simular([85])
    expect(estado.ativa).toBe(true)
    expect(estado.motivo).toBe('pico')
  })

  it('84 dB sozinho não liga na hora', () => {
    expect(simular([84]).ativa).toBe(false)
  })
})

describe('RN03 · histerese para desligar', () => {
  it('não desliga com 29 s de calma', () => {
    const inicio = T0 + 10_000
    const estado = simular(Array(30).fill(55), ligadaAutomatica(), inicio) // 0..29 s
    expect(estado.ativa).toBe(true)
  })

  it('desliga com 30 s de calma (10 dB abaixo do limite)', () => {
    const inicio = T0 + 10_000
    const estado = simular(Array(31).fill(60), ligadaAutomatica(), inicio) // 0..30 s
    expect(estado.ativa).toBe(false)
  })

  it('não desliga se o ruído só cair 5 dB', () => {
    const inicio = T0 + 10_000
    const estado = simular(Array(60).fill(65), ligadaAutomatica(), inicio)
    expect(estado.ativa).toBe(true)
  })

  it('reinicia a contagem de calma se o ruído voltar a subir', () => {
    const inicio = T0 + 10_000
    const leituras = [...Array(20).fill(55), 66, ...Array(20).fill(55)]
    const estado = simular(leituras, ligadaAutomatica(), inicio)
    expect(estado.ativa).toBe(true)
  })

  it('guarda o maior pico do episódio', () => {
    const estado = simular([80, 91, 78], ligadaAutomatica(), T0 + 5_000)
    expect(estado.picoDb).toBe(91)
  })
})

describe('Modo Calma', () => {
  it('liga mesmo abaixo do limite', () => {
    const estado = ativarModoCalma(ESTADO_PROTECAO_INICIAL, 40, T0)
    expect(estado.ativa).toBe(true)
    expect(estado.motivo).toBe('modo_calma')
  })

  it('não desliga sozinho, mesmo com muito tempo de calma', () => {
    const calma = ativarModoCalma(ESTADO_PROTECAO_INICIAL, 40, T0)
    const estado = simular(Array(120).fill(35), calma, T0 + 1_000)
    expect(estado.ativa).toBe(true)
    expect(estado.motivo).toBe('modo_calma')
  })

  it('assume uma proteção automática já ligada', () => {
    const estado = ativarModoCalma(ligadaAutomatica(), 60, T0 + 5_000)
    expect(estado.motivo).toBe('modo_calma')
    expect(simular(Array(40).fill(40), estado, T0 + 6_000).ativa).toBe(true)
  })

  it('desliga quando a pessoa toca em Desativar', () => {
    expect(desativarProtecao().ativa).toBe(false)
  })
})

describe('Episódio', () => {
  it('monta o episódio com duração, pico e gatilho', () => {
    const anterior = simular([80, 88], ligadaAutomatica(), T0 + 3_000)
    const episodio = montarEpisodio(anterior, T0 + 2_000 + 45_000)
    expect(episodio).toEqual({
      inicio: new Date(T0 + 2_000).toISOString(),
      fim: new Date(T0 + 47_000).toISOString(),
      duracaoSeg: 45,
      picoDb: 88,
      gatilho: 'automatico',
    })
  })

  it('não monta episódio se a proteção não estava ligada', () => {
    expect(montarEpisodio(ESTADO_PROTECAO_INICIAL, T0)).toBeNull()
  })

  it('conta os segundos ligada', () => {
    expect(segundosLigada(ligadaAutomatica(), T0 + 2_000 + 12_400)).toBe(12)
  })
})

describe('RF08 · alerta por exposição persistente', () => {
  const onzeMin = 11 * 60 * 1_000

  it('alerta após mais de 10 min acima do limite com a proteção ligada', () => {
    const estado = proximoEstadoProtecao(ligadaAutomatica(), 80, LIMITE, T0 + onzeMin)
    expect(deveAlertarPersistente(estado, T0 + onzeMin)).toBe(true)
  })

  it('não alerta com 10 min exatos', () => {
    const fim = T0 + 2_000 + 10 * 60 * 1_000
    const estado = proximoEstadoProtecao(ligadaAutomatica(), 80, LIMITE, fim)
    expect(deveAlertarPersistente(estado, fim)).toBe(false)
  })

  it('alerta só uma vez por episódio', () => {
    const estado = marcarAlertaPersistenteEnviado(
      proximoEstadoProtecao(ligadaAutomatica(), 80, LIMITE, T0 + onzeMin),
    )
    expect(deveAlertarPersistente(estado, T0 + onzeMin + 60_000)).toBe(false)
  })
})

describe('RN04 · limite entre 40 e 90 dB', () => {
  it.each([40, 65, 90])('%i é válido', (v) => expect(limiteValido(v)).toBe(true))
  it.each([39, 91, 65.5, Number.NaN])('%s é inválido', (v) => expect(limiteValido(v)).toBe(false))
})

describe('RN05 · alerta só com responsável e consentimento', () => {
  const comResponsavel = {
    responsavelNome: 'Ana',
    responsavelContato: 'ana@exemplo.com',
    consentimentoResponsavel: true,
  }

  it('permite avisar com nome, contato e consentimento', () => {
    expect(podeAvisarResponsavel(comResponsavel)).toBe(true)
  })

  it('não permite sem consentimento', () => {
    expect(podeAvisarResponsavel({ ...comResponsavel, consentimentoResponsavel: false })).toBe(
      false,
    )
  })

  it('não permite sem contato', () => {
    expect(podeAvisarResponsavel({ ...comResponsavel, responsavelContato: '  ' })).toBe(false)
  })

  it('não permite sem perfil', () => {
    expect(podeAvisarResponsavel(null)).toBe(false)
  })

  it('exige consentimento para salvar se houver responsável', () => {
    expect(
      consentimentoResponsavelValido({ ...comResponsavel, consentimentoResponsavel: false }),
    ).toBe(false)
    expect(consentimentoResponsavelValido(perfilBase)).toBe(true)
  })
})

describe('Salvar perfil', () => {
  it('exige consentimento LGPD', () => {
    expect(podeSalvarPerfil(perfilBase)).toBe(true)
    expect(podeSalvarPerfil({ ...perfilBase, consentimentoLgpd: false })).toBe(false)
  })

  it('recusa limite fora da faixa', () => {
    expect(podeSalvarPerfil({ ...perfilBase, limiteDb: 91 })).toBe(false)
  })
})
