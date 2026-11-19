# Hearmony Web

## 1. O que é

**Hearmony liga o cancelamento de ruído do fone sozinho quando o barulho passa do limite de conforto da pessoa.** É uma CitizenTech para pessoas com hipersensibilidade auditiva em São Paulo, principalmente pessoas autistas e com hiperacusia.

São Paulo tem nível médio de ruído de **68,9 dB**, contra **53 dB** recomendados pela OMS. No Brasil, **2,4 milhões de pessoas** têm diagnóstico de autismo (IBGE, Censo 2022). Para muitas delas, o barulho da cidade causa dor e crise. E quando a pessoa percebe que o som passou do ponto, muitas vezes já é tarde para se proteger.

Nesta aplicação web:

- o **sensor sonoro vestível é simulado**. Opcionalmente, o volume pode ser **estimado pelo microfone do navegador, sem gravar áudio**;
- o **fone com cancelamento de ruído é simulado** (estado visual "cancelamento ligado");
- perfis e histórico ficam numa **API externa (MockAPI)** com CRUD completo.

> Protótipo acadêmico. Use apenas **dados fictícios**: o MockAPI é público e não tem autenticação (veja [Segurança e LGPD](#10-segurança-e-lgpd)).

---

## 2. Equipe

FIAP · Global Solution 2026.2 · **Front-end Design** e **Web Development**

| Nome                                    | RM     |
| --------------------------------------- | ------ |
| Milena Kubo de Biaggi                   | 572590 |
| Thiago Fernandes Kulesza                | 568922 |
| Felipe Ribeiro da Silva                 | 573818 |
| Luiz Alberto de Carvalho Holanda Junior | 573843 |
| Yasmim Eun Hae Kim                      | 571494 |

---

## 3. Funcionalidades

### Mapa de funcionalidades → telas

| Funcionalidade                                                           | Tela / rota                     |
| ------------------------------------------------------------------------ | ------------------------------- |
| Medidor de volume em tempo real (simulador ou microfone), faixa e limite | Início `/`                      |
| Proteção automática (RN01–RN03), Modo Calma, aviso "Proteção ativada"    | Início `/`                      |
| Alerta ao responsável (RF08 + RN05), simulado                            | Início `/` (painel de proteção) |
| Cadastro de perfil em 4 etapas (apelido, sons, limite, responsável/LGPD) | `/perfis/novo`                  |
| Listar, escolher, editar e excluir perfis (exclusão em cascata)          | `/perfis`, `/perfis/:id/editar` |
| Gráfico semanal, momento mais alto, contagem de ativações                | Histórico `/historico`          |
| Listar, filtrar, editar nota ("como me senti") e excluir registros       | Histórico `/historico`          |
| Exportar dados (JSON), atividade da conta (auditoria), excluir tudo      | Meus dados `/meus-dados`        |
| O problema, como funciona, equipe                                        | Sobre `/sobre`                  |

### CRUD na interface

| Resource    | Criar                                                  | Consultar                           | Atualizar        | Excluir                                     |
| ----------- | ------------------------------------------------------ | ----------------------------------- | ---------------- | ------------------------------------------- |
| `perfis`    | cadastro em etapas                                     | lista em Perfis, perfil ativo       | edição em etapas | Perfis e "Excluir tudo" (com cascata)       |
| `registros` | automático ao fim de cada episódio, alerta e auditoria | Histórico (com filtros), Meus dados | nota do episódio | Histórico (um registro) e cascata do perfil |

### Regras de negócio

| Regra    | Descrição                                                                                                                                                            |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RN01** | O cancelamento liga quando o ruído fica **acima do limite por 2 segundos seguidos**.                                                                                 |
| **RN02** | Picos **a partir de 85 dB** ligam o cancelamento **na hora**.                                                                                                        |
| **RN03** | O cancelamento só desliga depois de **30 s com o ruído 10 dB abaixo do limite** (histerese). Ligado pelo Modo Calma, só desliga quando a pessoa toca em "Desativar". |
| **RN04** | O limite precisa ficar **entre 40 e 90 dB** (validado no slider, no zod e no service).                                                                               |
| **RN05** | O alerta só vai para um responsável **cadastrado com consentimento**. Sem isso, o botão "Avisar meu responsável" não aparece.                                        |
| **RF08** | Alerta (simulado) quando o ruído fica acima do limite por **mais de 10 minutos** com a proteção ligada, ou quando a pessoa toca em "Avisar meu responsável".         |

Faixas de exibição: **Tranquilo** (db < limite − 5), **Atenção** (limite − 5 ≤ db < limite), **Alto** (db ≥ limite). A faixa é sempre mostrada com texto, cor e forma.

---

## 4. Stack e arquitetura

- **Vite + React 19 + TypeScript** (`strict: true`)
- **Tailwind CSS v4** (`@tailwindcss/vite`), tema em `@theme` no `src/index.css`
- **react-router-dom** (rotas), **zod** (validação de entrada e de respostas da API)
- **vitest** (141 testes unitários), **ESLint** + **Prettier**
- Sem biblioteca de componentes e sem biblioteca de gráfico: tudo feito com componentes próprios e Tailwind

### Camadas

As dependências vão numa direção só: `pages → components / hooks → services / domain`. Componentes de apresentação **nunca** chamam `fetch` nem têm regra de negócio.

```
src/
├─ domain/        REGRA DE NEGÓCIO PURA (sem React, sem fetch, tempo por parâmetro)
│  ├─ types.ts, constants.ts, rotulos.ts
│  ├─ rules.ts         RN01–RN05, RF08, classificarFaixa, proximoEstadoProtecao
│  ├─ schemas.ts       zod: formulário, nota, respostas da API
│  ├─ stats.ts         minutos por dia, momento mais alto, contagens
│  ├─ simulador.ts     leituras por cenário
│  ├─ audio.ts         RMS → dBFS → estimativa de dB
│  ├─ exportacao.ts    arquivo de portabilidade (LGPD)
│  └─ *.test.ts        testes vitest
├─ services/      ACESSO A DADOS
│  ├─ http.ts          fetch com timeout, retry/backoff, erros tipados, validação zod
│  ├─ perfisService.ts, registrosService.ts   CRUD no MockAPI
│  ├─ armazenamentoLocal.ts   id do perfil ativo (localStorage)
│  └─ download.ts      gera o JSON de exportação no navegador
├─ hooks/         ESTADO E ORQUESTRAÇÃO (custom hooks)
├─ context/       PerfilAtivo, Monitor, Toast
├─ components/    APRESENTAÇÃO (props in, eventos out)
│  ├─ layout/  ui/  monitor/  perfil/  historico/
└─ pages/         composição das telas
```

### Custom hooks

Os 4 hooks principais pedidos:

| Hook              | Responsabilidade                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `useNoiseMonitor` | Leituras de volume: simulador por cenário com "Simular pico" ou microfone (estimativa, sem gravação). Expõe `db`, `leitura`, `historicoCurto`. |
| `useProtecao`     | Aplica `proximoEstadoProtecao` a cada leitura, grava **um registro por episódio** ao desligar e dispara os alertas (RF08 + RN05).              |
| `usePerfis`       | CRUD de perfis com auditoria (`perfil_criado`, `perfil_editado`, `perfil_excluido`) e exclusão em cascata.                                     |
| `useRegistros`    | Lista com filtros, `stats` (de `domain/stats.ts`), editar nota e excluir.                                                                      |

E mais 9 hooks de apoio: `usePreferencias` (tema e tamanho do texto), `useFormularioPerfil` (etapas e validação do cadastro), `useNotaEditavel` (nota com debounce de 600 ms), `useMeusDados` (exportar e excluir tudo), `usePerfilAtivo`, `useMonitor`, `useToast` (acesso aos contextos), `useTituloPagina` e `useFocoAoNavegar` (título e foco por rota).

---

## 5. Pré-requisitos

- **Node.js 20+** e npm
- Conta gratuita no **[MockAPI](https://mockapi.io)**

---

## 6. Configurar o MockAPI passo a passo

O plano gratuito permite **1 projeto e 2 resources**. O Hearmony usa exatamente 2.

1. Entre em [mockapi.io](https://mockapi.io) e crie um **projeto** (ex.: `hearmony`). Deixe o _API prefix_ como `/api/v1`.
2. Crie o resource **`perfis`**. Apague os campos de exemplo (`name`, `avatar`, `createdAt`) e deixe só o `id`. Os demais campos são criados pelo próprio app ao salvar, mas, se quiser documentar o schema, eles são:

   | campo                      | tipo no MockAPI |
   | -------------------------- | --------------- |
   | `apelido`                  | String          |
   | `sonsGatilho`              | Array           |
   | `limiteDb`                 | Number          |
   | `responsavelNome`          | String          |
   | `responsavelContato`       | String          |
   | `consentimentoResponsavel` | Boolean         |
   | `consentimentoLgpd`        | Boolean         |
   | `criadoEm`                 | String          |
   | `atualizadoEm`             | String          |

3. Crie o resource **`registros`**, também só com o `id`:

   | campo        | tipo no MockAPI | observação                                                 |
   | ------------ | --------------- | ---------------------------------------------------------- |
   | `perfilId`   | String          | id do perfil dono do registro                              |
   | `categoria`  | String          | `exposicao`, `alerta` ou `auditoria`                       |
   | `inicio`     | String          | data ISO                                                   |
   | `fim`        | String          | data ISO (só em `exposicao`)                               |
   | `duracaoSeg` | Number          |                                                            |
   | `picoDb`     | Number          |                                                            |
   | `gatilho`    | String          | `automatico`, `pico`, `modo_calma`, `ajuda`, `persistente` |
   | `cenario`    | String          | cenário do simulador ou `microfone`                        |
   | `nota`       | String          | até 280 caracteres                                         |
   | `acao`       | String          | só em `auditoria`                                          |

4. **Não gere dados falsos**: deixe os dois resources vazios. Registros com formato diferente do esperado são descartados pela validação do app, e aparece um aviso na tela.
5. Copie a URL base do projeto (algo como `https://<id>.mockapi.io/api/v1`) e coloque no `.env` (próxima seção).

> O app já trata duas particularidades do MockAPI: o filtro por query string é por "contém" (`perfilId=1` também traz o perfil `10`), por isso o service refiltra com igualdade exata; e um filtro sem resultado responde 404, que o service trata como lista vazia.

---

## 7. Instalação e execução

```bash
npm install
cp .env.example .env      # depois edite e preencha VITE_API_URL
npm run dev               # http://localhost:5173
```

| Comando           | O que faz                                        |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | servidor de desenvolvimento                      |
| `npm run build`   | checagem de tipos (`tsc -b`) e build de produção |
| `npm run preview` | serve o build localmente                         |
| `npm test`        | testes unitários (vitest)                        |
| `npm run lint`    | ESLint                                           |
| `npm run format`  | Prettier                                         |

Sem `VITE_API_URL`, o app mostra uma tela explicando como configurar, em vez de uma tela branca.

O **modo microfone** só funciona em `https://` ou `http://localhost` (exigência dos navegadores). Abrindo pelo IP da rede local, o app volta ao simulador com uma mensagem.

---

## 8. Deploy na Vercel

1. Importe o repositório na [Vercel](https://vercel.com). O preset **Vite** é detectado automaticamente (build `npm run build`, saída `dist`).
2. Em **Settings → Environment Variables**, crie `VITE_API_URL` com a URL do MockAPI.
3. Faça o deploy. Se a variável for criada depois, faça um **Redeploy**: variáveis `VITE_` entram no build.

O `vercel.json` faz o rewrite da SPA (rotas como `/historico` funcionam ao recarregar) e define cabeçalhos de segurança: CSP liberando só o próprio site, Google Fonts e `*.mockapi.io`; `Permissions-Policy` com o microfone só para o próprio site; `X-Frame-Options`; `nosniff`. Se trocar de API, ajuste o `connect-src` da CSP.

**Link do deploy:** `<preencher>`

---

## 9. Como gerar o ZIP

```bash
git archive -o hearmony-web.zip HEAD
```

O ZIP inclui só o que está versionado: sem `node_modules`, sem `dist` e sem `.env`.

---

## 10. Segurança e LGPD

### O que está protegido nesta versão

- **Minimização**: só apelido, nunca nome completo, CPF, endereço ou dado de saúde detalhado. O perfil sensorial (sons e limite) é tratado como **dado sensível** (LGPD, art. 5º, II e art. 11).
- **Consentimento explícito**: `consentimentoLgpd` é obrigatório para salvar, e o consentimento do responsável é separado (RN05).
- **Nunca gravar áudio** (RNF05): no modo microfone, um `AnalyserNode` lê o nível do sinal num buffer reaproveitado em memória. Não há `MediaRecorder`, nenhuma amostra é guardada, nada é enviado e nenhum som é reproduzido. As tracks são paradas ao sair do modo.
- **Direitos do titular** em "Meus dados": **exportar** (portabilidade, art. 18, V) e **excluir tudo** (eliminação, art. 18, VI).
- **Audit log**: criação, edição, exportação e exclusão de perfil viram registros `auditoria`. A exclusão total registra antes de apagar e depois remove tudo, inclusive a auditoria do perfil.
- **Validação de entrada**: zod no formulário **e** de novo no service antes de cada envio; trim e limite de tamanho em todos os textos. Nenhum `dangerouslySetInnerHTML`: uma regra do ESLint proíbe o uso.
- **Validação de saída**: toda resposta da API passa por zod. Itens inesperados são descartados com aviso amigável, e a tela não quebra.
- **Rate limiting no cliente**:
  - um registro por episódio, nunca por leitura
  - botões de salvar e excluir bloqueados durante a requisição (sem envio duplo)
  - debounce de 600 ms na nota
  - backoff exponencial (500 ms, 1 s, 2 s) em GET com falha e em 429
  - exclusão em cascata sequencial
- **Segredos**: `VITE_API_URL` fica no `.env`, fora do Git. Só o `.env.example` é versionado.
- **Cabeçalhos HTTP** de segurança no deploy (veja a seção 8).

### Limitações declaradas do protótipo

- **O MockAPI é público, sem autenticação e sem controle de acesso por usuário.** Quem tiver a URL lê e altera tudo. Por isso, **use só dados fictícios** na demonstração.
- A URL da API vai para o bundle do front-end. Variáveis `VITE_` não são segredo de verdade; o `.env` fora do Git só evita expor a URL no repositório.
- Sem backend não há atomicidade: se a auditoria falhar, a ação principal segue mesmo assim, e a exclusão em cascata pode ficar pela metade se a rede cair no meio.
- O alerta ao responsável é **simulado**: grava um registro e mostra um aviso, sem enviar mensagem real.

### Evolução para produção

Backend próprio ou **Supabase** com autenticação, **RLS (Row Level Security) por usuário**, criptografia em repouso dos campos sensíveis, rate limiting no servidor, audit log imutável (append-only) e envio real de alerta por um serviço com consentimento registrado. Webhooks não se aplicam nesta versão.

---

## 11. Acessibilidade

Meta: **WCAG 2.1 AA**. O público é PcD.

- **Contraste**: todos os pares de texto do tema medidos por fórmula (o menor é 4,76:1). Bordas de controles com ≥ 3:1.
- **Foco visível** de 3 px em todo elemento interativo. A cada troca de rota, o foco vai para o título da página.
- **Teclado**: tudo operável. O modal prende o foco, fecha com `Esc` e devolve o foco a quem o abriu. Há link "Pular para o conteúdo".
- **Anúncios** com `aria-live="polite"`, nunca `assertive`: mudança de faixa, proteção ligada e desligada, avisos.
- **Interface sensorialmente segura (RNF03)**: nenhum som, nenhum flash, nada piscando. A respiração guiada tem ciclo de 10 s, e todas as animações param com `prefers-reduced-motion`.
- **Nunca só cor**: faixas com texto e forma; seleção com ✓; página atual sublinhada.
- **Conforto visual** (botão "Ajustes" no topo): tela **Suave** (escura, com menos brilho) ou **Clara**, ou igual ao aparelho; **tamanho do texto** Normal, Grande ou Maior. A escolha fica salva só neste navegador. Os dois temas foram medidos (texto ≥ 4,5:1) e auditados com axe.
- **Alvos de toque** ≥ 44 px, **textos** ≥ 16 px, HTML semântico, `lang="pt-BR"` e título por rota.
- **Tom de voz** calmo e direto, sem exclamação e sem culpar a pessoa ("Não conseguimos falar com o servidor. Vamos tentar de novo?").

---

## 12. Links

- Repositório: `<preencher com o link do GitHub>`
- Uso de IA no projeto: [AI.md](./AI.md)
