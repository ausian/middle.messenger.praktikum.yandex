module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  ignorePatterns: ['node_modules', 'dist', 'postcss.config.js'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'airbnb-typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
      ],
      rules: {
        'react/jsx-filename-extension': 'off',
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'eol-last': ['error', 'always'],
      },
    },

    {
      files: ['*.js', '*.cjs', '*.mjs'],
      parser: 'espree',
      extends: ['eslint:recommended', 'prettier'],
      rules: {
        'eol-last': ['error', 'always'],
      },
    },
    {
    files: ['vite.config.js'],
    parser: 'espree',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module', 
    },
    extends: ['eslint:recommended', 'prettier'],
    rules: {
      'eol-last': ['error', 'always'],
    },
  },
  ],
};
