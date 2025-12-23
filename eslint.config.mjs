import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import eslintImport from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  { ignores: ['node_modules/**', '**/dist/**', '**/build/**'] },

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    rules: {
      'no-var': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],

      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
        },
      ],
      '@typescript-eslint/no-empty-interface': [
        'error',
        { allowSingleExtends: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
    },
  },

  {
    files: ['shared/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ['backend/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['backend/src/services/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    files: ['backend/knexfile.ts'],
    plugins: { import: eslintImport },
    rules: { 'import/no-default-export': 'off' },
  },

  {
    files: ['frontend/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },

  {
    files: ['its/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.node,
    },
  },

  prettier,
);
