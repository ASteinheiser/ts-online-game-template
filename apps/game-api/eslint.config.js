import { defineConfig } from 'eslint/config';

import baseConfig, { ALL_JS_FILES } from '@repo/eslint-config';

export default defineConfig([
  {
    files: [ALL_JS_FILES],
    extends: [baseConfig],
    ignores: ['ecosystem.config.cjs'],
  },
]);
