import globals from 'globals'
import jseslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default tseslint.config({
  files: ['src/**/*.*', '*.js', '*.mjs', '*.ts'],
  ignores: ['node_modules', '.vscode', '.idea', '*.log*', '.cache', '.env', 'dist', 'build/*.js', 'src/assets', 'public', '/**/*.d.ts'],
  extends: [
    jseslint.configs.recommended,
    ...tseslint.configs.recommended,
    eslintPluginPrettierRecommended,
    {
      name: 'custom',
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
        globals: {
          ...globals.browser,
          ...globals.es2025,
          ...globals.node,
          ...globals.worker,
        },
      },
      rules: {
        '@typescript-eslint/no-explicit-any': ['off'],
        '@typescript-eslint/ban-ts-comment': ['off'],
      },
    },
  ],
})
