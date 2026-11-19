import { CabecalhoPagina } from '../components/layout/CabecalhoPagina'
import { Card } from '../components/ui/Card'
import { useTituloPagina } from '../hooks/useTituloPagina'

const PASSOS = [
  {
    titulo: 'Sensor mede',
    texto: 'Um sensor vestível acompanha o volume do lugar a cada segundo.',
  },
  { titulo: 'App compara', texto: 'O app compara o volume com o seu limite de conforto.' },
  {
    titulo: 'Fone protege',
    texto: 'Passou do limite? O cancelamento de ruído do fone liga sozinho.',
  },
  {
    titulo: 'Histórico ensina',
    texto: 'Os episódios ajudam a entender quais lugares e horários pesam mais.',
  },
]

const EQUIPE = [
  { nome: 'Milena Kubo de Biaggi', rm: '572590' },
  { nome: 'Thiago Fernandes Kulesza', rm: '568922' },
  { nome: 'Felipe Ribeiro da Silva', rm: '573818' },
  { nome: 'Luiz Alberto de Carvalho Holanda Junior', rm: '573843' },
  { nome: 'Yasmim Eun Hae Kim', rm: '571494' },
]

export function SobrePage() {
  useTituloPagina('Sobre')
  return (
    <>
      <CabecalhoPagina
        titulo="Sobre o Hearmony"
        descricao="Proteção auditiva automática para pessoas com hipersensibilidade sonora em São Paulo."
      />

      <div className="space-y-6">
        <Card as="section" aria-labelledby="titulo-problema">
          <h2 id="titulo-problema" className="text-xl font-semibold">
            O problema
          </h2>
          <div className="mt-3 max-w-prose space-y-3">
            <p>
              São Paulo tem nível médio de ruído de 68,9 dB, bem acima dos 53 dB recomendados pela
              Organização Mundial da Saúde.
            </p>
            <p>
              Para pessoas autistas e com hiperacusia (no Brasil, 2,4 milhões têm diagnóstico de
              autismo, segundo o Censo 2022 do IBGE), esse barulho pode causar dor, crise e
              afastamento de lugares comuns.
            </p>
            <p>
              Quando a pessoa percebe que o som passou do ponto, muitas vezes já é tarde para se
              proteger.
            </p>
          </div>
        </Card>

        <section aria-labelledby="titulo-como">
          <h2 id="titulo-como" className="text-xl font-semibold">
            Como funciona
          </h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className="rounded-3xl border border-line bg-card p-5">
                <span
                  className="flex size-10 items-center justify-center rounded-full bg-teal font-display text-lg font-semibold text-white"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{p.titulo}</h3>
                <p className="mt-1 text-muted">{p.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <Card as="section" aria-labelledby="titulo-equipe">
          <h2 id="titulo-equipe" className="text-xl font-semibold">
            Equipe
          </h2>
          <p className="mt-1 text-muted">
            FIAP · Global Solution 2026.2 · Front-end Design e Web Development
          </p>
          <ul className="mt-4 divide-y divide-line">
            {EQUIPE.map((m) => (
              <li key={m.rm} className="flex flex-wrap justify-between gap-x-4 py-3">
                <span className="font-semibold">{m.nome}</span>
                <span className="text-muted">RM {m.rm}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card tom="destaque">
          <p className="font-semibold">Protótipo acadêmico: o sensor e o fone são simulados.</p>
          <p className="mt-1">
            No modo microfone, o volume é só uma estimativa, sem calibração, e nenhum áudio é
            gravado.
          </p>
        </Card>
      </div>
    </>
  )
}
