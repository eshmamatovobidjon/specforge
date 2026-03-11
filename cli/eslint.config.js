import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'bin/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: ['templates/', 'node_modules/'],
  },
];
