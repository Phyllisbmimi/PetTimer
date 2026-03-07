# 🚀 PetTimer - 快速開始指南

歡迎使用 PetTimer！本指南將幫助你開始使用這個應用。

---

## ⚡ 30 秒快速開始

### 1. 開始開發服務器
```bash
cd ~/HKBU\ Hack/PetTimer
. ~/.nvm/nvm.sh  # 僅需在第一次運行
npm run dev
```

### 2. 打開瀏覽器
```
http://localhost:5173
```

### 3. 選擇寵物並開始！ 🐾

---

## 📱 三種運行方式

### 選項 A：Web 應用（最快 ⚡）
```bash
npm run dev              # 開發，帶熱重載
npm run build            # 生產構建
npm run preview          # 預覽生產版本
```

### 選項 B：Docker 容器（最簡單 📦）
```bash
npm run docker:compose   # 啟動 Docker 容器
# 訪問 http://localhost:3000

docker-compose down      # 停止容器
```

### 選項 C：Tauri 桌面應用（最強大 🖥️）

首先安裝 Rust（僅需一次）：
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

然後運行：
```bash
npm run tauri:dev        # 開發模式
npm run tauri:build      # 構建發行版本
```

---

## 🌍 多語言支援

應用支援三種語言：
- 🇺🇸 **English**
- 🇭🇰 **粵語** (Cantonese)
- 🇨🇳 **中文** (Simplified Chinese)

在應用右上角使用旗幟按鈕切換語言！

---

## 📂 項目結構

```
PetTimer/
├── src/
│   ├── components/         # React 組件
│   │   ├── PetCard.tsx           # 寵物卡片
│   │   ├── PomodoroTimer.tsx      # 番茄鐘計時器
│   │   ├── GoalTracker.tsx        # 目標追蹤
│   │   ├── CheckInCalendar.tsx    # 簽到日曆
│   │   ├── Shop.tsx               # 商店
│   │   ├── NavBar.tsx             # 導航欄
│   │   ├── PetSelector.tsx        # 寵物選擇
│   │   └── LanguageSwitcher.tsx   # 語言切換
│   ├── hooks/              # 自定義 Hooks
│   ├── store/              # Zustand 狀態管理
│   ├── types/              # TypeScript 型別
│   ├── i18n/               # 國際化配置和翻譯
│   │   ├── config.ts             # i18n 配置
│   │   └── locales/              # 翻譯文件
│   │       ├── en.json           # 英文
│   │       ├── zh-HK.json        # 粵語
│   │       └── zh-CN.json        # 簡體中文
│   ├── App.tsx             # 主應用
│   ├── main.tsx            # 應用入點
│   └── index.css           # 全局樣式
├── package.json            # 項目配置
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # Tailwind CSS 配置
├── Dockerfile              # Docker 配置
├── docker-compose.yml      # Docker Compose 配置
├── tauri.conf.json         # Tauri 配置
├── README.md               # 詳細中文說明
├── GUIDE_ZH_HK.md          # 粵語使用指南
├── DEPLOYMENT.md           # 部署指南
├── MULTILINGUAL.md         # 多語言指南
└── SETUP.sh                # 設置腳本
```

---

## 🎯 核心功能

### 🐾 寵物養成
- 選擇喜愛的寵物：貓 🐱、狗 🐕、狐狸 🦊
- 照顧寵物：餵食、撫摸
- 監測狀態：飢餓度、幸福度、能量

### 🔥 番茄鐘計時器
- 25 分鐘專注時段
- 視覺進度圓圈
- 完成獲得火焰和硬幣

### 🎯 目標追蹤
- 創建自訂目標
- 子任務分解
- 進度百分比計算

### 📅 簽到日曆
- 每日簽到記錄
- 連續簽到計數
- 成就展示

### 🛍️ 商店系統
- 購買食物、衣服、玩具
- 稀有度等級
- 硬幣消費

---

## 🛠️ 技術棧

| 層級 | 技術 |
|------|------|
| **框架** | React 18 + TypeScript |
| **構建工具** | Vite |
| **樣式** | Tailwind CSS |
| **狀態管理** | Zustand |
| **國際化** | i18next + react-i18next |
| **圖標** | Lucide React |
| **字體** | Fredoka (Google Fonts) |
| **容器化** | Docker + Docker Compose |
| **桌面化** | Tauri |
| **數據持久化** | localStorage |

---

## 📚 文件導航

