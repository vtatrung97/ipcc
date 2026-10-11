'use strict';

const path = require('path');
let bundler, styles;
try {
  const ckutils = require('@ckeditor/ckeditor5-dev-utils');
  bundler = ckutils.bundler;
  styles = ckutils.styles;
} catch (e) {
  // Fallback an toàn nếu chưa cài @ckeditor/ckeditor5-dev-utils
}

let hasStyleLoader = false;
try {
  require.resolve('style-loader');
  hasStyleLoader = true;
} catch (e) {
  // style-loader chưa được cài ở môi trường local giả lập
}

// Cấu hình gốc ban đầu của IPCC (Giữ nguyên y hệt bên learn/ipcc)
const originalConfig = {
  module: {
    rules: [
      ...(hasStyleLoader ? [
        {
          test: /\.svg$/,
          use: ['raw-loader']
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader',
              options: {
                injectType: 'singletonStyleTag',
                attributes: {
                  'data-cke': true
                }
              }
            },
            ...(styles ? [{
              loader: 'postcss-loader',
              options: styles.getPostCssConfig({
                themeImporter: {
                  themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
                },
                minify: true
              })
            }] : [])
          ]
        }
      ] : [])
    ]
  }
};



// ==========================================*Process==========================================
// Phần cấu hình bổ sung bên dưới để tích hợp Micro Frontend (Webpack 5 Module Federation)
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const mfConfig = withModuleFederationPlugin({
  remotes: {},
  shared: { ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }) }
});

module.exports = {
  ...mfConfig,
  ...originalConfig,

  module: {
    ...mfConfig.module,
    rules: [
      ...(mfConfig.module?.rules || []),
      ...originalConfig.module.rules
    ]
  },

  output: {
    ...mfConfig.output,
    publicPath: '/'
  },

  devServer: {
    historyApiFallback: true,
    liveReload: false,
    watchFiles: ['src/**/*']
  },

  watchOptions: {
    ignored: [
      '**/.angular/**',
      '**/processX/**',
      '**/node_modules/**',
      '**/.git/**'
    ]
  }
};
