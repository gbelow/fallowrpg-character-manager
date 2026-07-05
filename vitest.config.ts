import { defineConfig } from 'vitest/config'

// The domain layer is pure and has zero React/DOM dependencies, so tests run
// in a plain Node environment. `resolve.tsconfigPaths` makes the `@/*` alias
// from tsconfig.json resolve the same way it does under Next.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['app/**/*.test.ts'],
  },
})
