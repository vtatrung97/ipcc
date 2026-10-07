# ===================================================
# Stage 1: Build Host (ipcc) & Remote (process) Apps
# ===================================================
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Build Host App (ipcc)
COPY package*.json ./
RUN npm ci

COPY . .

# Xóa bớt folder process tạm thời trong lần build ipcc nếu cần hoặc build trực tiếp ipcc
RUN npm run build -- --configuration=production

# 2. Build Remote App (process)
WORKDIR /app/process

RUN npm ci

# Build process với base-href và deploy-url là /process/
RUN npm run build -- --configuration=production --base-href=/process/ --deploy-url=/process/

# ===================================================
# Stage 2: Serve with Nginx Alpine (Single Image)
# ===================================================
FROM nginx:1.25-alpine

# Xóa các file tĩnh mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy kết quả build của Host (ipcc) vào thư mục gốc nginx html
COPY --from=builder /app/dist/ipcc /usr/share/nginx/html

# Copy kết quả build của Remote (process) vào thư mục con /process
COPY --from=builder /app/process/dist/process /usr/share/nginx/html/process

# Copy file cấu hình Nginx gốc và site default.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
