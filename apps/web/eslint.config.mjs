import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: ['test-results/**', 'playwright-report/**', 'blob-report/**', 'e2e/.auth/**'],
  },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