- **[README.md](README.md)** - 詳細的中文項目文檔
- **[GUIDE_ZH_HK.md](GUIDE_ZH_HK.md)** - 親切的粵語使用指南
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - 完整的部署指南（Web、Docker、Tauri）
- **[MULTILINGUAL.md](MULTILINGUAL.md)** - 多語言支援詳解

---

## 🎮 使用流程

```
1. 啟動應用
   ↓
2. 選擇寵物 🐾
   ↓
3. 給寵物取名
   ↓
4. 開始番茄鐘 ⏱️
   ↓
5. 完成時獲得獎勵 🔥💰
   ↓
6. 購買物品照顧寵物 🛍️
   ↓
7. 每日簽到記錄 📅
   ↓
8. 追蹤目標進度 🎯
   ↓
9. 享受成就感 🎉
```

---

## 💡 常用命令

### 開發
```bash
npm run dev              # 啟動開發服務器（熱重載）
npm run lint             # 檢查代碼質量
```

### 構建
```bash
npm run build            # Web 生產構建
npm run preview          # 預覽生產版本
```

### 部署
```bash
npm run docker:build     # 構建 Docker 鏡像
npm run docker:run       # 運行 Docker 容器
npm run docker:compose   # 使用 Docker Compose
npm run tauri:dev        # Tauri 開發模式
npm run tauri:build      # Tauri 生產構建
```

---

## 🌟 功能亮點

✨ **卡通友好設計**
- 充滿活力的顏色
- 流暢動畫效果
- Emoji 圖示

📱 **完全響應式**
- 桌面版（1200px+）
- 平板版（768px+）
- 手機版（全屏）

🌍 **多語言支援**
- 英文、粵語、簡體中文
- 自動語言檢測
- 持久化語言選擇

📊 **數據持久化**
- 所有數據保存到 localStorage
- 離線可用
- 無需後端

🎯 **完整的遊戲化**
- 寵物等級和經驗值
- 硬幣和火焰獎勵
- 成就徽章

---

## 🚀 下一步

### 立即開始
1. 運行 `npm run dev`
2. 選擇你的寵物
3. 開始專注

### 自訂應用
- 編輯 `tailwind.config.js` 修改顏色
- 編輯 `src/i18n/locales/*.json` 修改文字
- 添加新寵物到 `PetSelector.tsx`
- 添加新商品到 `Shop.tsx`

### 部署應用
見 [DEPLOYMENT.md](DEPLOYMENT.md) 瞭解三種部署方式

### 擴展功能
- 添加新語言
- 集成 AI 目標規劃
- 添加社交功能
- 實現成就系統

---

## 📞 需要幫助？

### 文件
- 📘 [完整項目文檔](README.md)
- 📗 [粵語使用指南](GUIDE_ZH_HK.md)
- 📙 [多語言指南](MULTILINGUAL.md)
- 📕 [部署指南](DEPLOYMENT.md)

### 常見問題

**Q: 應用無法啟動？**
A: 確保安裝了 Node.js：
```bash
node --version
npm --version
```

**Q: 英文菜單顯示亂碼？**
A: 清除 localStorage：
```javascript
localStorage.clear()
// 刷新頁面
```

**Q: 可以在手機上使用嗎？**
A: 可以！使用手機瀏覽器訪問網址，或在 Docker 中運行並通過網絡訪問。

**Q: 如何備份我的數據？**
A: 打開瀏覽器控制台：
```javascript
JSON.parse(localStorage.getItem('petTimer_user'))
```

---

## 🎉 祝賀！

你現在已經擁有一個**完整的寵物養成 + 時間管理應用**！🐾✨

### 已包含的功能：
✅ 寵物養成系統  
✅ 番茄鐘計時器  
✅ 目標追蹤  
✅ 簽到日曆  
✅ 商店系統  
✅ 多語言支援（英文/粵語/中文）  
✅ Web 應用  
✅ Docker 容器化  
✅ Tauri 桌面應用打包  

### 已準備完畢，可以：
🚀 開發新功能  
🎨 自訂設計  
🌐 部署到網絡  
📦 分享應用  

---

## 📝 進一步資源

- [React 官方文檔](https://react.dev)
- [TypeScript 手冊](https://www.typescriptlang.org/docs)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)
- [Zustand 文檔](https://github.com/pmndrs/zustand)
- [Vite 文檔](https://vitejs.dev)
- [i18next 文檔](https://www.i18next.com)
- [Tauri 文檔](https://tauri.app)

---

**使用 PetTimer，讓你的專注與寵物一起成長！🐾💪**

*祝你開發愉快！✨*
