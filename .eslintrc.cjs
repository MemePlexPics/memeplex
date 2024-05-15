const path = require('path');

module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:drizzle/recommended',
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
                    'warn',
                    2
                ],
                semi: [
                    'warn',
                    'never'
                ],
                '@typescript-eslint/no-unused-vars': [
                  'warn',
                  {
                    args: 'after-used',
                    ignoreRestSiblings: true,
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                  }
                ],
            }
        },
        {
            files: ["tests/**/*"],
            env: {
              jest: true
            }
        }
    ],
    ignorePatterns: ['webpack.config.ts', 'node_modules', 'dist', '.eslintrc.cjs'],
    rules: {
        indent: [
            'warn',
            4
        ],
        'no-control-regex': 0,
        'linebreak-style': [
            'error',
            'unix'
        ],
        'no-unused-vars': [
          'warn',
          {
            args: 'after-used',
            ignoreRestSiblings: true,
            argsIgnorePattern: '^_'
          }
        ],
        quotes: [
            'error',
            'single'
        ],
        semi: [
            'error',
            'always'
        ],
        // TODO: remove these two after eslint-drizzle plugin will be tuned
        'drizzle/enforce-delete-with-where': 'warn',
        'drizzle/enforce-update-with-where': 'warn',
    }
};
