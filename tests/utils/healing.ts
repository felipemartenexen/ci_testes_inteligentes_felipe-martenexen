import { Page, Locator, expect } from '@playwright/test';

/**
 * Estratégia de self-healing simplificada.
 *
 * Inspirada em ferramentas como Healenium e nos padrões recomendados pela
 * IA do Playwright Codegen, que prioriza seletores semânticos (role, text)
 * em vez de seletores frágeis (xpath, css específico).
 *
 * A função recebe uma lista ordenada de candidatos. O primeiro que estiver
 * visível na página é retornado. Se nenhum funcionar, lança erro descrevendo
 * todas as estratégias testadas, facilitando o debugging.
 *
 * Uso:
 *   const btn = await healingLocator(page, [
 *     () => page.getByRole('button', { name: 'Login' }),
 *     () => page.getByText('Login'),
 *     () => page.locator('button[data-qa="login-button"]'),
 *   ]);
 *   await btn.click();
 */
export async function healingLocator(
  page: Page,
  strategies: Array<() => Locator>,
  options: { timeoutPerStrategy?: number } = {}
): Promise<Locator> {
  const timeout = options.timeoutPerStrategy ?? 3000;
  const errors: string[] = [];

  for (let i = 0; i < strategies.length; i++) {
    const locator = strategies[i]();
    try {
      await expect(locator.first()).toBeVisible({ timeout });
      if (i > 0) {
        // Log para auditoria: indica que houve "cura" do seletor
        console.log(
          `[self-healing] Estratégia ${i + 1} funcionou após ${i} falha(s). ` +
          `Considerar atualizar o seletor primário.`
        );
      }
      return locator.first();
    } catch (e) {
      errors.push(`  - Estratégia ${i + 1}: não encontrou elemento`);
    }
  }

  throw new Error(
    `[self-healing] Todas as ${strategies.length} estratégias falharam:\n${errors.join('\n')}`
  );
}

/**
 * Gera um e-mail único por execução para os testes de cadastro.
 */
export function uniqueEmail(prefix = 'felipe.test'): string {
  const stamp = Date.now();
  return `${prefix}+${stamp}@example.com`;
}
