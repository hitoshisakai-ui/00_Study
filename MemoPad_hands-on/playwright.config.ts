import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const rootDir = __dirname;

export default defineConfig({
  testDir: './tests/test-cases',
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/results/html-report', open: 'never' }],
    ['json', { outputFile: 'tests/results/results.json' }],
    ['./tests/helpers/file-log-reporter.ts', {
      stdoutFile: path.join(rootDir, 'tests/logs/viewpoint-table.stdout.log'),
      stderrFile: path.join(rootDir, 'tests/logs/viewpoint-table.stderr.log'),
    }],
  ],
  outputDir: 'tests/results/artifacts',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
