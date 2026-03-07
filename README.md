# 🐾 PetTimer - 寵物養成 + 番茄鐘時間管理應用

**English Description:** PetTimer is a gamified productivity app that combines a Pomodoro timer, virtual pet care, goal tracking, daily check-ins, and AI-powered planning to make studying and time management more engaging.

## 📱 應用概述

**PetTimer** 是一個結合寵物養成遊戲與番茄工作法的創新時間管理應用。用戶可以選擇自己的虛擬寵物（狐狸、貓咪或小狗），透過完成 25 分鐘的專注時間段來照顧和升級寵物，同時追蹤個人目標和日常成就。

### 核心概念

**番茄工作法 + 寵物照顧**
- 每完成一個 25 分鐘的番茄鐘，用戶就能賺取「火焰」(🔥) 和「硬幣」(🪙)
- 用硬幣購買食物、衣服等物品來照顧寵物
- 寵物的健康狀況會根據用戶的專注表現改變

---

## ✨ 主要功能

### 1. 🐾 寵物養成系統
- **寵物選擇**：選擇狐狸、貓咪或小狗
- **寵物互動**：
  - 點擊寵物可以撫摸它，獲得反應（例如「汪汪！😄」）
  - 寵物會隨時間變得飢餓和疲倦
  - 餵食寵物需要消耗硬幣
- **狀態管理**：
  - 🥗 飢餓度：隨時間增加，餵食可降低
  - ❤️ 幸福度：撫摸和餵食可增加
  - ⚡ 能量：隨時間消耗，睡眠可恢復

### 2. 🔥 番茄工作法計時器
- **25 分鐘專注時間**：使用經典的番茄工作法
- **視覺進度圓圈**：實時展示剩餘時間和進度
- **完成獎勵**：
  - 獲得 **1 火焰** (🔥)
  - 獲得 **5 硬幣** (🪙)
  - 可選：關聯目標以追蹤進度
- **4 個番茄鐘 = 1 次長休息**提示

### 3. 🎯 目標追蹤系統
- **創建目標**：設定想要完成的任務
  - 工作、學習、健康、興趣、個人成長等分類
  - 自動設定 7 天期限
- **子任務管理**：分解大目標為小步驟
- **進度計算**：自動計算完成百分比
- **短期目標建議**：AI 協助規劃日常行動步驟
- **目標狀態**：追蹤活躍、已完成、已放棄的目標

### 4. 📅 簽到日曆系統
- **每日簽到**：記錄每一天的專注成果
  - 當日焦點時間
  - 完成的活動標籤
  - 心情記錄（😄 快樂、😊 正常、😴 疲倦）
  - 個人筆記
- **視覺日曆**：
  - 月份檢視，輕鬆看到簽到狀態
  - ✅ 標記已簽到的日期
  - 📸 可上傳照片
  - 📲 直接分享到 Instagram
- **連續簽到追蹤**：🔥 火焰計數器顯示連續簽到天數

### 5. 🛍️ 商店系統
- **商品分類**：
  - 🍖 食物（骨頭、魚、蛋糕、壽司等）
  - 👕 衣服（小帽子、披風、皇冠等）
  - 🎁 玩具（球、毛球、飛盤等）
- **稀有度等級**：普通、稀有、史詩
- **成本**：根據稀有度調整（10-150 硬幣）
- **購買限制**：檢查硬幣充足

### 6. 👤 個人資料頁面
- **寵物詳情**：
  - 寵物名稱、等級、經驗值
  - 等級進度百分比
- **統計數據**：
  - 完成的番茄鐘數
  - 連續簽到天數
  - 總硬幣數
  - 總火焰數

---

## 🎨 UI/UX 設計特色

### 卡通風格
- **色彩搭配**：充滿活力的漸變背景（紫色→粉紅色→藍色）
- **合適的字體**：使用友善的「Fredoka」字體
- **動畫效果**：
  - 寵物跳動動畫 🐕
  - 按鈕按下效果
  - 進度圓圈平滑過渡
  - 火焰/光暈特效

