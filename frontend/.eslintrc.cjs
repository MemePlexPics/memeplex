const path = require('path');

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      alias: {
        map: [['@', path.resolve(__dirname, 'src')]],
        extensions: ['.ts', '.tsx']
      }
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:import/warnings',
    'plugin:promise/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react/recommended',
    'plugin:sonarjs/recommended'
  ],
  ignorePatterns: ['vite.config.ts', 'node_modules', 'dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.json')]
  },
  plugins: [
    '@stylexjs',
    '@typescript-eslint',
    'import',
    'optimize-regex',
    'prettier',
    'promise',
    'react',
    'react-hooks',
    'react-refresh',
    'sonarjs'
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    '@stylexjs/valid-styles': 'error',
    'no-console': 'warn',
    eqeqeq: 'warn',
    'no-debugger': 'warn',
    'no-dupe-keys': 'error',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always-and-inside-groups',
        alphabetize: {
          order: 'asc',
          caseInsensitive: false
        }
      }
    ],
    'import/named': 0,
    'import/no-named-as-default': 0,
    'import/no-unresolved': 'warn',
    'import/namespace': 'warn',
    'import/default': 'warn',

    'optimize-regex/optimize-regex': 'warn',
    'promise/prefer-await-to-then': 'warn',
    'promise/always-return': [
      'error',
      {
        ignoreLastCallback: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowAny: true
      }
    ],
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'default',
        format: ['camelCase']
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase']
      },
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase']
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow'
      },
      {
        selector: 'memberLike',
        modifiers: ['private'],
        format: ['camelCase'],
        leadingUnderscore: 'require'
      },
      {
        selector: 'method',
        format: ['camelCase']
      },
      {
        selector: 'enumMember',
        format: ['PascalCase', 'UPPER_CASE']
      },
      {
        selector: 'typeLike',
        format: ['PascalCase']
      },
      {
        selector: 'property',
        format: [],
        modifiers: ['requiresQuotes']
      },
      {
        selector: 'objectLiteralProperty',
        format: []
      },
      {
        selector: 'import',
        format: ['camelCase', 'PascalCase'],
        modifiers: ['default'],
      }
    ],
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-confusing-void-expression': [
      'warn',
      {
        ignoreArrowShorthand: true,
      }
    ],
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-inferrable-types': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/unbound-method': 0,
    '@typescript-eslint/member-ordering': 'warn',
    '@typescript-eslint/explicit-function-return-type': 0,
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/consistent-indexed-object-style": "warn",
    "@typescript-eslint/no-misused-promises": [
      "warn",
      {
        "checksVoidReturn": false
      }
    ],
    '@typescript-eslint/no-magic-numbers': [
      'warn',
      {
        ignoreNumericLiteralTypes: true,
        ignoreEnums: true,
        enforceConst: true,
        ignoreReadonlyClassProperties: true,
        ignore: [0, 1, 2, 24, 60, 200, 204, 403, 404, 500, 503, 1000],
      }
    ],
    'react/no-access-state-in-setstate': 'error',
    'react/no-danger': 'error',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-multi-comp': 'error',
    'react/no-this-in-sfc': 'error',
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.tsx']
      }
    ],
    'react/jsx-no-bind': 0,
    'react/jsx-no-literals': 0,
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-pascal-case': 'error',
    'react/prop-types': 0,
    'react/no-unescaped-entities': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 0,
    'sonarjs/prefer-immediate-return': 0,
    'sonarjs/no-duplicate-string': ['warn', { threshold: 4 }],
    'sonarjs/no-small-switch': 0
  }
}
