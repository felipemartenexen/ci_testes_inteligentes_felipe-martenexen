import { test, expect } from '@playwright/test';
import { healingLocator } from '../utils/healing';

/**
 * TESTE COM IA #2 — Navegação por menus + Análise Visual (Visual Regression)
 *
 * Recursos de IA aplicados:
 *   1. ANÁLISE VISUAL AUTOMATIZADA — usa toHaveScreenshot() do Playwright,
 *      que aplica algoritmo de comparação pixel-by-pixel com tolerância
 *      configurável (maxDiffPixelRatio em playwright.config.ts).
 *      Categoria semelhante à de ferramentas como Applitools Eyes:
 *      detecta mudanças visuais não-intencionais que asserts textuais
 *      não capturariam (cor errada, layout quebrado, elemento sumido).
 *   2. SELF-HEALING — healingLocator() para os menus.
 *   3. TESTE GERADO PELO PLAYWRIGHT CODEGEN e refinado via prompt para
 *      Claude (ver docs/prompts-ia.md).
 *
 * Funcionamento do Visual Regression:
 *   - Na 1ª execução: cria a baseline (snapshot de referência) em
 *     tests/ia/navegacao-ia.spec.ts-snapshots/. Esses arquivos DEVEM ser
 *     commitados.
 *   - Nas execuções seguintes: compara a captura atual com a baseline.
 *     Se a diferença passar do threshold, falha o teste.
 *   - Baseline cross-platform: o playwright.config.ts remove o sufixo
 *     de plataforma do template, então a mesma imagem é usada em Windows
 *     local e Linux do CI. A tolerância (10% / 0.3) absorve diferenças de
 *     rendering de fonte; mudanças reais de UI ainda são detectadas.
 *   - Para atualizar a baseline propositalmente: `npm run update-snapshots`.
 */
test.describe('[IA] Navegação + Visual Regression', () => {
  // Bloqueia AdSense/DoubleClick: o vignette intersticial intercepta cliques
  // em menus e redireciona para "#google_vignette", quebrando a navegação.
  test.beforeEach(async ({ context }) => {
    await context.route(
      /(googlesyndication|doubleclick|googleadservices|googletagservices|adservice\.google|google-analytics|googletagmanager)\.com/,
      (route) => route.abort(),
    );
  });

  test('Menus principais devem navegar e manter aparência consistente', async ({ page }) => {
    await page.goto('/');

    // Aguarda elementos críticos para evitar screenshot prematuro
    await expect(page.locator('#slider')).toBeVisible();

    // === Visual Regression #1: Home ===
    // Mascara o slider (carousel rotativo, naturalmente dinâmico)
    // para evitar falso-positivo no diff visual.
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: false,
      mask: [page.locator('#slider')],
      maxDiffPixelRatio: 0.05,
    });

    // === Navegação para Products via self-healing ===
    const menuProducts = await healingLocator(page, [
      () => page.getByRole('link', { name: /^\s*Products\s*$/i }).first(),
      () => page.locator('a[href="/products"]').first(),
      () => page.locator('nav a:has-text("Products")').first(),
    ]);
    await menuProducts.click();

    await expect(page).toHaveURL(/\/products/);
    const productsHeader = await healingLocator(page, [
      () => page.getByRole('heading', { name: /All Products/i }),
      () => page.locator('h2:has-text("All Products")'),
    ]);
    await expect(productsHeader).toBeVisible();

    // === Visual Regression #2: Página de Products ===
    await expect(productsHeader).toHaveScreenshot('products-header.png', {
      maxDiffPixelRatio: 0.05,
    });

    // === Navegação para Contact Us ===
    const menuContact = await healingLocator(page, [
      () => page.getByRole('link', { name: /Contact us/i }),
      () => page.locator('a[href="/contact_us"]'),
    ]);
    await menuContact.click();

    await expect(page).toHaveURL(/\/contact_us/);
    const contactHeader = await healingLocator(page, [
      () => page.getByRole('heading', { name: /Get In Touch/i }),
      () => page.locator('h2:has-text("Get In Touch")'),
    ]);
    await expect(contactHeader).toBeVisible();
  });
});
