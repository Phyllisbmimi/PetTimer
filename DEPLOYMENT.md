# 🐾 PetTimer 應用部署指南

**English Description:** PetTimer is a gamified productivity app that combines a Pomodoro timer, virtual pet care, goal tracking, daily check-ins, and AI-powered planning to make studying and time management more engaging.

## 三種方式運行 PetTimer

### 方式 1️⃣：使用 Tauri 構建桌面應用（推薦）

Tauri 是一個輕量級框架，可以將你的 web 應用打包成原生桌面應用。

#### 系統需求
- **macOS 10.13+** 或 **Windows 10+** 或 **Linux**
- **Rust 工具鏈**（macOS 和 Linux）
- **Node.js 14+**

#### 在 macOS 上安裝 Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

#### 構建桌面應用
```bash
cd ~/HKBU\ Hack/PetTimer

# 開發模式（帶熱重載）
npm run tauri:dev

# 構建發行版本（.app 文件）
npm run tauri:build
```

構建完成後，應用會在以下位置：
```
src-tauri/target/release/bundle/macos/PetTimer.app
```

#### 優點 ✅
- 輕量級（約 50MB）
- 離線運行
- 原生性能
- 自動更新支持
- 桌面集成

#### 缺點 ❌
- 需要安裝 Rust
- 首次構建較慢

---

### 方式 2️⃣：使用 Docker 容器運行

Docker 允許你將應用打包為容器，可以在任何安裝了 Docker 的機器上運行。

#### 系統需求
- **Docker**（[下載](https://www.docker.com/products/docker-desktop)）
- **Docker Compose**（通常與 Docker Desktop 一起安裝）

#### 使用 Docker 運行

**單個容器運行：**
```bash
cd ~/HKBU\ Hack/PetTimer

# 構建 Docker 鏡像
npm run docker:build

# 運行容器
npm run docker:run

# 訪問應用
# 打開瀏覽器到 http://localhost:3000
```

**使用 Docker Compose（推薦）：**
```bash
cd ~/HKBU\ Hack/PetTimer

# 啟動容器
npm run docker:compose

# 訪問應用
# 打開瀏覽器到 http://localhost:3000

# 停止容器
docker-compose down

# 查看日誌
docker-compose logs -f

# 重啟容器
docker-compose restart
```

#### 自定義 Docker 設置

編輯 `docker-compose.yml` 來修改：
- 端口號（默認：3000）
- 環境變數
- 重啟策略

#### 優點 ✅
- 跨平臺（Windows、macOS、Linux）
- 簡易部署
- 自動化可靠性
- 易於團隊共享

#### 缺點 ❌
- 需要安裝 Docker
- 相比桌面應用稍慢
- 需要瀏覽器訪問

---

### 方式 3️⃣：網頁版應用（最簡單）

直接在瀏覽器中運行，無需構建。

#### 運行開發版本
```bash
cd ~/HKBU\ Hack/PetTimer
npm run dev

# 訪問
# http://localhost:5173
```

#### 構建生產版本
```bash
npm run build

# 預覽生產版本
npm run preview

# 訪問
# http://localhost:4173
```

#### 部署到 Web 服務器

構建後，`dist` 文件夾中的所有文件可以部署到任何靜態網站主機：

##### 部署到 Netlify
```bash
# 1. 在 https://app.netlify.com 登錄/註冊
# 2. 點擊 "New site from Git"
# 3. 連接你的 GitHub 倉庫
# 4. 設置構建命令：npm run build
# 5. 設置發佈目錄：dist
```

##### 部署到 Vercel
```bash
npm i -g vercel
vercel

# 按照提示完成部署
```

##### 部署到 GitHub Pages
```bash
# 更新 vite.config.ts
# base: '/PetTimer/'

npm run build

# 將 dist 文件夾的內容推送到 gh-pages 分支
```

#### 優點 ✅
- 最簡單快速
- 無需安裝任何軟體（除了 Node.js）
- 易於部署到任何地方
- 適合協作開發

#### 缺點 ❌
- 需要運行開發服務器
- 離線不可用
- 依賴網絡連接

---

## 對比表

| 功能 | Tauri | Docker | 網頁版 |
|------|--------|---------|--------|
| 桌面應用 | ✅ | ❌ | ❌ |
| 跨平臺 | ✅ | ✅ | ✅ |
| 離線運行 | ✅ | ❌ | ❌ |
| 設置難度 | 中 | 低 | 低 |
| 應用大小 | 50MB | 100MB+ | 無 |
| 啟動速度 | ⚡⚡⚡ | ⚡⚡ | ⚡ |
| 團隊部署 | ❌ | ✅ | ✅ |

---

## 推薦用途

### 使用 Tauri 如果你想要：
- 無依賴的獨立應用
- 最佳性能
- 分發給不懂技術的用戶
- 離線功能

### 使用 Docker 如果你想要：
- 在服務器上部署
- 自動化和可靠性
- 容易地分享給團隊
- 避免"在我的機器上可以運行"的問題

### 使用網頁版如果你想要：
- 快速開發
- 簡易測試
- 數據同步（與 Web 服務）
- 即時協作

---

## 常見問題

### Q: 使用 Tauri 時出現 rustc 錯誤？
A: 確保 Rust 已正確安裝：
```bash
rustc --version
cargo --version
```

如果未安裝，運行：
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Q: Docker 容器無法啟動？
A: 檢查日誌：
```bash
docker-compose logs pettimer
```

確保端口 3000 未被佔用。

### Q: 可以同時運行多種方式嗎？
A: 可以，只要使用不同的端口：
- Vite 開發：5173
- Docker：3000（可修改）
- Tauri：原生應用，無端口

### Q: 應用佔用多少磁盤空間？
A: 
- Tauri：約 50MB
- Docker：約 100-150MB
- 網頁版：約 1-2MB

---

## 環境變數

所有方式都支持以下環境變數：

```bash
# 開發模式
NODE_ENV=development

# 生產模式
NODE_ENV=production

# API 端點（未來連接後端時使用）
VITE_API_URL=http://localhost:8000
```

---

## 後續更新

當你更新代碼時：

### Tauri：
```bash
npm run tauri:build
# 再次構建並替換現有的 .app 文件
```

### Docker：
```bash
npm run docker:build  # 重新構建鏡像
npm run docker:compose  # 重新啟動容器
```

### 網頁版：
```bash
npm run build
# 重新部署 dist 文件夾
```

---

## 下一步

1. **選擇你的部署方式** 👆
2. **按照指南設置** 📝
3. **分享給朋友和家人** 🎉
4. **收集反饋並改進** ✨

---

**祝你使用 PetTimer！🐾**

如有問題，請查看各個工具的官方文檔：
- [Tauri 官方文檔](https://tauri.app/)
- [Docker 官方文檔](https://docs.docker.com/)
- [Vite 官方文檔](https://vitejs.dev/)
