module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-empty': 0,
    'no-irregular-whitespace': 0,
    'no-param-reassign': 0,
    'no-console': 'off',
  },
};
