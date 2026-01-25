import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export const ALL_JS_FILES = '**/*.{js,mjs,cjs,ts,jsx,tsx}';
export const ALL_TS_FILES = '**/*.{ts,tsx}';

export default defineConfig([
  globalIgnores([
    'node_modules/*',
    'dist/*',
    '.rollup.cache/*',
    '**/generated-types.ts',
    '**/generated-types/**',
    '**/prisma-client/**',
  ]),
  {
    files: [ALL_JS_FILES],
    plugins: { js },
    extends: ['js/recommended'],
  },
  // this needs to be after the js-specific rules, because of overrides
  {
    files: [ALL_TS_FILES],
    plugins: { tseslint },
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: [ALL_JS_FILES],
    plugins: { prettier },
    extends: [eslintConfigPrettier],
    rules: { 'prettier/prettier': 'error' },
  },
]);
