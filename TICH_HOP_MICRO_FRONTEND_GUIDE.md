# TÀI LIỆU HƯỚNG DẪN TÍCH HỢP VÀ TRIỂN KHAI MICRO FRONTEND
### Tích hợp ứng dụng con (Remote App - Process) vào IPCC Shell (Host App)

> **Mục đích tài liệu:** Tài liệu này cung cấp toàn bộ hướng dẫn kỹ thuật chi tiết dành cho **đội ngũ Developer (Dev)** và **đội ngũ DevOps / Hạ tầng** để tích hợp và triển khai hệ thống Micro Frontend theo chuẩn **Webpack 5 Module Federation** trên nền tảng **Angular 14**.

---

## I. TỔNG QUAN KIẾN TRÚC (ARCHITECTURE OVERVIEW)

```
                       Trình duyệt người dùng (Client Browser)
                                      │
                                      ▼
                        Hạ tầng Nginx / Ingress Gateway
                      (https://ipcc.domain.vn:port)
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        │                                                           │
        ▼ (Path: /)                                                 ▼ (Path: /process/)
┌──────────────────────────────┐                            ┌──────────────────────────────┐
│  IPCC Host App (Shell)       │                            │  Remote App (Process)        │
│  - Chứa Header, Sidebar, Nav │                            │  - Cung cấp nghiệp vụ riêng  │
│  - Quản lý Auth, JWT Token   │                            │  - Build ra remoteEntry.js   │
│  - Nạp RemoteModule động     │ ◄──── nạp remoteEntry.js ──┤  - Chạy độc lập hoặc nhúng   │
└──────────────────────────────┘                            └──────────────────────────────┘
```

- **IPCC (Host / Shell App):** Là ứng dụng gốc chứa layout chung, xác thực (Keycloak/JWT), phân quyền menu. Khi người dùng truy cập route `/process`, IPCC sẽ tải file `remoteEntry.js` từ Remote App để render module con ngay trên màn hình mà không cần reload trang.
- **Process (Remote App):** Là project độc lập (Angular 14). Đóng gói và expose module nghiệp vụ thông qua Webpack Module Federation.

---

## II. PHẦN DÀNH CHO DEVELOPER (DEV CHECKLIST)

---

### 1. Phía Remote App (Dự án con cần tích hợp - ví dụ `process`)

Remote App cần đóng gói và expose module ra ngoài để Host có thể nạp được.

#### Bước 1.1: Cài đặt thư viện Module Federation
Tại thư mục gốc của project Remote, chạy lệnh:
```bash
npm install @angular-architects/module-federation@^14.3.0 ngx-build-plus@^14.0.0 --save-dev
```

#### Bước 1.2: Cấu hình `angular.json`
Đổi builder của target `build` và `serve` sang dùng `ngx-build-plus` để hỗ trợ custom Webpack:
```json
{
  "projects": {
    "process": {
      "architect": {
        "build": {
          "builder": "ngx-build-plus:build",
          "options": {
            "outputPath": "dist/process",
            "extraWebpackConfig": "webpack.config.js",
            "commonChunk": false
          },
          "configurations": {
            "production": {
              "extraWebpackConfig": "webpack.config.js"
            }
          }
        },
        "serve": {
          "builder": "ngx-build-plus:dev-server",
          "options": {
            "port": 4201,
            "extraWebpackConfig": "webpack.config.js"
          }
        }
      }
    }
  }
}
```

#### Bước 1.3: Tạo file `webpack.config.js` ở thư mục gốc của Remote App
```javascript
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  // Tên định danh của remote app
  name: 'process',

  // File manifest sinh ra khi build để Host đọc
  filename: 'remoteEntry.js',

  // Khai báo các Module muốn expose cho Host nạp
  exposes: {
    './ProcessModule': './src/app/pages/pages.module.ts',
  },

  // Chia sẻ thư viện dùng chung để tránh nạp trùng lặp
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});
```

#### Bước 1.4: Cấu hình Routing bên trong Remote App
Module được expose (`PagesModule` hoặc `ProcessModule`) phải dùng **relative routes** (đường dẫn tương đối) và đăng ký qua `RouterModule.forChild(routes)`:
```typescript
// pages-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcessListComponent } from './process-list.component';

const routes: Routes = [
  {
    path: '', // Tránh dùng '/process', để rỗng để Host mount vào path cha
    component: ProcessListComponent
  },
  {
    path: 'detail/:id',
    component: ProcessDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
```

