# Uso de Inteligência Artificial no projeto

Este documento registra como a equipe do Hearmony usou IA no desenvolvimento da aplicação web (GS 2026.2 · FIAP · Front-end Design e Web Development).

---

## 1. Ferramentas utilizadas

| Ferramenta                            | Finalidade                                                                                                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude** (chat)                     | Apoio no planejamento: organizar os requisitos e as regras de negócio (RN01–RN05) que a equipe definiu na entrega de Software & Total Experience Design.                                |
| **Claude Code** (extensão do VS Code) | Assistente de programação: a partir das especificações da equipe, ajudou a corrigir código, criar testes, rodar as checagens (build, lint, testes) e revisar a documentação. |

**Como o trabalho foi dividido:** a equipe dividiu o desenvolvimento em **21 etapas**. Em cada uma, pediu ao assistente o que precisava, revisou o resultado, testou e fez o commit manualmente. A IA não fez nenhum commit nem push: as decisões e o controle do repositório ficaram com a equipe.

## 2. Interações realizadas

### Como a equipe usou a IA

A equipe definiu o que construir (problema, público, regras de negócio, telas do protótipo, requisitos de acessibilidade e de LGPD) e usou a IA como assistente durante o desenvolvimento.

### Exemplos representativos

1. **Ferramenta de lint diferente da esperada (etapas 1 e 2).**
   _Pedido da equipe:_ criar o projeto com o template do Vite e configurar o ESLint.
   _O que aconteceu:_ o template atual veio com **oxlint** e **TypeScript 7**, e o `typescript-eslint` só suporta TypeScript até a 6.0.
   _Como a IA ajudou:_ explicou o conflito e sugeriu fixar o TypeScript em `~6.0`. A equipe aceitou, e o desvio ficou registrado.

2. **Particularidades do MockAPI tratadas no cliente HTTP (etapas 6 e 7).**
   _Pedido da equipe:_ criar o cliente HTTP com timeout, retry e erros tipados, e os services de CRUD.
   _Como a IA ajudou:_ alertou que o MockAPI responde **404** a um filtro sem resultado (agora vira lista vazia) e que o filtro por query string é por **"contém"** (`perfilId=1` também traz o perfil 10). O service refiltra com igualdade exata, para que excluir um perfil nunca apague o histórico de outro. Os dois casos têm testes.

3. **Teste no navegador encontrou bugs que os testes unitários não pegavam (depois da etapa 21).**
   _Pedido da equipe:_ "pode acessar o navegador e testar".
   _Como a IA ajudou:_ controlou o Chrome com Playwright, com uma API falsa que imita o MockAPI, e rodou 62 verificações com auditoria axe-core. Apontou e corrigiu o foco movido indevidamente ao abrir a página (efeito do StrictMode), páginas sem h1 e problemas visuais vistos nas screenshots.

4. **Validação do responsável a partir de um print da equipe.**
   _Pedido da equipe:_ "o nome não pode ser números e o número ou é direto formatado para telefone ou em e-mail".
   _Como a IA ajudou:_ implementou as regras que a equipe descreveu, com testes: o nome aceita só letras; o contato vira telefone formatado `(11) 98765-4321` (com DDD válido no Brasil) ou e-mail, conforme o que a pessoa digita; e o erro aparece ao sair do campo.

5. **Pedido que esbarrava num requisito: o círculo de respiração parado.**
   _Pergunta da equipe:_ "o círculo não deveria se mexer para simular uma respiração?"
   _Como a IA ajudou:_ mediu no Chrome e mostrou que a animação funcionava, mas ficava parada porque o Windows da equipe pedia "movimento reduzido", e o app respeita isso (RNF03). Sugeriu, e a equipe aprovou, uma opção "Movimento" em Ajustes e uma respiração guiada por texto para quem prefere tela sem movimento.


## 3. Aplicação no projeto

A IA auxiliou a equipe na escrita e na correção dos arquivos abaixo, sempre a partir das especificações da equipe, que revisou, testou e aprovou cada parte antes do commit.

