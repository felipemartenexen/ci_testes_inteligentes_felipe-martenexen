# RELATÓRIO TÉCNICO — TRANSCREVER À MÃO

> Texto enxuto, calculado para caber em ~2 páginas A4 manuscritas em letra
> média. O relatório DEVE ser entregue em PDF (foto/scanner do manuscrito).

---

## CABEÇALHO

**Atividade:** Pipelines de CI e automação de testes (manuais e com suporte de IA)
**Disciplina:** _[preencher nome da disciplina]_
**Estudante:** Luiz Felipe Morais Martenexen
**Repositório:** https://github.com/SEU-USUARIO/ci_testes_inteligentes_felipe-martenexen

---

## 1. INTRODUÇÃO

A atividade consistiu em construir dois pipelines de CI no GitHub Actions,
cobrindo o mesmo conjunto de funcionalidades de uma aplicação web pública,
com duas abordagens distintas: testes automatizados escritos de forma
tradicional (manual) e testes com suporte de recursos de Inteligência
Artificial.

A ferramenta de automação escolhida foi o **Playwright**, pelos seguintes
motivos: (i) suporte nativo a paralelismo, traces e screenshots, reduzindo
configuração; (ii) `Codegen` integrado, que aplica heurísticas de IA para
sugerir seletores resilientes; (iii) suporte de primeira classe a Visual
Regression via `toHaveScreenshot`; (iv) ecossistema TypeScript, que permite
tipagem estática nos Page Objects.

A aplicação-alvo foi o **Automation Exercise** (automationexercise.com),
pública, com login real, cadastro real e múltiplos menus de navegação —
atendendo aos três requisitos do enunciado.

## 2. CONFIGURAÇÃO DAS PIPELINES

Foram criados dois workflows em `.github/workflows/`:

- **`ci-manual.yml`** — executa `npm run test:manual`;
- **`ci-ia.yml`** — executa `npm run test:ia`.

Ambos disparam em `push` para branches secundárias e em `pull_request` para
`main`. Usam cache de `node_modules` e dos browsers do Playwright para acelerar
execuções subsequentes, publicam o relatório HTML e os screenshots de falha
como artefatos com retenção de 7 dias, e exibem PASSED/FAILED nos logs.

## 3. IMPLEMENTAÇÃO DOS TESTES

**Testes manuais (`tests/manual/`):**
1. **Login com credenciais inválidas** — valida que a mensagem de erro é
   exibida ao tentar autenticar com dados incorretos.
2. **Cadastro de usuário** — fluxo completo de signup, do formulário inicial
   até a confirmação "Account Created!".

Ambos seguem o padrão Page Object Model, com seletores escolhidos
manualmente (priorizando `data-qa` da aplicação).

**Testes com IA (`tests/ia/`):**
1. **Login com self-healing locators** — mesma validação do teste manual,
   mas usando uma cascata de seletores (`getByRole` → `data-qa` → CSS
   específico) implementada no helper `healingLocator`. Inspirado no
   Healenium e refinado com prompts ao Claude (documentados em
   `docs/prompts-ia.md`).
2. **Navegação + Visual Regression** — exercita a navegação pelos menus
   Products e Contact us e adicionalmente captura snapshots visuais via
   `toHaveScreenshot`, com tolerância de 5% (categoria semelhante à de
   ferramentas como Applitools Eyes). Detecta regressões visuais que
   asserts textuais não capturam.

## 4. ANÁLISE CRÍTICA — MANUAL × IA

| Aspecto | Manual | IA |
|---|---|---|
| Esforço inicial de escrita | maior (seletores um a um) | menor (Codegen + LLM aceleram o rascunho) |
| Linhas de código por teste | ~25 | ~40 (verbosidade do self-healing) |
| Resiliência a mudanças de seletor | baixa | alta (cura automática) |
| Detecção de regressão visual | ausente | presente |
| Determinismo / flakiness | maior determinismo | risco de falso-positivo no diff visual |
| Tempo de execução | comparável | ligeiramente maior (overhead do healing + screenshot) |
| Manutenção | precisa de ajuste a cada refactor de UI | tolera refactors menores |

A abordagem com IA pagou-se já no segundo run em que houve mudança simulada
de seletor: o teste manual quebrou; o teste com self-healing seguiu passando
(com aviso em log indicando qual estratégia foi usada). Por outro lado, o
Visual Regression foi sensível a regiões dinâmicas (carousel da home) e
exigiu uso explícito do `mask:` para evitar falsos positivos.

## 5. CONCLUSÃO

**Vantagens da IA aplicada à automação:** redução do tempo de rascunho;
seletores mais robustos por padrão; cobertura visual que asserts textuais
não dão; documentação implícita por meio dos prompts.

**Limitações observadas:** não substitui o julgamento de QA — a IA não sabe
quais cenários são críticos para o negócio; sugestões do Codegen às vezes
incluem seletores frágeis (`nth-child`); LLMs alucinam APIs e exigem
verificação contra documentação; baselines de Visual Regression precisam de
disciplina de versionamento.

**Dificuldades:** estabilizar o Visual Regression no CI (a renderização
varia entre máquinas — exigiu fixar o ambiente do browser e mascarar
regiões dinâmicas); decidir a granularidade da cascata de self-healing
(muito agressiva mascara bugs reais).

**Sugestões de melhoria futura:** integrar Healenium como serviço (não só o
helper local); adicionar testes em paralelo no Firefox/WebKit; experimentar
priorização de testes via IA (executar primeiro os testes mais propensos a
falhar com base no histórico de falhas); incluir um job de análise visual
baseada em LLM (descrever em linguagem natural a diferença entre baseline e
captura atual).

**Reflexão final:** o papel do QA não é eliminado pela IA — é elevado. O
profissional deixa de gastar tempo escrevendo `getByXPath` e passa a
desenhar estratégia de teste, validar saídas da IA, manter baselines
visuais e julgar quando uma "cura" é mascaramento de bug real.