---

### 2. Phía Host App (IPCC Gốc)

Host App cần cấu hình Webpack tương thích Module Federation và nạp Remote Module theo đường dẫn cấu hình động.

#### Bước 2.1: Cài đặt thư viện Module Federation
Tại thư mục gốc IPCC, chạy lệnh:
```bash
npm install @angular-architects/module-federation@^14.3.0 ngx-build-plus@^14.0.0 --save
```

#### Bước 2.2: Cấu hình `angular.json`
Đổi builder của project `velzon` (hoặc `ipcc`) sang `ngx-build-plus`:
```json
{
  "projects": {
    "velzon": {
      "architect": {
        "build": {
          "builder": "ngx-build-plus:build",
          "options": {
            "extraWebpackConfig": "webpack.config.js",
            "commonChunk": false
          },
          "configurations": {
            "production": {
              "extraWebpackConfig": "webpack.config.js"
            },
            "k8s": {
              "extraWebpackConfig": "webpack.config.js"
            }
          }
        },
        "serve": {
          "builder": "ngx-build-plus:dev-server",
          "options": {
            "port": 4200,
            "extraWebpackConfig": "webpack.config.js"
          }
        }
      }
    }
  }
}
```

#### Bước 2.3: Merge `webpack.config.js` với cấu hình CKEditor hiện tại của IPCC
> **Lưu ý quan trọng cho Dev:** IPCC gốc đang có cấu hình Webpack xử lý SVG và CSS của CKEditor 5. Cần gộp (merge) cấu hình `withModuleFederationPlugin` với rule hiện tại để không làm hỏng trình soạn thảo văn bản CKEditor:

```javascript
'use strict';

const path = require('path');
const { bundler, styles } = require('@ckeditor/ckeditor5-dev-utils');

// Cấu hình gốc ban đầu của IPCC (Giữ nguyên 100% không đổi)
const originalConfig = {
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [ 'raw-loader' ]
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
          {
            loader: 'postcss-loader',
            options: styles.getPostCssConfig( {
              themeImporter: {
                themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
              },
              minify: true
            } )
          }
        ]
      }
    ]
  }
};

// ==========================================*Note thêm==========================================
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
    port: 4200
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
```

#### Bước 2.4: Khai báo URL `remoteEntry.js` vào file môi trường
- `src/environments/environment.ts` (Môi trường Local Dev):
```typescript
export const environment = {
  production: false,
  processRemoteUrl: 'http://localhost:4201/remoteEntry.js'
};
```

- `src/environments/environment.prod.ts` (Môi trường Production / Nginx cùng domain):
```typescript
export const environment = {
  production: true,
  processRemoteUrl: '/process/remoteEntry.js' // Sử dụng đường dẫn relative qua Nginx Reverse Proxy
};
```

- `src/environments/environment.k8s.ts` (Môi trường K8s Staging/Test):
```typescript
export const environment = {
  production: true,
  processRemoteUrl: '/process/remoteEntry.js'
};
```

#### Bước 2.5: Đăng ký Dynamic Route trong `app-routing.module.ts` của IPCC
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { environment } from '../environments/environment';

