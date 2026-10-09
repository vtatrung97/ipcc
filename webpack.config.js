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
  remotes: {
    // TÁC DỤNG: Để trống {} vì IPCC nạp app con theo dạng ĐỘNG (Dynamic Remotes) qua hàm loadRemoteModule().
    // Giúp đổi URL linh hoạt theo môi trường (Local, Test, Prod) mà KHÔNG bị hardcode chết URL vào đây.
  },

  shared: {
    // TÁC DỤNG: Chia sẻ các thư viện dùng chung (@angular/core, @angular/common, rxjs...).
    // singleton: true -> Bắt buộc chỉ chạy 1 bản thể duy nhất trong bộ nhớ, tránh tải 2 lần Angular gây xung đột.
    // strictVersion: true & requiredVersion: 'auto' -> Tự động kiểm tra tương thích phiên bản giữa Host và Remote.
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});

module.exports = {
  // Gộp cấu hình Module Federation
  ...mfConfig,

  // Gộp cấu hình IPCC gốc
  ...originalConfig,

  module: {
    ...mfConfig.module,
    rules: [
      // TÁC DỤNG: Giữ nguyên 100% các rule xử lý SVG và CSS của CKEditor 5 để trình soạn thảo không bị lỗi build.
      ...(mfConfig.module?.rules || []),
      ...originalConfig.module.rules
    ]
  },

  output: {
    ...mfConfig.output,
    // TÁC DỤNG: Ép đường dẫn gốc của Host là '/'.
    // Khắc phục lỗi SyntaxError: "Cannot use 'import.meta' outside a module" trong styles.js khi chạy dev.
    publicPath: '/'
  },

  devServer: {
    // TÁC DỤNG: Khi người dùng gõ trực tiếp URL /process trên thanh địa chỉ hoặc nhấn F5,
    // server sẽ chuyển tiếp về index.html để Angular Router xử lý, tránh bị lỗi màn hình trắng 404 Not Found.
    historyApiFallback: true,
    port: 4200,
    // ==========================================*Note thêm==========================================
    // TÁC DỤNG: Mô phỏng Nginx Ingress của Production ngay tại Local:
    // Mọi request vào /process-mfe/ trên port 4200 sẽ được proxy ngầm sang Process (port 4201).
    // Giúp trình duyệt chỉ cần gọi chung 1 port 4200 y hệt như chạy trên 1 domain duy nhất!
    proxy: {
      '/process-mfe': {
        target: 'http://localhost:4201',
        pathRewrite: { '^/process-mfe': '' },
        changeOrigin: true
      }
    }
    // ============================================================================================
  },

  watchOptions: {
    // TÁC DỤNG: Bỏ qua việc theo dõi thay đổi ở thư mục cache, thư viện và app con process/.
    // Tránh việc dev-server hiểu lầm file thay đổi dẫn đến reload trang lặp vô tận (Infinite Reload Loop).
    ignored: [
      '**/.angular/**',
      '**/process/**',
      '**/node_modules/**',
      '**/.git/**'
    ]
  }
};
