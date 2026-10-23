import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Retries solo en CI: localmente una falla tiene que fallar a la primera.
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    // La tienda marca sus elementos con data-test, no con data-testid.
    testIdAttribute: 'data-test',
    // Una traza solo cuando se reintenta una prueba que falló.
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Levanta la tienda antes de correr la suite.
  webServer: {
    command: 'npx serve tienda -l 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
