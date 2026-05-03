# Documentação dos prompts utilizados com IA

> O enunciado da atividade exige que o uso de IA generativa seja **documentado**.
> Este arquivo registra os prompts utilizados, as ferramentas, e o nível de
> intervenção humana sobre o resultado gerado.

## 1. Geração inicial dos cenários — Claude (Anthropic)

**Prompt utilizado:**

> "Sou estudante de QA. Preciso de um teste E2E em Playwright (TypeScript) para
> o site `https://automationexercise.com/`. O teste deve:
> 1. Tentar login com credenciais inválidas;
> 2. Validar que a mensagem de erro 'Your email or password is incorrect!' aparece;
> 3. Usar Page Object Model.
> Use seletores resilientes (`getByRole`, `getByText`) sempre que possível, com
> fallback para `data-qa` ou CSS específico. Comente o código indicando os pontos
> onde a IA assistiu."

**Ferramenta:** Claude (Anthropic)
**Saída usada em:** `tests/ia/login-ia.spec.ts` (refatorado posteriormente para usar `healingLocator`)
**Intervenção humana:** validação manual dos seletores no DevTools, ajuste das regex,
adaptação para o helper de self-healing.

---

## 2. Geração de seletores — Playwright Codegen

**Comando:**

```bash
npx playwright codegen https://automationexercise.com/
```

O Codegen gera o código enquanto você navega no site. As heurísticas internas
priorizam:

1. `getByRole(...)` — semântico, resiliente a mudanças de markup;
2. `getByText(...)` — robusto a refatorações de layout;
3. `getByLabel(...)` — apropriado para formulários acessíveis;
4. `getByTestId(...)` — fallback explícito;
5. CSS específico — último recurso.

**Trecho exemplo gerado pelo Codegen** (antes da refatoração para self-healing):

```typescript
await page.getByRole('link', { name: 'Signup / Login' }).click();
await page.getByPlaceholder('Email Address').first().fill('test@example.com');
await page.getByPlaceholder('Password').fill('senha-errada');
await page.getByRole('button', { name: 'Login' }).click();
await expect(page.getByText('Your email or password is incorrect!')).toBeVisible();
```

**Saída usada em:** base de `tests/ia/login-ia.spec.ts` e `tests/ia/navegacao-ia.spec.ts`
**Intervenção humana:** transformação dos seletores em cascata de self-healing.

---

## 3. Visual Regression — Playwright `toHaveScreenshot`

Não há prompt — é um recurso nativo. O algoritmo compara dois PNGs pixel-a-pixel
usando o algoritmo `pixelmatch`, com parâmetros:

- `threshold` (sensibilidade por pixel): 0.2
- `maxDiffPixelRatio` (proporção máxima de pixels diferentes): 0.05 (5%)

A comparação é tolerante a anti-aliasing e diferenças mínimas de renderização
entre execuções no mesmo browser. Quando a baseline ainda não existe, a primeira
execução cria o snapshot — esses arquivos são commitados no repo.

---

## 4. Self-healing locators — implementação inspirada em Healenium

A ferramenta [Healenium](https://healenium.io) usa **machine learning** para
encontrar elementos parecidos quando o seletor primário falha. Aqui implementamos
uma versão simplificada e determinística (cascata de fallback) em
`tests/utils/healing.ts`.

A motivação é a mesma: um teste não deve quebrar porque um `id="login-btn"` foi
renomeado para `id="login-button"` se o botão continua visível com o texto "Login".

---

## 5. Reflexão sobre o uso de IA na atividade

**Onde a IA ajudou de fato:**

- Redução de tempo na escrita inicial dos testes (~40% menos tempo no rascunho).
- Sugestão de seletores semânticos que eu provavelmente não escolheria primeiro
  (a tendência humana é começar pelo `id` ou `data-qa`).
- Identificação automática de mudanças visuais que asserts textuais não pegariam.

**Onde a IA atrapalhou ou foi limitada:**

- Sugestões de Codegen incluíam seletores demasiadamente específicos (`.nth(3)`)
  que precisaram ser revistos.
- Visual Regression é sensível a fontes não-determinísticas e exige mascarar
  regiões dinâmicas (slider) — sem o conhecimento da aplicação, geraria falsos
  positivos.
- LLM (Claude) ocasionalmente sugere métodos da API que não existem — exigiu
  validação contra a documentação oficial.
- A "cura" automática de seletores tem um custo: testes ficam mais lentos quando
  caem em estratégias de fallback.

**Conclusão prática:** IA é um ótimo **acelerador de produtividade**, mas o
engenheiro de QA continua sendo o responsável pela qualidade final do teste,
pela escolha dos cenários cobertos e pelo julgamento do que é regressão real
versus mudança intencional.
