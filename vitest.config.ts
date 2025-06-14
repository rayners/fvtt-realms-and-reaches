import { createFoundryTestConfig } from '@rayners/foundry-dev-tools/vitest';
import { resolve } from 'path';

export default createFoundryTestConfig({
  test: {
    include: ['test/**/*.{test,spec}.{js,ts}', 'src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      reporter: ['text', 'html', 'clover', 'json']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});