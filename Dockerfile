# ==============================================================================
# DOCKERFILE CHO IPCC HOST (SHELL APP)
# ==============================================================================

ARG REGISTRY=""

# ------------------------------------------------------------------------------
# Stage 1: Build IPCC Host App (Shell)
# ------------------------------------------------------------------------------
FROM ${REGISTRY}node:14.21.2-alpine3.16 AS builder

WORKDIR /app

# Tăng RAM cho Node để tránh lỗi JavaScript heap out of memory
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Cài đặt dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy toàn bộ mã nguồn Shell
COPY . .

# Build phiên bản môi trường chỉ định
ARG BUILD_ENV=production
RUN npm run build -- --configuration=${BUILD_ENV}

# ------------------------------------------------------------------------------
# Stage 2: Nginx Runtime phục vụ Host Shell (Port 80)
# ------------------------------------------------------------------------------
FROM ${REGISTRY}nginx:1.23.3-alpine

RUN rm -rf /usr/share/nginx/html/*

# Copy kết quả build vào thư mục gốc web
COPY --from=builder /app/dist/ipcc/ /usr/share/nginx/html/

# Kích hoạt env production nếu có
RUN if [ -f /usr/share/nginx/html/assets/env_real.js ]; then \
        cp /usr/share/nginx/html/assets/env_real.js /usr/share/nginx/html/assets/env.js; \
    fi

# Di chuyển thư mục register (nếu có)
RUN if [ -d /usr/share/nginx/html/assets/register ]; then \
        mv /usr/share/nginx/html/assets/register /usr/share/nginx/html/; \
    fi

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
