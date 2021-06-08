module.exports = {
  presets: [
    '@vue/app',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: 2
      }
    ]
  ],
  plugins: ['@babel/plugin-transform-runtime']
};
