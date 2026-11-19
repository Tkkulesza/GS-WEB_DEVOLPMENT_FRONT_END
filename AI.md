# Uso de Inteligência Artificial no projeto

Este documento registra como a equipe do Hearmony usou IA no desenvolvimento da aplicação web (GS 2026.2 · FIAP · Front-end Design e Web Development).

---

## 1. Ferramentas utilizadas

| Ferramenta        | Finalidade                                                                                                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude** (chat) | Planejamento: levantamento de requisitos, regras de negócio (RN01–RN05), apoio ao protótipo de média fidelidade da entrega de Software & Total Experience Design e redação do prompt de desenvolvimento usado no Claude Code. |

**Como o trabalho foi dividido:** o prompt dividiu o projeto em **21 fases**. Ao fim de cada fase, o Claude Code parava e mostrava um resumo com as checagens. **A equipe revisou o resultado de cada fase e fez o commit manualmente**, com a mensagem planejada. O Claude Code não executou nenhum `git add`, `git commit` nem `git push`. Por isso o histórico do Git tem um commit por fase.

## 3. Aplicação no projeto

Partes do código-fonte e a documentação desta entrega foram criados/modificados por IA (claude) e revisados pela equipe a cada fase.

| Camada                    | Arquivos                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configuração              | `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.prettierrc.json`, `.env.example`, `.gitignore`, `index.html`, `vercel.json`                                                                                                                                                                                                                                                                                                                                  |
| Domínio                   | `types.ts`, `constants.ts`, `rules.ts`, `schemas.ts`, `stats.ts`, `simulador.ts`, `audio.ts`, `exportacao.ts`, `rotulos.ts` e os testes `*.test.ts`                                                                                                                                                                                                                                                                                                                                    |
| Services                  | `http.ts`, `perfisService.ts`, `registrosService.ts`, `armazenamentoLocal.ts`, `download.ts` e os testes `http.test.ts` e `services.test.ts`                                                                                                                                                                                                                                                                                                                                           |
| Hooks (13)                | `useNoiseMonitor`, `useProtecao`, `usePerfis`, `useRegistros`, `useFormularioPerfil`, `useNotaEditavel`, `useMeusDados`, `usePerfilAtivo`, `useMonitor`, `useToast`, `useTituloPagina`, `useFocoAoNavegar`, `usePreferencias`                                                                                                                                                                                                                                                          |
| Contextos                 | `PerfilAtivoContext.tsx`, `MonitorContext.tsx`, `perfilAtivo.ts`, `monitor.ts`, `toastContext.ts`                                                                                                                                                                                                                                                                                                                                                                                      |
| Componentes (34 arquivos) | **ui**: Button, Card, Modal, ConfirmDialog, Toast, Field, Input/TextArea, Checkbox, Spinner, EmptyState, AvisoErro, Icone · **layout**: Layout, Header, NavBar, CabecalhoPagina, AnuncioProtecao · **monitor**: DecibelGauge, FaixaBadge, BotaoModoCalma, SeletorCenario, SeletorFonte, StatusBadge, AvisoProtecao · **perfil**: FormPerfil, StepIndicator, ChipsSons, SliderLimite, CardPerfil · **historico**: GraficoSemana, ListaRegistros, ItemRegistro, FiltroGatilho, ModalNota |
| Páginas                   | Início, Perfis, PerfilForm (criar e editar), Histórico, Meus dados, Sobre, 404, Configuração da API                                                                                                                                                                                                                                                                                                                                                                                    |
| Documentação              | `README.md`, `AI.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

---

## 4. Validação das respostas

### O que foi verificado nesta sessão (automaticamente, a cada fase)

- **`npm run build`** (TypeScript strict + build do Vite): sem erros ao fim de todas as fases.
- **`npm run lint`** (ESLint com typescript-eslint e react-hooks): sem erros nem avisos. Quando o lint acusou um problema (fase 14), ele foi corrigido antes de a fase ser entregue.
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

### Teste de ponta a ponta no navegador (feito pela IA, a pedido da equipe)

Depois da fase 21, a equipe pediu para testar o app no navegador. O Claude Code controlou o **Google Chrome em modo headless (Playwright)**, com o app rodando em `npm run dev` e ligado a uma **API falsa local que imita o MockAPI**, inclusive o filtro por "contém" e o 404 em filtro vazio. O roteiro e a API falsa ficaram fora do repositório. Resultado final: **62 de 62 verificações passando, sem erros nem avisos no console**. Elas cobrem:

- **Cadastro:** erros por etapa, foco no campo inválido e no título da etapa, slider por teclado, voltar sem perder dados e perfil gravado com dados limpos e auditoria.
- **Proteção, com tempo real:** RN02 ("Simular pico" liga na hora); RN01 (na Obra, ligou em ~5 s); RN03 (na Biblioteca, desligou sozinha depois de 32,9 s); Modo Calma não desliga sozinho; um registro por episódio (3 episódios, 3 registros).
- **Alerta e RN05:** "Avisar meu responsável" aparece só com consentimento, mostra o toast "Avisamos Ana." e grava o alerta. Sem responsável, o botão não aparece.
- **Histórico:** cards da semana, filtro, nota com debounce (0 PUT enquanto digita, 1 PUT depois de parar) e exclusão com confirmação.
- **Perfis e Meus dados:** edição auditada, exportação do JSON, atividade da conta e "Excluir tudo" em cascata, sem apagar o registro de outro perfil com id parecido.
- **Microfone:** com o dispositivo falso do Chrome, exige consentimento, mostra a estimativa e "não calibrada", não cria áudio e, com a permissão negada, volta ao simulador com mensagem calma.
- **Acessibilidade:** **axe-core (WCAG 2.1 AA) sem violações** em 8 telas e estados. Também passaram o primeiro Tab no "Pular para o conteúdo", o foco no h1 ao trocar de rota, o modal com foco preso, `Esc` e devolução do foco, e o movimento reduzido.
- **Celular (390 px):** sem rolagem horizontal, nenhum texto visível abaixo de 16 px e nenhum alvo de toque abaixo de 44 px.

**O teste encontrou e a IA corrigiu:**

1. **Foco fora do lugar.** No StrictMode, o efeito que move o foco a cada troca de rota rodava duas vezes e já movia o foco ao abrir a página. A solução foi comparar com a rota (ou etapa) anterior.
2. **Página sem h1.** O Início sem perfil e as telas de carregamento não tinham h1. A solução foi o componente `CarregandoPagina`, mais um h1 nos estados vazios.
3. **Ajustes visuais nas screenshots:** cenários cortados no painel lateral, avisos cobrindo o topo da tela no desktop e ícones desalinhados na barra inferior do celular.

### Conforto visual (melhoria pedida depois da entrega base)

A equipe pediu um modo de tela suave e ajuste de tamanho do texto. A paleta escura foi medida por fórmula (24 pares de texto ≥ 4,5:1; bordas ≥ 3:1) e testada no Chrome: **18 de 18 verificações**, com **axe sem violações no tema suave** em 8 telas, a preferência mantida ao recarregar, o modo escuro do sistema respeitado e nenhuma rolagem lateral com o texto "Maior" em 390 px. As screenshots mostraram dois ajustes, já feitos: o trilho do medidor quase invisível no escuro e o modal maior que a tela com o texto "Maior".

### O que continua sem verificação da IA

As chamadas ao **MockAPI real da equipe**, o uso com **leitor de tela de verdade** (NVDA, VoiceOver, TalkBack), um **microfone físico** e o **deploy na Vercel**, incluindo a CSP do `vercel.json`. Os hooks e componentes não têm testes unitários próprios: a cobertura deles vem do teste de ponta a ponta acima.

### Validação manual da equipe

<!-- equipe: marcar [x] e anotar quem testou, quando e em qual navegador/aparelho -->

- [ ] MockAPI criado e `.env` configurado; sem `.env` aparece a tela de configuração
- [ ] Cadastro em 4 etapas: validações, voltar sem perder dados, salvar
- [ ] Perfis: listar, escolher perfil ativo, editar, excluir (o histórico some junto)
- [ ] Simulador: troca de cenário, "Simular pico" liga a proteção na hora (RN02)
- [ ] Proteção automática liga em ~2 s acima do limite (RN01) e desliga após 30 s de calma (RN03)
- [ ] Modo Calma só desliga em "Desativar"
- [ ] Episódio aparece no Histórico; editar nota (salva sozinha); excluir registro
- [ ] "Avisar meu responsável" só aparece com responsável e consentimento (RN05); toast "Avisamos…"
- [ ] Meus dados: exportar JSON, atividade da conta, excluir tudo
- [ ] Modo microfone: consentimento, permissão concedida e negada (volta ao simulador)
- [ ] Só teclado: navegar, abrir e fechar modais com Esc, foco visível
- [ ] Leitor de tela (NVDA / VoiceOver / TalkBack): títulos, anúncios de faixa e de proteção
- [ ] `prefers-reduced-motion` ligado: nada se move
- [ ] Celular e desktop (layout de 2 colunas a partir de `lg`)
- [ ] Deploy na Vercel com `VITE_API_URL`; recarregar em `/historico` funciona
