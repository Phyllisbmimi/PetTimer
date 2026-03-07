# PetTimer 開發 + 更新說明

## 🚀 快速開始（三個命令）

### 方法 A：使用一鍵啟動腳本（推薦）
```bash
cd ~/HKBU\ Hack/PetTimer
./start.sh
```

### 方法 B：手動命令

1. **設置 API key（首次）**
```bash
# 編輯 .env 文件，填入你的 DashScope API key
vim .env
# 或在 VS Code 中打開 .env，填入 DASHSCOPE_API_KEY= 或 VITE_DASHSCOPE_API_KEY=
# 例如: DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxx
# 或: VITE_DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxx
```

2. **啟動 Web 開發版（推薦快速測試）**
```bash
cd ~/HKBU\ Hack/PetTimer
. ~/.nvm/nvm.sh
npm run dev
# 訪問 http://localhost:5173
```

3. **啟動桌面應用開發版**
```bash
cd ~/HKBU\ Hack/PetTimer
. "$HOME/.cargo/env"
. ~/.nvm/nvm.sh
npm run tauri:dev
```

---

## 🔄 代碼更新機制

### ✅ 開發模式（自動更新）
**Web 版本 (`npm run dev`)** 和 **App 開發版本 (`npm run tauri:dev`)** 都有**熱重載**：
- 修改 JavaScript/TypeScript 文件 → **自動刷新**（無需手動重啟）
- 修改 CSS → **無閃爍更新**（直接應用樣式）
- 修改 React 組件 → **保留狀態更新**（不丟失數據）

### ❌ 生產版本（需要重新構建）
**打包的 App** (`npm run tauri:build`) 是**靜態版本**：
- 代碼更改 → 需要重新構建 (`npm run tauri:build`)
- 重新構建 → 生成新的 `.app` 文件
- 安裝新版本 → 覆蓋舊版本

---

## 📦 App 安裝流程

### 首次安裝
```bash
# 1. 構建（首次比較慢，約 5-10 分鐘）
npm run tauri:build

# 2. 生成的 App 位於：
#    - macOS: src-tauri/target/release/bundle/macos/PetTimer.app
#    - Windows: src-tauri/target/release/bundle/msi/PetTimer.exe
#    - Linux: src-tauri/target/release/bundle/deb/pettimer_*.deb

# 3. 手動安裝或雙擊 .app / .exe 安裝
```

### 更新 App
```bash
# 步驟 1：修改代碼
# 步驟 2：重新構建
npm run tauri:build

# 步驟 3：替換舊 App
# - macOS: 直接拖入 Applications 覆蓋
# - Windows: 執行新的 .exe 安裝程序
# - Linux: 重新安裝 .deb 文件

# ✅ 無需 "下載" 整個應用
# ✅ 只需重新構建 + 安裝新版本
```

### 不想重複安裝？
**使用開發模式**：
```bash
npm run tauri:dev
```
- ✅ 開發版本有熱重載
- ✅ 代碼改動自動刷新
- ✅ 無需重複構建
- ✅ 推薦用於開發流程

---

## 🔑 API Key 問題排查

### 報錯：`401 - 授權失敗`

**原因 1：Key 為空**
```bash
# 檢查 .env 是否有 DASHSCOPE_API_KEY 或 VITE_DASHSCOPE_API_KEY 值
cat .env | grep -E "DASHSCOPE_API_KEY|VITE_DASHSCOPE_API_KEY"

# 應該看到其中一個：
# DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxx
# 或 VITE_DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxx
```

**原因 2：Key 無效**
```bash
# 確認你的 DashScope API key 是否正確
# 可在阿里雲控制台查詢或重新生成
```

**原因 3：Dev Server 未重啟**
```bash
# ✅ 修改 .env 後，必須重啟 dev server
# 停止當前運行 (Ctrl+C)
# 重新執行：npm run dev 或 ./start.sh
```

### 解決步驟
1. **編輯 .env**：填入新 key
2. **保存文件**
3. **停止 dev server**：按 `Ctrl+C`
4. **重新啟動**：`npm run dev` 或 `./start.sh`
5. **重新測試 AI**：在頁面點擊「AI Assistant」或「Goals」→「AI 分析」

---

## 📋 開發流程速查

| 需求 | 命令 | 自動更新？ |
|------|------|---------|
| 快速開發測試 | `npm run dev` | ✅ 是 |
| 桌面應用開發 | `npm run tauri:dev` | ✅ 是 |
| 發布生產版本 | `npm run tauri:build` | ❌ 否，需重新構建 |
| 只改代碼，不想重啟 | 上述任一模式 + 保存文件 | ✅ 自動熱重載 |

---

## 常見問題

### Q1：每次都要下載 App 嗎？
**A：不用。選擇開發模式就有熱重載，無需重複安裝。**

### Q2：生產 App 如何自動更新？
**A：需要實現「自動更新」功能（目前無）。當前需要手動重新構建 + 安裝。**

### Q3：App 跟 Web 版本有區別嗎？
**A：完全相同的代碼。App = Web + Tauri 桌面外殼。**

### Q4：能只更新代碼，不更新 App 文件嗎？
**A：開發時可以。當你運行 `npm run tauri:dev` 時，代碼改動直接反映在開發應用中。**

---

## 下一步

1. **編輯 `.env` 填入 API key**
2. **執行 `./start.sh`**
3. **選擇模式運行**
4. **享受熱重載開發！**
