# Build stage
FROM node:25-alpine AS builder

WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci

# 複製源碼
COPY . .

# 構建應用
RUN npm run build

# Production stage - 使用 Node 服務器提供靜態文件
FROM node:25-alpine

WORKDIR /app

# 安裝輕量級靜態服務器
RUN npm install -g serve

# 從 builder stage 複製構建結果
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 設置健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# 啟動應用
CMD ["serve", "-s", "dist", "-l", "3000"]
