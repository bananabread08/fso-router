module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    'jest/globals': true,
    'cypress/globals': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:cypress/recommended',
    'prettier',
  ],
  overrides: [],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'jest', 'cypress'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
        ignoredNodes: ['ConditionalExpression'],
      },
    ],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['warn', 'always'],
    'react/prop-types': ['off'],
    'no-console': 0,
    'no-unused-vars': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