| Camada                    | Arquivos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configuração              | `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.prettierrc.json`, `.env.example`, `.gitignore`, `.vercelignore`, `index.html`, `vercel.json`                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Domínio                   | `types.ts`, `constants.ts`, `rules.ts`, `schemas.ts`, `stats.ts`, `simulador.ts`, `audio.ts`, `contato.ts`, `exportacao.ts`, `rotulos.ts` e os testes `*.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Services                  | `http.ts`, `perfisService.ts`, `registrosService.ts`, `armazenamentoLocal.ts`, `preferencias.ts`, `download.ts` e os testes `http.test.ts` e `services.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Hooks (14)                | `useNoiseMonitor`, `useProtecao`, `usePerfis`, `useRegistros`, `useFormularioPerfil`, `useNotaEditavel`, `useMeusDados`, `useMicrofones`, `usePreferencias`, `usePerfilAtivo`, `useMonitor`, `useToast`, `useTituloPagina`, `useFocoAoNavegar`                                                                                                                                                                                                                                                                                                                                            |
| Contextos                 | `PerfilAtivoContext.tsx`, `MonitorContext.tsx`, `perfilAtivo.ts`, `monitor.ts`, `toastContext.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Componentes (39 arquivos) | **ui (13)**: Button, Card, Modal, ConfirmDialog, Toast, Field, Input/TextArea, Checkbox, GrupoOpcoes, Spinner, EmptyState, AvisoErro, Icone · **layout (7)**: Layout, Header, NavBar, CabecalhoPagina, CarregandoPagina, AnuncioProtecao, AjustesVisuais · **monitor (9)**: DecibelGauge, FaixaBadge, GraficoAoVivo, BotaoModoCalma, SeletorCenario, SeletorFonte, StatusBadge, AvisoProtecao, GuiaRespiracao · **perfil (5)**: FormPerfil, StepIndicator, ChipsSons, SliderLimite, CardPerfil · **historico (5)**: GraficoSemana, ListaRegistros, ItemRegistro, FiltroGatilho, ModalNota |
| Páginas (8)               | Início, Perfis, PerfilForm (criar e editar), Histórico, Meus dados, Sobre, 404, Configuração da API                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Documentação              | `README.md`, `AI.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

---

## 4. Validação das respostas

### Checagens automáticas, a cada etapa

- **`npm run build`** (TypeScript strict + build do Vite): sem erros ao fim de todas as etapas.
- **`npm run lint`** (ESLint com typescript-eslint e react-hooks): sem erros nem avisos. Quando o lint acusou um problema (etapa 14), ele foi corrigido antes de a etapa ser entregue.
- **`npm run format:check`** (Prettier): todos os arquivos formatados.
- **`npm test`**: **155 testes em 9 arquivos**, todos passando. Eles cobrem:

| Arquivo              | O que cobre                                                                                                                                                                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rules.test.ts`      | RN01 (1 s não liga, 2 s liga, contagem zera), RN02 (85 dB liga na hora), RN03 (29 s não desliga, 30 s desliga, queda de só 5 dB não desliga), RN04 (39, 91, 65,5 e NaN inválidos), RN05, Modo Calma não desliga sozinho, montagem do episódio, RF08 (> 10 min, uma vez por episódio), faixas |
| `schemas.test.ts`    | formulário de perfil (trim, LGPD, responsável e consentimento, sons válidos), contato, nota de 280 caracteres, respostas da API com campos ausentes, descarte de itens inválidos                                                                                                             |
| `stats.test.ts`      | 7 dias com zeros, soma por dia só de episódios automáticos ou por pico, momento mais alto, contagem de ativações e Modo Calma, formatação de duração                                                                                                                                         |
| `http.test.ts`       | URL e query string, validação da resposta, 404 como lista vazia, retry com backoff em 5xx, rede e 429, sem retry de POST em 5xx, timeout de 8 s, cancelamento                                                                                                                                |
| `services.test.ts`   | dados limpos antes do envio, RN04 e LGPD barrados sem chamar a API, filtro exato contra o "contém" do MockAPI, exclusão em cascata na ordem certa e tolerante a 404, nota                                                                                                                    |
| `simulador.test.ts`  | média de cada cenário, leituras inteiras e na faixa, picos ocasionais, transição suave                                                                                                                                                                                                       |
| `audio.test.ts`      | RMS de silêncio, sinal cheio e senoide; dBFS + 94; limites 30–110                                                                                                                                                                                                                            |
| `exportacao.test.ts` | conteúdo e ordem do arquivo exportado, nome de arquivo seguro                                                                                                                                                                                                                                |
| `contato.test.ts`    | nome só com letras, máscara de telefone enquanto digita, troca para e-mail, DDDs válidos, celular com 9 e fixo com 2–5, mensagens por tipo                                                                                                                                                   |

- **Buscas no código**: nenhum `fetch(` em `components/` ou `pages/`; nenhum `MediaRecorder` (só um comentário que proíbe o uso); nenhum `aria-live="assertive"`; `.env` fora do Git.
- **Acessibilidade**: script de contraste WCAG em 24 pares de cor (todos ≥ 4,5:1) e auditoria única com `eslint-plugin-jsx-a11y` no modo estrito.

### Teste de ponta a ponta no navegador (pedido pela equipe)

Depois da etapa 21, a equipe pediu um teste do app no navegador. Com o Claude Code, foi controlado o **Google Chrome em modo headless (Playwright)**, com o app rodando em `npm run dev` e ligado a uma **API falsa local que imita o MockAPI**, inclusive o filtro por "contém" e o 404 em filtro vazio. O roteiro e a API falsa ficaram fora do repositório. Resultado final: **62 de 62 verificações passando, sem erros nem avisos no console**. Elas cobrem:

- **Cadastro:** erros por etapa, foco no campo inválido e no título da etapa, slider por teclado, voltar sem perder dados e perfil gravado com dados limpos e auditoria.
- **Proteção, com tempo real:** RN02 ("Simular pico" liga na hora); RN01 (na Obra, ligou em ~5 s); RN03 (na Biblioteca, desligou sozinha depois de 32,9 s); Modo Calma não desliga sozinho; um registro por episódio (3 episódios, 3 registros).
- **Alerta e RN05:** "Avisar meu responsável" aparece só com consentimento, mostra o toast "Avisamos Ana." e grava o alerta. Sem responsável, o botão não aparece.
- **Histórico:** cards da semana, filtro, nota com debounce (0 PUT enquanto digita, 1 PUT depois de parar) e exclusão com confirmação.
- **Perfis e Meus dados:** edição auditada, exportação do JSON, atividade da conta e "Excluir tudo" em cascata, sem apagar o registro de outro perfil com id parecido.
- **Microfone:** com o dispositivo falso do Chrome, exige consentimento, mostra a estimativa e "não calibrada", não cria áudio e, com a permissão negada, volta ao simulador com mensagem calma.
- **Acessibilidade:** **axe-core (WCAG 2.1 AA) sem violações** em 8 telas e estados. Também passaram o primeiro Tab no "Pular para o conteúdo", o foco no h1 ao trocar de rota, o modal com foco preso, `Esc` e devolução do foco, e o movimento reduzido.
- **Celular (390 px):** sem rolagem horizontal, nenhum texto visível abaixo de 16 px e nenhum alvo de toque abaixo de 44 px.

**Problemas que o teste encontrou, já corrigidos:**

1. **Foco fora do lugar.** No StrictMode, o efeito que move o foco a cada troca de rota rodava duas vezes e já movia o foco ao abrir a página. A solução foi comparar com a rota (ou etapa) anterior.
2. **Página sem h1.** O Início sem perfil e as telas de carregamento não tinham h1. A solução foi o componente `CarregandoPagina`, mais um h1 nos estados vazios.
3. **Ajustes visuais nas screenshots:** cenários cortados no painel lateral, avisos cobrindo o topo da tela no desktop e ícones desalinhados na barra inferior do celular.

### Conforto visual (melhoria pedida pela equipe)

A equipe pediu um modo de tela suave e ajuste de tamanho do texto. A paleta escura foi medida por fórmula (24 pares de texto ≥ 4,5:1; bordas ≥ 3:1) e testada no Chrome: **18 de 18 verificações**, com **axe sem violações no tema suave** em 8 telas, a preferência mantida ao recarregar, o modo escuro do sistema respeitado e nenhuma rolagem lateral com o texto "Maior" em 390 px. As screenshots mostraram dois ajustes, já feitos: o trilho do medidor quase invisível no escuro e o modal maior que a tela com o texto "Maior".

### Site publicado

O deploy na Vercel (https://hearmony-web.vercel.app) também foi verificado no Chrome: **10 de 10 verificações**. Elas cobrem os cabeçalhos de segurança e a CSP sem bloqueios, as fontes, a variável `VITE_API_URL` no build, recarregar em `/historico` e um perfil fictício criado e apagado no MockAPI real. A experiência com leitor de tela e com microfone físico ficou com a validação manual da equipe, abaixo.

### Validação manual da equipe

<!-- equipe: marcar [x] e anotar quem testou, quando e em qual navegador/aparelho -->

- [x] MockAPI criado e `.env` configurado; sem `.env` aparece a tela de configuração
- [x] Cadastro em 4 etapas: validações, voltar sem perder dados, salvar
- [x] Perfis: listar, escolher perfil ativo, editar, excluir (o histórico some junto)
- [x] Simulador: troca de cenário, "Simular pico" liga a proteção na hora (RN02)
- [x] Proteção automática liga em ~2 s acima do limite (RN01) e desliga após 30 s de calma (RN03)
- [x] Modo Calma só desliga em "Desativar"
- [x] Episódio aparece no Histórico; editar nota (salva sozinha); excluir registro
- [x] "Avisar meu responsável" só aparece com responsável e consentimento (RN05); toast "Avisamos…"
- [x] Meus dados: exportar JSON, atividade da conta, excluir tudo
- [x] Modo microfone: consentimento, permissão concedida e negada (volta ao simulador)
- [x] Só teclado: navegar, abrir e fechar modais com Esc, foco visível
- [x] Leitor de tela (NVDA / VoiceOver / TalkBack): títulos, anúncios de faixa e de proteção
- [x] `prefers-reduced-motion` ligado: nada se move
- [x] Celular e desktop (layout de 2 colunas a partir de `lg`)
- [x] Deploy na Vercel com `VITE_API_URL`; recarregar em `/historico` funciona

---

## 5. Análise crítica

### Benefícios

- **Velocidade com controle:** dividir o trabalho em etapas, com build, lint e testes em cada uma, permitiu à equipe avançar rápido sem perder o controle do que entrava no projeto.
- **Separação de responsabilidades:** as regras de negócio ficaram como funções puras e testáveis, então RN01–RN05 puderam ser conferidas por testes, e não só pela interface.
- **Um segundo olhar técnico:** a IA ajudou a enxergar detalhes que poderiam passar batido:
  - as particularidades do MockAPI
  - a regra de 3:1 para bordas de controles
  - não repetir um POST em erro 5xx
  - os bugs de foco que só apareceram no teste no navegador

### Limitações

- **A IA apoia, mas não substitui pessoas:** leitor de tela de verdade, microfone físico e a experiência real de uso dependem da validação da equipe.
- **Versões novas de ferramentas** (TypeScript 7, ESLint 10) geraram conflitos que exigiram ajustes.
- **Risco de confiar demais:** sugestões que parecem certas precisam ser conferidas. Sem a revisão da equipe em cada etapa, decisões de produto (como a RN02 valer mesmo para limite 90, ou a RN01 religar depois de um "Desativar" manual) poderiam passar sem discussão.

