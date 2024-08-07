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
                'no-multiple-empty-lines': ['warn'],
                'no-trailing-spaces': ['warn'],
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
                '@typescript-eslint/consistent-type-imports': [
                    'warn',
                    {
                      prefer: 'type-imports',
                      fixStyle: 'separate-type-imports',
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
    ignorePatterns: ['*.config.ts', 'node_modules', 'dist', '.eslintrc.cjs'],
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
        'drizzle/enforce-delete-with-where': [
            'error',
            {
                'drizzleObjectName': 'db',
            },
        ],
        'drizzle/enforce-update-with-where': [
            'error',
            {
                'drizzleObjectName': 'db',
            },
        ],
    }
};
