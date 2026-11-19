import { useTituloPagina } from '../hooks/useTituloPagina'

/**
 * Mostrada quando VITE_API_URL não está configurada.
 * Evita a tela branca e explica o que fazer.
 */
export function ConfiguracaoApiPage() {
  useTituloPagina('Configuração necessária')
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-10">
      <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">Falta só conectar o servidor</h1>
        <p className="mt-3 text-muted">
          O Hearmony guarda perfis e histórico numa API do MockAPI. O endereço dessa API ainda não
          foi informado.
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-5">
          <li>
            Copie o arquivo <code className="rounded bg-paper2 px-1.5 py-0.5">.env.example</code>{' '}
            para <code className="rounded bg-paper2 px-1.5 py-0.5">.env</code>.
          </li>
          <li>
            Preencha{' '}
            <code className="rounded bg-paper2 px-1.5 py-0.5">
              VITE_API_URL=https://seu-id.mockapi.io/api/v1
            </code>
            .
          </li>
          <li>
            Reinicie o servidor com{' '}
            <code className="rounded bg-paper2 px-1.5 py-0.5">npm run dev</code>.
          </li>
        </ol>
        <p className="mt-5 text-muted">
          Na Vercel, cadastre a mesma variável em Settings → Environment Variables e faça um novo
          deploy. O passo a passo completo está no README.
        </p>
      </div>
    </main>
  )
}
