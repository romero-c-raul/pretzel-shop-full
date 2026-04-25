import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['node_modules', 'dist', 'eslint.config.js'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    rules: {
      'no-unused-vars': 'warn',
      'preserve-caught-error': 'off',
    },
  }
]