const routes: Routes = [
  // Các route hiện tại của IPCC...
  {
    path: 'process',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: environment.processRemoteUrl,
        exposedModule: './ProcessModule'
      }).then(m => m.PagesModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

> 🌟 **Lưu ý đặc biệt quan trọng về Routing (Khi Remote App có 10, 20 hay nhiều trang):**
> - **Bên IPCC (Host) chỉ cần khai báo ĐÚNG 1 ROUTE DUY NHẤT** là `path: 'process'`. **KHÔNG CẦN** khai báo 10 route tương ứng 10 trang!
> - **Cơ chế hoạt động (Child Routing Delegation):**
>   - IPCC chỉ đóng vai trò đón đường dẫn có tiền tố `/process` và chuyển tiếp toàn bộ nhánh con cho `ProcessModule`.
>   - Toàn bộ 10 hay 100 trang con (`/process/list`, `/process/create`, `/process/detail/:id`, `/process/report`,...) được định nghĩa nội bộ trong `PagesRoutingModule` của dự án Process (`RouterModule.forChild(...)`).
>   - **Ưu điểm vượt trội:** Sau này dự án Process có thêm trang thứ 11, trang thứ 12 hay đổi tên route con thì **team IPCC hoàn toàn KHÔNG cần sửa code hay deploy lại Host**.

#### Bước 2.6: Chia sẻ Token và State (Authentication & Authorization)
- IPCC Host khi đăng nhập thành công sẽ lưu access token vào `localStorage` (ví dụ key `access_token` hoặc `token`).
- Do cả Host và Remote chạy cùng domain (hoặc qua iframe/storage chung), Remote App đọc trực tiếp token từ `localStorage.getItem('access_token')` trong `HttpInterceptor` của mình.

---

### 3. TỔNG HỢP: PROJECT GỐC IPCC SẼ PHẢI SỬA GÌ? (ĐÁNH GIÁ TÁC ĐỘNG)

> 💡 **Khẳng định quan trọng:** Tích hợp Micro Frontend theo phương án này đạt tiêu chuẩn **ZERO BREAKING CHANGES** đối với IPCC gốc. **Toàn bộ mã nguồn nghiệp vụ cũ (Components, Services, Modules, Models hiện tại) được GIỮ NGUYÊN 100%, KHÔNG PHẢI SỬA BẤT KỲ DÒNG CODE NGHIỆP VỤ NÀO.**

Dưới đây là chi tiết toàn bộ các file mà lập trình viên IPCC cần tác động:

#### A. Bảng danh mục các file cần sửa trên IPCC gốc

| STT | File cần sửa | Thao tác | Chi tiết thay đổi | Mức độ ảnh hưởng đến chức năng cũ |
|:---:|---|:---:|---|:---:|
| **1** | `package.json` | **Thêm thư viện** | Thêm `@angular-architects/module-federation` và `ngx-build-plus`. | 🟢 **Không ảnh hưởng** (Chỉ bổ sung công cụ build) |
| **2** | `angular.json` | **Đổi Builder** | Chuyển builder của project `velzon` sang `ngx-build-plus:build` và `ngx-build-plus:dev-server`, thêm option `"extraWebpackConfig": "webpack.config.js"`. | 🟢 **Không ảnh hưởng** (Vẫn biên dịch toàn bộ code Angular bình thường) |
| **3** | `webpack.config.js` | **Mở rộng cấu hình** | Bọc thêm `withModuleFederationPlugin` và khai báo `shared`. Giữ nguyên 100% rule của SVG và CKEditor 5 có sẵn. | 🟢 **Không ảnh hưởng** (CKEditor 5 và icon SVG vẫn chạy đúng chuẩn) |
| **4** | `src/environments/*.ts`<br>(`environment.ts`, `prod.ts`, `k8s.ts`) | **Thêm 1 biến** | Thêm 1 dòng khai báo `processRemoteUrl: '/process/remoteEntry.js'`. | 🟢 **Không ảnh hưởng** (Không đụng đến các biến API cũ) |
| **5** | `app-routing.module.ts` | **Thêm 1 Route** | Thêm 1 route `{ path: 'process', loadChildren: ... }` dùng `loadRemoteModule`. | 🟢 **Không ảnh hưởng** (Tất cả route cũ giữ nguyên thứ tự và logic) |
| **6** | Menu / Sidebar<br>*(Nếu lưu DB hoặc file config)* | **Thêm 1 Menu item** | Thêm 1 bản ghi menu với đường dẫn `link: '/process'` để người dùng click chuyển trang. | 🟢 **Không ảnh hưởng** (Các menu chức năng cũ giữ nguyên) |

#### B. Những phần IPCC gốc HOÀN TOÀN KHÔNG CẦN SỬA:
1. ❌ **Không sửa core logic hay state:** Không cần viết lại hệ thống State Management hay Service dùng chung.
2. ❌ **Không sửa giao diện hay layout:** Khung Header, Sidebar, Footer, Theme của IPCC giữ nguyên 100%. Màn hình của app con chỉ được nhúng vào phần `<router-outlet></router-outlet>` khi vào route `/process`.
3. ❌ **Không sửa cơ chế Auth/Login:** IPCC vẫn đăng nhập bằng Keycloak / Auth Server như bình thường.
4. ❌ **Không sửa các API Backend hiện tại:** Toàn bộ API Backend của IPCC không cần can thiệp.

#### C. Đánh giá rủi ro và giải pháp an toàn (Fault Isolation):
- **Tốc độ tải trang ban đầu (Initial Load):** Vì Remote App được nạp theo cơ chế **Lazy Loading qua mạng**, khi người dùng mới vào trang chủ IPCC thì file của Remote App **chưa hề được tải về**. Do đó, dung lượng ban đầu và thời gian load trang của IPCC hoàn toàn không bị chậm đi dù chỉ 1ms.
- **Nếu Remote App gặp sự cố (Server lỗi, mất mạng):** 
  Có thể bọc cơ chế xử lý lỗi nhẹ nhàng trong `app-routing.module.ts` để nếu Remote App không tải được thì chỉ hiển thị thông báo "Tính năng đang bảo trì" hoặc chuyển về trang 404/500 mà **không làm chết (crash) toàn bộ hệ thống IPCC**:
  ```typescript
  {
    path: 'process',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: environment.processRemoteUrl,
        exposedModule: './ProcessModule'
      })
      .then(m => m.PagesModule)
      .catch(err => {
        console.error('Không thể tải module Process:', err);
        // Có thể redirect sang trang fallback báo lỗi dịch vụ tạm gián đoạn
        return import('./pages/fallback/fallback.module').then(m => m.FallbackModule);
      })
  }
  ```

---

## III. PHẦN DÀNH CHO DEVOPS (DEVOPS CHECKLIST & CONFIGURATION)

---

### 1. Yêu cầu build mã nguồn (CI Build Steps)

1. **Host App (IPCC):**
   ```bash
   npm ci
   npm run build -- --configuration=production
   # Output lưu tại dist/ROOT hoặc dist/ipcc
   ```

2. **Remote App (Process):**
   > **Rất quan trọng:** Phải truyền tham số `--base-href` và `--deploy-url` là `/process/` khi build để các file chunks và assets của Remote App được trình duyệt tải từ đúng subpath `/process/`, không bị ghi đè lên path gốc `/` của IPCC.
   ```bash
   npm ci
   npm run build -- --configuration=production --base-href=/process/ --deploy-url=/process/
   # Output lưu tại dist/process
   ```

---

### 2. Cấu hình Nginx (Bắt buộc cho Web Server / Reverse Proxy)

#### Những điểm cốt lõi DevOps cần đảm bảo trong Nginx:
1. **Đường dẫn `/`:** Phục vụ Host App IPCC với cơ chế `try_files $uri $uri/ /index.html;` (SPA fallback).
2. **Đường dẫn `/process/`:** Phục vụ Remote App với `alias` trỏ vào thư mục build của process và `try_files $uri $uri/ /process/index.html;`.
3. **CORS Headers (`Access-Control-Allow-Origin: *`):** Bắt buộc phải có trên location phục vụ `remoteEntry.js` và các chunk `.js` để trình duyệt không chặn khi nạp module.
4. **Cache Control:**
   - File `remoteEntry.js` **KHÔNG ĐƯỢC CACHE** để khi DevOps deploy phiên bản mới của Remote App, người dùng nhận được ngay phiên bản mới nhất mà không bị kẹt cache.
   - Các file có mã băm hash (`main.*.js`, chunk `*.js`, `*.css`) được cache dài hạn.

#### File cấu hình Nginx mẫu (`default.conf`):
```nginx
server {
    listen       80;
    server_name  localhost;

    root   /usr/share/nginx/html;
    index  index.html index.htm;

    # 1. Định tuyến cho Host App (IPCC)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Định tuyến cho Remote App (Process)
    location /process/ {
        alias /usr/share/nginx/html/process/;
        try_files $uri $uri/ /process/index.html;

        # Header CORS bắt buộc cho Module Federation
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    }

    # 3. Không cache file remoteEntry.js để đảm bảo nhận version mới tức thì
    location ~* remoteEntry\.js$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Access-Control-Allow-Origin "*" always;
    }

    # 4. Cache cho các static assets có hash
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
        add_header Access-Control-Allow-Origin "*" always;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

---

### 3. Phương án đóng gói Docker

DevOps có thể lựa chọn 1 trong 2 phương án tùy thuộc vào hạ tầng CI/CD hiện tại:

#### Phương án A: Mono-Image (Gộp 2 App vào 1 Docker Image duy nhất)
*Phù hợp khi muốn đơn giản hoá hạ tầng, chỉ cần 1 Pod chạy cả 2 app.*

```dockerfile
# ===================================================
# Stage 1: Build IPCC Host App & Process Remote App
# ===================================================
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Build Host App (IPCC)
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

# 2. Build Remote App (Process)
WORKDIR /app/process
COPY process/package*.json ./
RUN npm ci
COPY process/ .
RUN npm run build -- --configuration=production --base-href=/process/ --deploy-url=/process/

# ===================================================
# Stage 2: Serve bằng Nginx Alpine
# ===================================================
FROM nginx:1.25-alpine

RUN rm -rf /usr/share/nginx/html/*

# Copy kết quả build của IPCC vào thư mục gốc /
COPY --from=builder /app/dist/ROOT /usr/share/nginx/html/

# Copy kết quả build của Process vào thư mục con /process
COPY --from=builder /app/process/dist/process /usr/share/nginx/html/process/

# Copy cấu hình Nginx
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

#### Phương án B: Multi-Service (Khuyên dùng cho Enterprise K8s - Độc lập 100%)
*Mỗi team quản lý 1 repo riêng, 1 pipeline CI/CD riêng, deploy Pod độc lập không phụ thuộc nhau.*

1. **Dockerfile của Process Remote App:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production --base-href=/process/ --deploy-url=/process/

FROM nginx:1.25-alpine
COPY --from=builder /app/dist/process /usr/share/nginx/html/process
COPY nginx-process.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Cấu hình Nginx Ingress trên Kubernetes (Điều phối lưu lượng):**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: microfrontend-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
spec:
  rules:
  - http:
      paths:
      # Định tuyến subpath /process sang Pod của Process
      - path: /process
        pathType: Prefix
        backend:
          service:
            name: process-service
            port:
              number: 80
      # Định tuyến các path còn lại sang Pod của IPCC
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ipcc-service
            port:
              number: 80
```

---

### 4. Mẫu Kubernetes Deployment & Service cho IPCC Micro Frontend

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ipcc-microfrontend-deployment
  labels:
    app: ipcc-microfrontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ipcc-microfrontend
  template:
    metadata:
      labels:
        app: ipcc-microfrontend
    spec:
      containers:
      - name: ipcc-microfrontend
        image: ipcc-microfrontend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: ipcc-microfrontend-service
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
    name: http
  selector:
    app: ipcc-microfrontend
```

---

## IV. BẢNG TỔNG HỢP KIỂM TRA (VERIFICATION CHECKLIST)

| STT | Hạng mục | Bên thực hiện | Tiêu chí đạt (Acceptance Criteria) |
|---|---|---|---|
| 1 | Cài đặt package & đổi builder | Dev (Cả 2 bên) | `angular.json` dùng `ngx-build-plus:build`, có `extraWebpackConfig`. |
| 2 | Expose module của Remote App | Dev Process | Build ra file `remoteEntry.js`, mở URL `/process/remoteEntry.js` thấy file JS. |
| 3 | Merge Webpack CKEditor | Dev IPCC | Build IPCC không lỗi, các trang dùng CKEditor hoạt động bình thường. |
| 4 | Định tuyến động `loadRemoteModule` | Dev IPCC | Truy cập route `/process` nạp giao diện con mà không báo lỗi console. |
| 5 | Base Href & Deploy URL | DevOps | Remote App được build với `--base-href=/process/ --deploy-url=/process/`. |
| 6 | CORS Header Nginx | DevOps | Header phản hồi của `remoteEntry.js` có `Access-Control-Allow-Origin: *`. |
| 7 | Tắt cache `remoteEntry.js` | DevOps | File `remoteEntry.js` có `Cache-Control: no-cache, no-store`. |
| 8 | SPA Fallback Router | DevOps | F5 (refresh) tại trang `http://domain/process/...` không bị lỗi 404 Nginx. |
