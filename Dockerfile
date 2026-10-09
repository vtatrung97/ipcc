# ==========================================Cấu hình gốc IPCC==========================================
# Stage 1: Build IPCC Host App
FROM node:18-alpine AS builder

WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Cài đặt dependencies và build IPCC Shell gốc
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration=production

# ==========================================*Process==========================================
# Stage bổ sung bên dưới để build Remote App (Process) phục vụ Micro Frontend
FROM node:18-alpine AS process-builder

WORKDIR /app/process
ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY process/package*.json ./
RUN npm ci --legacy-peer-deps

COPY process/ ./
RUN npm run build -- --configuration=production --base-href=/process/ --deploy-url=/process/
# ============================================================================================


# ==========================================Cấu hình gốc IPCC==========================================
# Stage 2: Serve với Nginx Alpine
FROM nginx:1.25-alpine

# Xóa các file tĩnh mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy kết quả build của Host (IPCC) vào thư mục web gốc
COPY --from=builder /app/dist/ipcc /usr/share/nginx/html

# Copy cấu hình Nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# ==========================================*Note thêm==========================================
# Copy kết quả build của Remote (Process) vào thư mục con /process để phục vụ Module Federation
COPY --from=process-builder /app/process/dist/process /usr/share/nginx/html/process
# ============================================================================================

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
