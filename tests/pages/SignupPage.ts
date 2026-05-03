import { Locator, Page, expect } from '@playwright/test';

/**
 * Page Object da segunda etapa do cadastro (formulário completo).
 */
export class SignupPage {
  readonly page: Page;
  readonly title: Locator;
  readonly genderMr: Locator;
  readonly password: Locator;
  readonly daySelect: Locator;
  readonly monthSelect: Locator;
  readonly yearSelect: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly address: Locator;
  readonly country: Locator;
  readonly state: Locator;
  readonly city: Locator;
  readonly zipcode: Locator;
  readonly mobile: Locator;
  readonly createAccountBtn: Locator;
  readonly accountCreatedHeader: Locator;
  readonly continueBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: /Enter Account Information/i });
    this.genderMr = page.locator('#id_gender1');
    this.password = page.locator('#password');
    this.daySelect = page.locator('#days');
    this.monthSelect = page.locator('#months');
    this.yearSelect = page.locator('#years');
    this.firstName = page.locator('#first_name');
    this.lastName = page.locator('#last_name');
    this.address = page.locator('#address1');
    this.country = page.locator('#country');
    this.state = page.locator('#state');
    this.city = page.locator('#city');
    this.zipcode = page.locator('#zipcode');
    this.mobile = page.locator('#mobile_number');
    this.createAccountBtn = page.locator('button[data-qa="create-account"]');
    this.accountCreatedHeader = page.locator('h2[data-qa="account-created"]');
    this.continueBtn = page.locator('a[data-qa="continue-button"]');
  }

  async expectLoaded() {
    await expect(this.title).toBeVisible();
  }

  async fillAccountForm(opts: {
    password: string;
    firstName: string;
    lastName: string;
    address: string;
    state: string;
    city: string;
    zipcode: string;
    mobile: string;
  }) {
    await this.genderMr.check();
    await this.password.fill(opts.password);
    await this.daySelect.selectOption('15');
    await this.monthSelect.selectOption('6');
    await this.yearSelect.selectOption('1990');
    await this.firstName.fill(opts.firstName);
    await this.lastName.fill(opts.lastName);
    await this.address.fill(opts.address);
    await this.country.selectOption('Canada');
    await this.state.fill(opts.state);
    await this.city.fill(opts.city);
    await this.zipcode.fill(opts.zipcode);
    await this.mobile.fill(opts.mobile);
  }

  async submit() {
    await this.createAccountBtn.click();
    await expect(this.accountCreatedHeader).toBeVisible();
  }
}
