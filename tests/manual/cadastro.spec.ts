import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { uniqueEmail } from '../utils/healing';

/**
 * TESTE MANUAL 2 — Cadastro de novo usuário
 *
 * Cobre o fluxo completo de registro:
 *   home -> Signup/Login -> formulário inicial -> formulário de conta
 *   -> "Account Created!" -> Continue -> usuário logado.
 *
 * Seletores escritos manualmente. Não usa nenhuma estratégia de IA
 * ou self-healing — depende dos atributos `data-qa` da aplicação.
 */
test.describe('[MANUAL] Fluxo de Cadastro', () => {
  test('Deve cadastrar novo usuário com sucesso', async ({ page }) => {
    const home = new HomePage(page);
    const login = new LoginPage(page);
    const signup = new SignupPage(page);

    const nome = 'Felipe Teste';
    const email = uniqueEmail('felipe.manual');

    // 1. Vai para a home
    await home.goto();

    // 2. Acessa a página de Signup/Login
    await home.clickLoginSignup();
    await login.expectLoaded();

    // 3. Inicia signup pelo formulário rápido (nome + email)
    await login.startSignup(nome, email);

    // 4. Preenche o formulário detalhado de criação de conta
    await signup.expectLoaded();
    await signup.fillAccountForm({
      password: 'SenhaForte!123',
      firstName: 'Felipe',
      lastName: 'Martenexen',
      address: 'Rua Teste, 123',
      state: 'PA',
      city: 'Altamira',
      zipcode: '68371000',
      mobile: '+5593999999999',
    });

    // 5. Submete e valida que a conta foi criada
    await signup.submit();
    await expect(signup.accountCreatedHeader).toContainText(/Account Created/i);

    // 6. Continua e valida que o usuário aparece logado no menu
    await signup.continueBtn.click();
    await expect(page.getByText(`Logged in as ${nome}`)).toBeVisible();
  });
});
