import { useCallback, useState } from 'react'
import { LIMITE_PADRAO_DB, type SomId } from '../domain/constants'
import {
  ApelidoSchema,
  LimiteSchema,
  PerfilInputSchema,
  SonsGatilhoSchema,
  errosPorCampo,
} from '../domain/schemas'
import type { Perfil, PerfilInput } from '../domain/types'

export const TOTAL_ETAPAS = 4
export type Etapa = 1 | 2 | 3 | 4

/** Valores como a pessoa digita (strings vazias em vez de null). */
export interface ValoresFormPerfil {
  apelido: string
  sonsGatilho: SomId[]
  limiteDb: number
  responsavelNome: string
  responsavelContato: string
  consentimentoResponsavel: boolean
  consentimentoLgpd: boolean
}

export type CampoFormPerfil = keyof ValoresFormPerfil
export type ErrosFormPerfil = Partial<Record<CampoFormPerfil, string>>

const ETAPA_DO_CAMPO: Record<CampoFormPerfil, Etapa> = {
  apelido: 1,
  sonsGatilho: 2,
  limiteDb: 3,
  responsavelNome: 4,
  responsavelContato: 4,
  consentimentoResponsavel: 4,
  consentimentoLgpd: 4,
}

export function valoresIniciais(perfil?: Perfil | null): ValoresFormPerfil {
  return {
    apelido: perfil?.apelido ?? '',
    sonsGatilho: perfil?.sonsGatilho ?? [],
    limiteDb: perfil?.limiteDb ?? LIMITE_PADRAO_DB,
    responsavelNome: perfil?.responsavelNome ?? '',
    responsavelContato: perfil?.responsavelContato ?? '',
    consentimentoResponsavel: perfil?.consentimentoResponsavel ?? false,
    consentimentoLgpd: perfil?.consentimentoLgpd ?? false,
  }
}

function primeiroErro(r: { success: boolean; error?: { issues: { message: string }[] } }) {
  return r.success ? undefined : r.error?.issues[0]?.message
}

/** Valida só os campos da etapa atual. */
function validarEtapa(etapa: Etapa, v: ValoresFormPerfil): ErrosFormPerfil {
  switch (etapa) {
    case 1: {
      const erro = primeiroErro(ApelidoSchema.safeParse(v.apelido))
      return erro ? { apelido: erro } : {}
    }
    case 2: {
      const erro = primeiroErro(SonsGatilhoSchema.safeParse(v.sonsGatilho))
      return erro ? { sonsGatilho: erro } : {}
    }
    case 3: {
      const erro = primeiroErro(LimiteSchema.safeParse(v.limiteDb))
      return erro ? { limiteDb: erro } : {}
    }
    case 4: {
      const r = PerfilInputSchema.safeParse(v)
      if (r.success) return {}
      const todos = errosPorCampo(r.error) as ErrosFormPerfil
      return Object.fromEntries(
        Object.entries(todos).filter(([campo]) => ETAPA_DO_CAMPO[campo as CampoFormPerfil] === 4),
      )
    }
  }
}

/**
 * Estado e validação do cadastro em etapas.
 * Os valores ficam guardados ao voltar etapas; nada se perde.
 */
export function useFormularioPerfil(perfil?: Perfil | null) {
  const [valores, setValores] = useState<ValoresFormPerfil>(() => valoresIniciais(perfil))
  const [etapa, setEtapa] = useState<Etapa>(1)
  const [erros, setErros] = useState<ErrosFormPerfil>({})

  const alterar = useCallback(
    <C extends CampoFormPerfil>(campo: C, valor: ValoresFormPerfil[C]) => {
      setValores((atual) => ({ ...atual, [campo]: valor }))
      setErros((atual) => {
        if (!(campo in atual)) return atual
        const resto = { ...atual }
        delete resto[campo]
        return resto
      })
    },
    [],
  )

  /**
   * Valida um campo quando a pessoa sai dele (sem esperar o "Salvar").
   * Só mostra erro de campo já preenchido, para não reclamar do que ainda nem foi digitado.
   */
  const validarCampo = useCallback(
    (campo: CampoFormPerfil) => {
      const valor = valores[campo]
      if (typeof valor === 'string' && valor.trim() === '') return
      const erro = validarEtapa(ETAPA_DO_CAMPO[campo], valores)[campo]
      setErros((atual) => {
        if (erro) return { ...atual, [campo]: erro }
        if (!(campo in atual)) return atual
        const resto = { ...atual }
        delete resto[campo]
        return resto
      })
    },
    [valores],
  )

  /** Valida a etapa atual; se estiver tudo certo, avança. Devolve se avançou. */
  const avancar = useCallback((): boolean => {
    const novos = validarEtapa(etapa, valores)
    setErros(novos)
    if (Object.keys(novos).length > 0) return false
    setEtapa((e) => (e < TOTAL_ETAPAS ? ((e + 1) as Etapa) : e))
    return true
  }, [etapa, valores])

  const voltar = useCallback(() => {
    setErros({})
    setEtapa((e) => (e > 1 ? ((e - 1) as Etapa) : e))
  }, [])

  /**
   * Valida tudo e devolve os dados prontos para a API (com trim e "" → null).
   * Se algum erro for de uma etapa anterior, volta para ela.
   */
  const concluir = useCallback((): PerfilInput | null => {
    const r = PerfilInputSchema.safeParse(valores)
    if (r.success) {
      setErros({})
      return r.data
    }
    const todos = errosPorCampo(r.error) as ErrosFormPerfil
    const etapaComErro = Math.min(
      ...Object.keys(todos).map((c) => ETAPA_DO_CAMPO[c as CampoFormPerfil] ?? 4),
    ) as Etapa
    setEtapa(etapaComErro)
    setErros(
      Object.fromEntries(
        Object.entries(todos).filter(
          ([c]) => ETAPA_DO_CAMPO[c as CampoFormPerfil] === etapaComErro,
        ),
      ),
    )
    return null
  }, [valores])

  return { valores, etapa, erros, alterar, validarCampo, avancar, voltar, concluir }
}
