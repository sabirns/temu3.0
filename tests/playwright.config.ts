import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5174',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'Desktop', use: { browserName: 'chromium' } },
    { name: 'Mobile', use: { browserName: 'chromium', ...devices['iPhone 12'] } }
  ],
})
