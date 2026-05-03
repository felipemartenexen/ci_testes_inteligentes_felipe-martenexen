import { Locator, Page, expect } from '@playwright/test';

/**
 * Page Object da página inicial do Automation Exercise.
 * Centraliza seletores e ações para reuso entre testes.
 */
export class HomePage {
  readonly page: Page;
  readonly logoSlider: Locator;
  readonly menuLoginSignup: Locator;
  readonly menuProducts: Locator;
  readonly menuCart: Locator;
  readonly menuContactUs: Locator;
  readonly menuTestCases: Locator;
  readonly featuresItemsSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoSlider = page.locator('#slider');
    // Seletores resilientes baseados em texto e role (recomendação do Playwright Codegen).
    this.menuLoginSignup = page.getByRole('link', { name: /Signup \/ Login/i });
    this.menuProducts = page.getByRole('link', { name: /^\s*Products\s*$/i });
    this.menuCart = page.getByRole('link', { name: /^\s*Cart\s*$/i }).first();
    this.menuContactUs = page.getByRole('link', { name: /Contact us/i });
    this.menuTestCases = page.getByRole('link', { name: /Test Cases/i }).first();
    this.featuresItemsSection = page.locator('.features_items');
  }

  async goto() {
    await this.page.goto('/');
    // Garantir que a home carregou completamente antes de seguir.
    await expect(this.logoSlider).toBeVisible();
  }

  async clickLoginSignup() {
    await this.menuLoginSignup.click();
  }

  async clickProducts() {
    await this.menuProducts.click();
  }

  async clickContactUs() {
    await this.menuContactUs.click();
  }
}
