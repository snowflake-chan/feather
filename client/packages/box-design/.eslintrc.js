module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  settings: {
    react: {
      // 需要这个配置来控制一些deprecated的报错
      version: 'detect',
    },
  },
  ignorePatterns: ['*.scss', '*.css', '*.svg'],
  extends: [
    'plugin:sonarjs/recommended',
    'prettier',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    
  ],
  rules: {
    'react/no-array-index-key': 'warn',
    'react-hooks/exhaustive-deps': ['warn'],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: {
          constructors: 'no-public',
        },
      },
    ],
    '@typescript-eslint/type-annotation-spacing': 'off',
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],

    // Sonar rules
    'sonarjs/no-small-switch': 'warn',
    'sonarjs/cognitive-complexity': ['warn', 15],
    'sonarjs/no-collapsible-if': 'warn',
    'sonarjs/no-duplicated-branches': 'warn',
    'sonarjs/no-nested-switch': 'warn',
    'sonarjs/no-identical-functions': 'warn',
    'sonarjs/prefer-immediate-return': 'warn',
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/no-redundant-boolean': 'warn',
  },
  plugins: ['@typescript-eslint', 'sonarjs'],
};
