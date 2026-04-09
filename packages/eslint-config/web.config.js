import { defineConfig } from 'eslint/config';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import { fixupPluginRules } from '@eslint/compat';

import baseConfig, { ALL_JS_FILES } from './base.config.js';

/** Patched for ESLint 10 (react plugin still uses removed context.getFilename, etc.) */
const reactPlugin = fixupPluginRules(pluginReact);

export default defineConfig([
  {
    files: [ALL_JS_FILES],
    extends: [baseConfig],
  },
  {
    files: [ALL_JS_FILES],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { react: reactPlugin },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
  },
]);
