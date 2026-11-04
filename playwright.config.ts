import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'
import fs from 'fs'

import { e2ePort, serverURL } from './tests/helpers/serverURL'

// The e2e run gets its own database and upload folder, so it never touches dev data and never meets
// a stale schema. They are recreated once per run (workers reload this file, hence the guard).
const e2eEnv = { DATABASE_URL: 'file:./e2e.db', MEDIA_DIR: './e2e-media', SERVER_URL: serverURL }
Object.assign(process.env, e2eEnv)

if (!process.env.TEST_WORKER_INDEX) {
  for (const file of ['e2e.db', 'e2e.db-wal', 'e2e.db-shm', 'e2e-media']) {
    fs.rmSync(file, { recursive: true, force: true })
  }
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: serverURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${e2ePort}`,
    // CSRF and CORS only trust SERVER_URL, so it must match the e2e port.
    env: e2eEnv,
    reuseExistingServer: true,
    // /healthz boots Payload, so the server pushes the schema before any test touches the database.
    url: `${serverURL}/healthz`,
  },
})
