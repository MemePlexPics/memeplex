const path = require('path');

module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: [path.resolve(__dirname, 'tsconfig.json')]
    },
    overrides: [
        {
            env: {
                node: true
            },
            files: [
                '.eslintrc.{js,cjs}'
            ],
            parserOptions: {
                sourceType: 'script'
            }
        },
        {
            files: ['*.ts'],
            parser: '@typescript-eslint/parser',
            extends: [
                'eslint:recommended',
                'prettier',
                'plugin:@typescript-eslint/recommended',
            ],
            rules: {
                '@typescript-eslint/indent': [
                    'error',
                    2
                ],
                semi: [
                    'warn',
                    'never'
                ]
            }
        }
    ],
    ignorePatterns: ['vite.config.ts', 'node_modules', 'dist', '.eslintrc.cjs'],
    rules: {
        indent: [
            'error',
            4
        ],
        'no-control-regex': 0,
        'linebreak-style': [
            'error',
            'unix'
        ],
        quotes: [
            'error',
            'single'
        ],
        semi: [
            'error',
            'always'
        ]
    }
};
