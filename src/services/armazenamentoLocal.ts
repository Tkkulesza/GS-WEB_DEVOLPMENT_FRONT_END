/**
 * Acesso ao localStorage. Guarda só preferências do navegador
 * (qual perfil está ativo), nunca dados pessoais.
 * Tudo em try/catch: o armazenamento pode estar bloqueado (aba anônima, política do navegador).
 */
const PREFIXO = 'hearmony:'

export function lerPreferencia(chave: string): string | null {
  try {
    return window.localStorage.getItem(PREFIXO + chave)
  } catch {
    return null
  }
}

export function salvarPreferencia(chave: string, valor: string | null): void {
  try {
    if (valor === null) window.localStorage.removeItem(PREFIXO + chave)
    else window.localStorage.setItem(PREFIXO + chave, valor)
  } catch {
    // Sem armazenamento: o app continua funcionando, só não lembra a escolha.
  }
}
