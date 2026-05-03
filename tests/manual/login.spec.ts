import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

/**
 * TESTE MANUAL 1 — Login com credenciais inválidas
 *
 * Construído à mão usando seletores convencionais (data-qa, role-based).
 * Page Object Model aplicado manualmente. Asserts e fluxo escritos
 * sem auxílio de IA. Documentado como "manual" para fins de comparação
 * com o pipeline ci-ia.yml.
 */
test.describe('[MANUAL] Fluxo de Login', () => {
  test('Deve exibir erro ao tentar logar com credenciais inválidas', async ({ page }) => {
    const home = new HomePage(page);
    const login = new LoginPage(page);

    // 1. Acessa a home
    await home.goto();

    // 2. Navega até a página de login
    await home.clickLoginSignup();

    // 3. Confirma que a página de login foi carregada
    await login.expectLoaded();

    // 4. Tenta logar com credenciais inválidas
    await login.login('inexistente@example.com', 'senha-errada-123');

    // 5. Valida mensagem de erro
    await expect(login.loginError).toBeVisible();

    // 6. Confirma que o usuário NÃO foi autenticado (header de login ainda visível)
    await expect(login.loginHeader).toBeVisible();
  });
});
