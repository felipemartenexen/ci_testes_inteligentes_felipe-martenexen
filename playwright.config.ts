import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Configuração Playwright
 * Documentação: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/pages/**', '**/utils/**'],

  // Baseline única cross-platform: o template padrão inclui um sufixo
  // {-snapshotSuffix} que vira "-win32"/"-linux"/"-darwin", obrigando a
  // gerar/manter baselines separadas por SO. Como o dev local é Windows e
  // o CI roda em Linux, isso quebraria o ci-ia.yml na primeira execução.
  // Removendo o sufixo, uma única imagem serve tanto local quanto CI;
  // a tolerância de toHaveScreenshot abaixo absorve as diferenças mínimas
  // de rendering de fonte entre Chrome/Win e Chrome/Linux.
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',

  // Tempo máximo por teste
  timeout: 60_000,

  // Espera por asserts (afeta toHaveScreenshot, toBeVisible etc.)
  expect: {
    timeout: 10_000,
    // Tolerância para comparação visual com IA (Visual Regression)
    toHaveScreenshot: {
      // 10% absorve diferenças de rendering entre Chrome Windows e Linux
      // sem mascarar regressões reais (mudanças de cor/layout passam disso).
      maxDiffPixelRatio: 0.10,
      threshold: 0.3,
    },
  },

  // Falha o build no CI se test.only foi commitado
  forbidOnly: !!process.env.CI,

  // Retry no CI para mitigar flakiness (recomendação Playwright)
  retries: process.env.CI ? 2 : 0,

  // Paralelismo: CI usa 2 workers, local usa o padrão
  workers: process.env.CI ? 2 : undefined,

  // Reporters: HTML (artefato) + lista no terminal + JUnit (CI)
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://automationexercise.com',
    // Trace para depuração no CI quando o teste falha
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Aumenta a tolerância de espera por elementos (apoia self-healing)
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Descomente para multi-browser (aumenta tempo de CI):
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',  use: { ...devices['Desktop Safari']  } },
  ],
});