### 響應式設計
- 桌面版：3 列網格佈局
- 平板版：2 列網格佈局
- 手機版：1 列堆疊佈局

### 導航結構
- **頂部导航栏**（粘性固定）：
  - 應用 Logo
  - 5 個主要頁面按鈕
  - 實時硬幣和火焰顯示
  - 當前頁面高亮

---

## 🛠️ 技術棧

### 前端框架
- **React 18**：使用函數式組件和 Hooks
- **TypeScript**：完整的型別檢查
- **Vite**：快速的開發和構建工具

### 狀態管理
- **Zustand**：輕量級的全局狀態管理
- **localStorage**：持久化保存用戶數據

### 樣式和 UI
- **Tailwind CSS**：工具優先的樣式框架
- **Lucide React**：美觀的圖標庫
- **自定義動畫**：CSS 關鍵幀和 Tailwind 動畫

---

## 🤖 Qwen AI 設定（本機開發）

AI 功能透過 Vite 開發代理呼叫 DashScope，避免瀏覽器 CORS 導致 `NetworkError`。

1. 建立本機環境變數檔案：

```bash
cp .env.example .env
```

2. 在 `.env` 內填入你的金鑰（兩種鍵名都可）：

```bash
# 推薦（給 Vite 開發代理）
DASHSCOPE_API_KEY="你的 DashScope API Key"

# 或者（前端/桌面端相容）
VITE_DASHSCOPE_API_KEY="你的 DashScope API Key"
```

3. 重新啟動開發伺服器：

```bash
npm run dev
```

如果兩者都未設定（`DASHSCOPE_API_KEY` 與 `VITE_DASHSCOPE_API_KEY`），AI 請求會失敗。

## 🌍 已部署版本（給評審直接使用）

如果你要讓評審「不用跑程式」直接測試，建議部署為：

- 前端：Vercel / Netlify
- 後端：Render / Railway（提供 `/api/auth`、`/api/email`、`/api/qwen`）

### 1) 後端環境變數（部署平台）

在後端平台設定：

```env
PORT=3001
FRONTEND_URL=https://你的前端網址
DASHSCOPE_API_KEY=你的DashScopeKey
JWT_SECRET=一段隨機字串
```

> `DASHSCOPE_API_KEY` 只放在後端平台，不要放 GitHub。

### 2) 前端環境變數（部署平台）

```env
VITE_API_BASE_URL=https://你的後端網址
```

前端會透過 `VITE_API_BASE_URL` 呼叫：

- `${VITE_API_BASE_URL}/api/auth`
- `${VITE_API_BASE_URL}/api/qwen`

### 3) 提交給評審時提供

- GitHub repo 連結（不含任何 secret）
- 已部署 Demo URL
- （如需要）測試帳號

這樣評審只要打開網址就能用，不需要本地配置 `.env`。

### 我幫你做到哪一步？

我已經在專案加好部署配置檔：

- `render.yaml`（後端 Render 配置）
- `vercel.json`（前端 Vercel SPA 路由配置）

你仍然需要在 Render / Vercel 網站上填入你自己的環境變數（尤其是 `DASHSCOPE_API_KEY`）。

### 最簡單部署步驟（5-10 分鐘）

1. 推送最新代碼到 GitHub（已完成可跳過）
2. Render：
   - New + → Blueprint
   - 選 `PetTimer` repo
   - 建立後在 Environment 手動填：
     - `DASHSCOPE_API_KEY`
     - `JWT_SECRET`
     - `FRONTEND_URL`（先可留空，部署前端後再回填）
   - Deploy 後拿到後端網址（例如 `https://pettimer-backend.onrender.com`）
3. Vercel：
   - Add New Project → Import `PetTimer`
   - Framework 選 Vite（通常自動）
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables 加入：
     - `VITE_API_BASE_URL=https://你的後端網址`
   - Deploy，拿到前端網址
4. 回 Render，把 `FRONTEND_URL` 更新為你的前端網址，再 Redeploy 一次

完成後，前端網址就是你可以交給評審的 live demo link。

