import { Locator, Page, expect } from '@playwright/test';

/**
 * Page Object para a página de Login / Signup do Automation Exercise.
 */
export class LoginPage {
  readonly page: Page;

  // --- Bloco de Login ---
  readonly loginHeader: Locator;
  readonly loginEmail: Locator;
  readonly loginPassword: Locator;
  readonly loginButton: Locator;
  readonly loginError: Locator;

  // --- Bloco de Signup ---
  readonly signupHeader: Locator;
  readonly signupName: Locator;
  readonly signupEmail: Locator;
  readonly signupButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loginHeader = page.getByRole('heading', { name: /Login to your account/i });
    this.loginEmail = page.locator('input[data-qa="login-email"]');
    this.loginPassword = page.locator('input[data-qa="login-password"]');
    this.loginButton = page.locator('button[data-qa="login-button"]');
    this.loginError = page.getByText(/Your email or password is incorrect/i);

    this.signupHeader = page.getByRole('heading', { name: /New User Signup/i });
    this.signupName = page.locator('input[data-qa="signup-name"]');
    this.signupEmail = page.locator('input[data-qa="signup-email"]');
    this.signupButton = page.locator('button[data-qa="signup-button"]');
  }

  async expectLoaded() {
    await expect(this.loginHeader).toBeVisible();
    await expect(this.signupHeader).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
  }

  async startSignup(name: string, email: string) {
    await this.signupName.fill(name);
    await this.signupEmail.fill(email);
    await this.signupButton.click();
  }
}
