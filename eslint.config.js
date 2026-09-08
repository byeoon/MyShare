import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            '**/node_modules/**',
            '**/build/**',
            '**/dist/**',
            '**/.svelte-kit/**',
            '**/coverage/**',
            '**/*.min.js',
        ],
    },

    eslint.configs.recommended,

    {
        files: ['backend/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'no-console': 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'prefer-const': 'error',
        },
    },

    ...svelte.configs['flat/recommended'],

    ...tseslint.configs.recommended.map((config) => ({
        ...config,
        files: ['frontend/**/*.ts'],
    })),

    {
        files: ['frontend/**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },

    {
        files: ['frontend/**/*.svelte'],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                extraFileExtensions: ['.svelte'],
                parser: tseslint.parser,
            },
        },
        rules: {
            'svelte/no-at-html-tags': 'error',
            'svelte/no-unused-svelte-ignore': 'error',
        },
    },

    prettier,
);