### 自定義 Hooks
- `usePetState`：寵物狀態的自動管理
- `usePomodoro`：番茄鐘計時器邏輯
- `useGoalProgress`：目標進度計算
- `useCheckInStreak`：連續簽到計數
- `usePetReaction`：寵物反應系統

---

## 📂 項目結構

```
PetTimer/
├── src/
│   ├── components/          # React 組件
│   │   ├── PetCard.tsx      # 寵物卡片和互動
│   │   ├── PomodoroTimer.tsx # 番茄鐘計時器
│   │   ├── GoalTracker.tsx   # 目標追蹤
│   │   ├── CheckInCalendar.tsx # 簽到日曆
│   │   ├── Shop.tsx          # 商店購物
│   │   ├── NavBar.tsx        # 導航欄
│   │   └── PetSelector.tsx   # 寵物選擇
│   ├── hooks/                # 自定義 React Hooks
│   │   └── index.ts
│   ├── store/                # Zustand 狀態管理
│   │   └── appStore.ts
│   ├── types/                # TypeScript 型別定義
│   │   └── index.ts
│   ├── App.tsx               # 主應用邏輯
│   ├── main.tsx              # 應用入口
│   └── index.css             # 全局樣式
├── public/                   # 公共資源
├── index.html                # HTML 模板
├── package.json              # 項目配置
├── tsconfig.json             # TypeScript 配置
├── vite.config.ts            # Vite 配置
├── tailwind.config.js        # Tailwind 配置
└── postcss.config.js         # PostCSS 配置
```

---

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 啟動開發服務器
```bash
npm run dev
```

應用將在 http://localhost:5173 開啟

### 3. 構建生產版本
```bash
npm run build
```

---

## 📊 數據結構

### 寵物 (Pet)
```typescript
interface Pet {
  id: string;
  type: 'fox' | 'cat' | 'dog';
  name: string;
  level: number;
  experience: number;
  hunger: number;        // 0-100
  happiness: number;     // 0-100
  energy: number;        // 0-100
  lastFed: Date;
  lastPetted: Date;
  items: PetItem[];
}
```

### 目標 (Goal)
```typescript
interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: Date;
  progress: number;      // 0-100
  subtasks: Subtask[];
  shortTermGoals: string[];
  createdAt: Date;
  status: 'active' | 'completed' | 'abandoned';
}
```

### 簽到記錄 (CheckInRecord)
```typescript
interface CheckInRecord {
  id: string;
  date: Date;
  focusTime: number;     // 分鐘
  activities: string[];
  achievement?: string;
  photoUrl?: string;
  mood: 'happy' | 'normal' | 'tired';
  notes?: string;
}
```

---

## 💾 本地存儲

應用使用 `localStorage` 保存：
- 用戶數據
- 寵物狀態
- 目標列表
- 簽到歷史
- 硬幣和火焰計數

所有數據都存儲在瀏覽器的本地存儲中，可離線使用。

---

## 🎮 使用流程

### 首次使用
1. 🎯 選擇寵物類型（狐狸、貓咪、小狗）
2. 📝 給寵物取個名字
3. 🚀 點擊「開始冒險」

### 日常使用
1. **首頁**：查看寵物狀態，開始番茄鐘
2. **目標**：設定和追蹤目標進度
3. **簽到**：記錄日常成就和心情
4. **商店**：用硬幣購買物品
5. **個人資料**：查看統計數據和成就

### 進度循環
```
完成番茄鐘 → 獲得火焰 + 硬幣
         ↓
購買寵物物品 → 提升幸福度
         ↓
每日簽到 → 增加連續天數
         ↓
伸展目標 → 獲得成就感
```

---

## 🎯 進階功能建議（未來更新）

- AI 目標規劃助手（GPT 集成）
- 社交功能：與朋友分享進度
- 成就徽章系統
- 寵物進化和變身
- 多寵物管理
- 統計圖表和數據可視化
- 深色模式/淺色模式
- 多語言支持
- 推播提醒

---

## 📞 技術支持

如有問題或建議，請提交 issue 或進行 pull request。

---

## 📄 許可證

MIT License

---

**祝你在 PetTimer 中度過一個充滿生產力的時光！🐾✨**
