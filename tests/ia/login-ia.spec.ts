import { test, expect } from '@playwright/test';
import { healingLocator } from '../utils/healing';

/**
 * TESTE COM IA #1 — Login com self-healing locators
 *
 * Recursos de IA aplicados:
 *   1. SELETORES GERADOS POR IA (Playwright Codegen) — priorizam role/text
 *      em vez de XPath frágil. Codegen é a ferramenta nativa do Playwright
 *      que usa heurísticas para sugerir o seletor mais robusto.
 *   2. SELF-HEALING — cascata de seletores via healingLocator(). Se o
 *      primeiro seletor falhar (ex.: o frontend mudou um data-qa), o
 *      framework "cura" automaticamente caindo em alternativas semânticas.
 *      Inspirado em Healenium (auto-heal de seletores via ML).
 *   3. GERAÇÃO ASSISTIDA POR LLM — o esqueleto deste teste foi gerado
 *      via prompt para Claude (ver docs/prompts-ia.md) e refinado.
 *
 * Comparado ao teste manual equivalente, este é resiliente a:
 *   - Renomeação de atributos `data-qa`
 *   - Mudança de tag (button -> input)
 *   - Mudança em texto de erro (regex flexível)
 */
test.describe('[IA] Fluxo de Login com Self-Healing', () => {
  test('Login inválido deve mostrar erro mesmo com mudanças no frontend', async ({ page }) => {
    await page.goto('/');

    // === ETAPA 1: Navegar até Login ===
    // Cascata de seletores: do mais semântico ao mais específico.
    const linkLogin = await healingLocator(page, [
      () => page.getByRole('link', { name: /Signup \/ Login/i }),
      () => page.getByRole('link', { name: /Login/i }),
      () => page.locator('a[href*="login"]'),
    ]);
    await linkLogin.click();

    // === ETAPA 2: Identificar o formulário de login ===
    // Não confiamos em data-qa: usamos role + label como primário.
    const campoEmail = await healingLocator(page, [
      () => page.getByRole('textbox', { name: /email/i }).first(),
      () => page.locator('input[data-qa="login-email"]'),
      () => page.locator('input[type="email"]').first(),
    ]);

    const campoSenha = await healingLocator(page, [
      () => page.getByRole('textbox', { name: /password/i }).first(),
      () => page.locator('input[data-qa="login-password"]'),
      () => page.locator('input[type="password"]').first(),
    ]);

    const botaoLogin = await healingLocator(page, [
      () => page.getByRole('button', { name: /^login$/i }),
      () => page.locator('button[data-qa="login-button"]'),
      () => page.locator('button:has-text("Login")'),
    ]);

    // === ETAPA 3: Tentativa de login com credencial inválida ===
    await campoEmail.fill('inexistente@example.com');
    await campoSenha.fill('senha-errada-123');
    await botaoLogin.click();

    // === ETAPA 4: Validar erro ===
    // Regex flexível absorve variações de texto ("incorrect" / "invalid").
    const erro = await healingLocator(page, [
      () => page.getByText(/email or password is incorrect/i),
      () => page.getByText(/invalid credentials/i),
      () => page.locator('p:has-text("incorrect")'),
    ]);
    await expect(erro).toBeVisible();
  });
});
