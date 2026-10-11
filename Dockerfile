# ==============================================================================
# DOCKERFILE CHẠY MÔI TRƯỜNG MÁY CÁ NHÂN (LOCAL DOCKER)
# Tích hợp trọn gói cả IPCC Host (Shell) và Remote App (ProcessX) vào 1 Container Nginx
# ==============================================================================

# Khởi tạo tham số Registry (mặc định để trống để kéo image trực tiếp từ Docker Hub công khai)
ARG REGISTRY=""

# ------------------------------------------------------------------------------
# Stage 1: Build IPCC Host App (Shell)
# ------------------------------------------------------------------------------
FROM ${REGISTRY}node:14.21.2-alpine3.16 AS builder

WORKDIR /app

# Tăng RAM cho Node để tránh lỗi JavaScript heap out of memory khi build Angular
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Cài đặt thư viện dependencies của Host (dùng npm install giống Dockerfile gốc)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy toàn bộ mã nguồn Host
COPY . .

# Build phiên bản production của Host
ARG BUILD_ENV=production
RUN npm run build -- --configuration=${BUILD_ENV}

# ------------------------------------------------------------------------------
# Stage 2: Build Remote App (ProcessX)
# ------------------------------------------------------------------------------
FROM ${REGISTRY}node:14.21.2-alpine3.16 AS process-builder

WORKDIR /app/processX

ENV NODE_OPTIONS="--max-old-space-size=2048"

# Cài đặt dependencies của ProcessX
COPY processX/package*.json ./
RUN npm install --legacy-peer-deps

# Copy toàn bộ mã nguồn ProcessX
COPY processX/ ./

# Build ProcessX với base-href và deploy-url chuẩn theo đường dẫn Nginx (/processX/)
ARG BUILD_ENV=production
RUN npm run build -- --configuration=${BUILD_ENV} --base-href=/processX/ --deploy-url=/processX/

# ------------------------------------------------------------------------------
# Stage 3: Nginx Runtime - Đóng gói vào 1 Nginx phục vụ Port 80
# ------------------------------------------------------------------------------
FROM ${REGISTRY}nginx:1.23.3-alpine

# Xóa trang mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# 1. Copy kết quả build của Host IPCC vào thư mục gốc web
COPY --from=builder /app/dist/ipcc /usr/share/nginx/html/

# 2. Copy kết quả build của Remote ProcessX vào thư mục con /processX và /process
COPY --from=process-builder /app/processX/dist/process /usr/share/nginx/html/processX
RUN cp -r /usr/share/nginx/html/processX /usr/share/nginx/html/process

# 3. Kích hoạt cấu hình Production (sử dụng /processX/remoteEntry.js) cho container
RUN if [ -f /usr/share/nginx/html/assets/env_real.js ]; then \
        cp /usr/share/nginx/html/assets/env_real.js /usr/share/nginx/html/assets/env.js; \
    fi

# 4. Di chuyển thư mục assets/register (nếu có)
RUN if [ -d /usr/share/nginx/html/assets/register ]; then \
        mv /usr/share/nginx/html/assets/register /usr/share/nginx/html/; \
    fi

# 5. Copy file cấu hình Nginx hỗ trợ Module Federation & Single Domain
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Cổng truy cập của Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
