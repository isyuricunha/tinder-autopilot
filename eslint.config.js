const eslintConfigAirbnb = require('eslint-config-airbnb');
const eslintConfigPrettier = require('eslint-config-prettier');
const eslintPluginImport = require('eslint-plugin-import');
const eslintPluginJsxA11y = require('eslint-plugin-jsx-a11y');
const eslintPluginReact = require('eslint-plugin-react');
const eslintPluginReactHooks = require('eslint-plugin-react-hooks');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const babelParser = require('@babel/eslint-parser');

module.exports = [
  {
    files: ['src/**/*.js', 'src/**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: babelParser,
      parserOptions: {
        requireConfigFile: true,
        babelOptions: {
          configFile: './.babelrc',
        },
      },
      globals: {
        browser: 'readonly',
        commonjs: 'readonly',
        es6: 'readonly',
        jest: 'readonly',
        node: 'readonly',
        webextensions: 'readonly',
        chrome: 'readonly',
      },
    },
    plugins: {
      import: eslintPluginImport,
      'jsx-a11y': eslintPluginJsxA11y,
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintConfigAirbnb.rules,
      ...eslintConfigPrettier.rules,
      'arrow-body-style': 'off',
      'consistent-return': 'off',
      'jsx-a11y/href-no-hash': ['off'],
      'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
      'max-len': [
        'warn',
        {
          code: 100,
          tabWidth: 2,
          comments: 100,
          ignoreComments: false,
          ignoreTrailingComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      'no-restricted-syntax': 'off',
      'no-await-in-loop': 'off',
      'no-console': 'off',
      'class-methods-use-this': 'off',
      'no-param-reassign': 'off',
      'prefer-spread': 'off',
      'no-continue': 'off',
      'no-else-return': 'off',
      'no-use-before-define': 'off',
      'no-unused-vars': 'off',
      'prefer-destructuring': 'off',
      'func-names': 'off',
      'no-shadow': 'off',
      'no-empty': 'off',
      'no-multi-assign': 'off',
      'import/no-cycle': 'off',
      radix: 'off',
      'lines-between-class-members': 'off',
      'no-plusplus': 'off',
      'no-case-declarations': 'off',
      'object-shorthand': 'off',
      'no-unused-expressions': 'off',
    },
  },
];
