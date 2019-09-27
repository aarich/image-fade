module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'indent': ['error', 4],
    'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
    'import/extensions': [ 'error', { js: 'always'} ],
    'no-underscore-dangle' : 0,
    'radix': ["error", "as-needed"],
    "indent": ['error', 4, { 'SwitchCase': 1 }]
  },
};
