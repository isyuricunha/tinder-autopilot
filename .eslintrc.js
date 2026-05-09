module.exports = {
  extends: ['airbnb', 'plugin:prettier/recommended'],
  parser: 'babel-eslint',
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
    webextensions: true
  },
  globals: {
    chrome: 'readonly'
  },
  rules: {
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
        ignoreRegExpLiterals: true
      }
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
    'no-unused-expressions': 'off'
  }
};
