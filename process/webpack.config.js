const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const mfConfig = withModuleFederationPlugin({
  name: 'process',
  exposes: {
    './ProcessModule': './src/app/pages/pages.module.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});

module.exports = {
  ...mfConfig,
  watchOptions: {
    ignored: [
      '**/.angular/**',
      '**/node_modules/**',
      '**/.git/**'
    ]
  }
};
