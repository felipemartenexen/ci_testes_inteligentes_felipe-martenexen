# CI - Testes Inteligentes (Felipe Martenexen)

[![CI - Testes Manuais](https://github.com/felipemartenexen/ci_testes_inteligentes_felipe-martenexen/actions/workflows/ci-manual.yml/badge.svg)](https://github.com/felipemartenexen/ci_testes_inteligentes_felipe-martenexen/actions/workflows/ci-manual.yml)
[![CI - Testes com IA](https://github.com/felipemartenexen/ci_testes_inteligentes_felipe-martenexen/actions/workflows/ci-ia.yml/badge.svg)](https://github.com/felipemartenexen/ci_testes_inteligentes_felipe-martenexen/actions/workflows/ci-ia.yml)

> Atividade da disciplina: Pipeline de CI e automação de testes sem e com o suporte e recursos de IA.

Repositório com **dois pipelines de CI** (GitHub Actions) executando dois conjuntos
de testes E2E sobre a mesma aplicação: um conjunto **manual** (POM tradicional,
seletores escritos à mão) e um conjunto **com IA** (geração assistida + self-healing
locators + visual regression).

## Sumário

- [Stack](#stack)
- [Aplicação-alvo](#aplicação-alvo)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Instalação local](#instalação-local)
- [Execução local](#execução-local)
- [Pipelines de CI](#pipelines-de-ci)
- [Recursos de IA aplicados](#recursos-de-ia-aplicados)
- [Comparativo de métricas](#comparativo-de-métricas)

## Stack

- **Linguagem:** TypeScript (Node.js 20)
- **Ferramenta de automação:** [Playwright](https://playwright.dev/) v1.48
- **CI/CD:** GitHub Actions
- **Recursos de IA:** Playwright Codegen (geração assistida), `toHaveScreenshot()` (Visual Regression),
  cascata de seletores resilientes (self-healing inspirado no Healenium), e prompts
  para LLM (Claude) na geração inicial dos cenários — documentados em
  [`docs/prompts-ia.md`](docs/prompts-ia.md).

## Aplicação-alvo

[**Automation Exercise**](https://automationexercise.com/) — site público desenhado
para prática de automação de testes. Atende todos os requisitos do enunciado:

- Login real (`/login`)
- Cadastro real (`/signup`)
- Múltiplos menus de navegação (Home, Products, Cart, Contact us, Test Cases)

## Estrutura do projeto

```
.
├── .github/workflows/
│   ├── ci-manual.yml          # Pipeline para testes manuais
│   └── ci-ia.yml              # Pipeline para testes com IA
├── tests/
│   ├── manual/                # Testes escritos à mão (sem IA)
│   │   ├── login.spec.ts
│   │   └── cadastro.spec.ts
│   ├── ia/                    # Testes com suporte de IA
│   │   ├── login-ia.spec.ts
│   │   └── navegacao-ia.spec.ts
│   ├── pages/                 # Page Objects (POM)
│   │   ├── HomePage.ts
│   │   ├── LoginPage.ts
│   │   └── SignupPage.ts
│   └── utils/
│       └── healing.ts         # Helper de self-healing locators
├── docs/
│   └── prompts-ia.md          # Prompts usados com a IA
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Instalação local

Pré-requisitos: **Node.js 20+** e **npm**.

```bash
# 1. Clonar o repositório
git clone https://github.com/felipemartenexen/ci_testes_inteligentes_felipe-martenexen.git
cd ci_testes_inteligentes_felipe-martenexen

# 2. Instalar dependências
npm install

# 3. Instalar browsers do Playwright
npx playwright install --with-deps chromium

# 4. Copiar variáveis de ambiente
cp .env.example .env
```

## Execução local

```bash
# Todos os testes (manuais + IA)
npm test

# Somente testes manuais
npm run test:manual

# Somente testes com IA
npm run test:ia

# Modo interativo (UI mode)
npm run test:ui

# Modo headed (vê o browser)
npm run test:headed

# Atualizar baselines de Visual Regression (apenas quando intencional!)
npm run update-snapshots

# Abrir relatório HTML do último run
npm run report

# Gerar testes assistido por IA (Playwright Codegen)
npm run codegen
```

## Pipelines de CI

Dois workflows independentes, ambos disparados por:

- `push` em qualquer branch que **não seja** `main`/`master` (atende ao requisito
  "branches secundárias")
- `pull_request` direcionado a `main`/`master`
- Acionamento manual via `workflow_dispatch`

Ambos os pipelines:

- Usam cache do `npm` e dos browsers do Playwright (acelera execuções subsequentes).
- Falham o build se qualquer teste falhar (comportamento padrão do `playwright test`,
  que retorna exit code != 0).
- Publicam o **relatório HTML do Playwright** como artefato (retenção de 7 dias).
- Publicam **screenshots e vídeos de falha** quando aplicável.
- Imprimem `PASSED` ou `FAILED` claramente nos logs (via `::notice` / `::error`).

## Recursos de IA aplicados

| # | Recurso | Como é usado | Onde |
|---|---|---|---|
| 1 | **Playwright Codegen** | Gerador nativo do Playwright que prioriza seletores semânticos (`getByRole`, `getByText`) — heurísticas baseadas em IA recomendam o seletor mais robusto. | `npm run codegen` |
| 2 | **Self-healing locators** | Cascata de seletores via `healingLocator()`: tenta o seletor primário, em caso de falha cai em alternativas semânticas. Inspirado no Healenium. | `tests/utils/healing.ts` + todos os testes em `tests/ia/` |
| 3 | **Visual Regression (análise visual com IA)** | `toHaveScreenshot()` — comparação pixel-by-pixel com tolerância configurável. Categoria de Applitools Eyes. | `tests/ia/navegacao-ia.spec.ts` |
| 4 | **Geração via LLM** | Prompts a Claude/GPT documentados em `docs/prompts-ia.md`. | `docs/prompts-ia.md` |

## Comparativo de métricas

Após rodar ambos os pipelines algumas vezes, anotar:

| Métrica | Manual | IA |
|---|---|---|
| Tempo médio de execução | _preencher_ | _preencher_ |
| Linhas de código por teste | _preencher_ | _preencher_ |
| Falsos positivos detectados | _preencher_ | _preencher_ |
| Falhas em mudanças de seletor | _preencher_ | _preencher_ |
| Cobertura de validação visual | Nenhuma | Sim |
| Esforço de manutenção (subjetivo) | _preencher_ | _preencher_ |

A análise crítica completa está no relatório técnico submetido como PDF.

---

**Autor:** Luiz Felipe Morais Martenexen
**Disciplina:** MOB05001 - ENGENHARIA DE SOFTWARE - T01 (2026.1)
