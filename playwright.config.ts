import { defineConfig, devices } from 'playwright/test';

const port = Number(process.env['PLAYWRIGHT_PORT'] ?? 4300);
const baseURL = `http://127.0.0.1:${port}`;
const ngServe =
  process.platform === 'win32'
    ? String.raw`node_modules\.bin\ng.cmd serve --port ${port} --host 127.0.0.1`
    : `node_modules/.bin/ng serve --port ${port} --host 127.0.0.1`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  outputDir: 'tmp/playwright-results',
  reporter: [['list'], ['html', { outputFolder: 'tmp/playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: ngServe,
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
});
