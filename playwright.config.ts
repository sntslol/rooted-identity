import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'site.spec.ts', fullyParallel: true,
  use: { baseURL: process.env.BASE_URL || 'http://127.0.0.1:3016', browserName: 'chromium' },
  webServer: process.env.BASE_URL ? undefined : { command: 'npm start', url: 'http://127.0.0.1:3016', reuseExistingServer: !process.env.CI },
});
