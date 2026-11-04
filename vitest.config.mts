import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    // Own database, so tests never touch the dev data; dotenv does not override it.
    env: { DATABASE_URL: 'file:./test.db', MEDIA_DIR: './test-media' },
    // Each file boots Payload, which pushes the schema: in parallel they race on the same file.
    fileParallelism: false,
  },
})
