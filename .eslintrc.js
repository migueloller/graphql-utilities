module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  plugins: [
    'babel',
  ],
  rules: {
    'babel/func-params-comma-dangle': ['error', 'always-multiline'],
  },
};
