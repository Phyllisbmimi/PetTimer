# 🌍 PetTimer 多語言指南

## 支援的語言

PetTimer 現在支援 3 種語言：

| 語言 | 代碼 | 旗幟 | 備註 |
|------|------|------|------|
| **English** | `en` | 🇺🇸 | 完整版本 |
| **粵語** | `zh-HK` | 🇭🇰 | 香港粵語 |
| **簡體中文** | `zh-CN` | 🇨🇳 | 大陸簡體中文 |

---

## 使用語言切換器

### 在應用中切換語言

1. 看導航欄的右上角
2. 你會看到 🌍 圖標和三個旗幟按鈕
3. 點擊你想要的語言旗幟

```
🌍 [🇺🇸] [🇭🇰] [🇨🇳]
```

- **🇺🇸** - English
- **🇭🇰** - 粵語 (Cantonese)
- **🇨🇳** - 中文 (Simplified Chinese)

### 自動偵測

在你首次使用應用時，它會自動偵測你的瀏覽器語言：

- 如果是粵語用戶 → 自動選擇粵語
- 如果是中文用戶 → 自動選擇簡體中文
- 其他用戶 → 預設英文

你可以隨時手動切換！

---

## 翻譯內容

### 已翻譯的內容

所有以下內容都已翻譯成三種語言：

- ✅ **導航菜單**（首頁、目標、簽到、商店、個人）
- ✅ **寵物系統**（名字、狀態、互動）
- ✅ **番茄鐘計時器**（標題、按鈕、提示）
- ✅ **目標追蹤**（分類、進度描述）
- ✅ **簽到日曆**（心情、活動、入場）
- ✅ **商店系統**（物品名稱、價格提示）
- ✅ **個人資料**（統計標籤、成就）
- ✅ **寵物選擇**（介紹、說明）
- ✅ **語言選擇器**

### 每個語言的文件位置

```
src/i18n/locales/
├── en.json          # 英文
├── zh-HK.json       # 粵語
└── zh-CN.json       # 簡體中文
```

---

## 翻譯示例

### 首頁

| 字段 | 英文 | 粵語 | 簡體中文 |
|------|------|------|----------|
| 標題 | Focus Time | 🔥 專注時間 | 🔥 专注时间 |
| 開始 | Start | 開始 | 开始 |
| 完成 | Completed! | 🎉 完成！ | 🎉 完成！ |

### 寵物狀態

| 狀態 | 英文 | 粵語 | 簡體中文 |
|------|------|------|----------|
| 飢餓 | Hunger | 飢餓度 | 饥饿度 |
| 幸福 | Happiness | 幸福度 | 幸福度 |
| 能量 | Energy | 能量 | 能量 |

### 商店分類

| 分類 | 英文 | 粵語 | 簡體中文 |
|------|------|------|----------|
| 食物 | 🍖 Food | 🍖 食物 | 🍖 食物 |
| 衣服 | 👕 Clothing | 👕 衣服 | 👕 衣服 |
| 玩具 | 🎁 Toys | 🎁 玩具 | 🎁 玩具 |

---

## 語言持久化

### 你選擇的語言會被保存

應用會記住你選擇的語言，下次打開時會使用同一語言：

```javascript
// 語言設定存儲在 localStorage 中：
localStorage.getItem('petTimer_language')

// 例如：
// "en" → 英文
// "zh-HK" → 粵語
// "zh-CN" → 簡體中文
```

你可以手動清除並重置：
```javascript
localStorage.removeItem('petTimer_language')
// 重新載入應用 - 它會自動偵測雅言言
```

---

## 編輯翻譯

如果你想**編輯或改進翻譯**：

### 步驟 1：打開對應的語言文件
```
src/i18n/locales/en.json      # English
src/i18n/locales/zh-HK.json   # 粵語
src/i18n/locales/zh-CN.json   # 簡體中文
```

### 步驟 2：找到你想修改的字段
```json
{
  "home": {
    "title": "Focus Time",
    "start": "Start"
  }
}
```

### 步驟 3：修改文字並保存
```json
{
  "home": {
    "title": "My New Title",
    "start": "Begin"
  }
}
```

### 步驟 4：刷新應用查看更改

---

## 在代碼中使用翻譯

### 在 React 組件中使用

```tsx
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <button>{t('home.start')}</button>
    </div>
  );
};
```

### 使用變數替換

```tsx
// 在翻譯文件中
"profile": {
  "levelProgress": "Level {level} Progress"
}

// 在組件中
{t('profile.levelProgress', { level: 5 })}
// 輸出：Level 5 Progress
```

---

## 添加新語言

想要添加新語言嗎？以下是步驟：

### 步驟 1：創建新的語言文件
```
src/i18n/locales/fr.json  # 例如法語
```

### 步驟 2：複製英文文件的結構
```json
{
  "common": {
    "appName": "PetTimer",
    "loading": "Loading..."
  },
  // ... 其他部分
}
```

### 步驟 3：翻譯所有字段
```json
{
  "common": {
    "appName": "PetTimer",
    "loading": "Chargement..."
  }
}
```

### 步驟 4：在 `src/i18n/config.ts` 中註冊語言
```typescript
import frTranslation from './locales/fr.json';

const resources = {
  en: { translation: enTranslation },
  'zh-HK': { translation: zhHKTranslation },
  'zh-CN': { translation: zhCNTranslation },
  'fr': { translation: frTranslation }  // 新增
};
```

### 步驟 5：在 `LanguageSwitcher.tsx` 中添加按鈕
```tsx
const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh-HK', label: '粵語', flag: '🇭🇰' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' }  // 新增
];
```

---

## 語言鍵結構

所有翻譯都組織在以下結構中：

```
各組：
├── common         → 通用字段（應用名、通用按鈕）
├── nav            → 導航菜單
├── home           → 首頁
├── pet            → 寵物系統
├── goals          → 目標
├── checkin        → 簽到
├── shop           → 商店
├── profile        → 個人資料
├── petSelector    → 寵物選擇
└── language       → 語言選擇
```

---

## 常見問題

### Q: 應用沒有自動偵測到我的語言？
A: 這可能有以下原因：
1. 你的瀏覽器語言未在支援列表中
2. 你之前保存了一個語言設定

嘗試清除或手動選擇語言。

### Q: 我想貢獻新的翻譯？
A: 太棒了！請：
1. Fork 項目
2. 添加新的語言文件
3. 提交 Pull Request

### Q: 翻譯有誤/缺漏？
A: 歡迎報告！請在 GitHub 上提出 Issue。

### Q: 可以自定義語言別名嗎？
A: 可以，在 `config.ts` 中編輯語言代碼和映射。

---

## 技術細節

### 使用的庫
- **i18next** - 國際化框架
- **react-i18next** - React 綁定

### 語言檢測邏輯
```typescript
const getSavedLanguage = () => {
  // 1. 檢查 localStorage
  const saved = localStorage.getItem('petTimer_language');
  if (saved) return saved;

  // 2. 檢查瀏覽器語言
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh-hk')) return 'zh-HK';
  if (browserLang.startsWith('zh')) return 'zh-CN';
  if (browserLang.startsWith('en')) return 'en';
  
  // 3. 預設英文
  return 'en';
};
```

---

## 最佳實踐

✅ **應該做的：**
- 保持翻譯簡潔清晰
- 使用相同的術語風格
- 與原文長度相近
- 測試各種語言的 UI

❌ **不應該做的：**
- 直接使用谷歌翻譯（質量低）
- 混合多種方言
- 忽視文化差異
- 不測試真實使用

---

## 支援信息

多語言由 i18next 提供支援| 更多信息請訪問：
- [i18next 官方文檔](https://www.i18next.com/)
- [react-i18next 官方文檔](https://react.i18next.com/)

---

**祝你使用 PetTimer！🐾🌍**

選擇你喜歡的語言，開始專注吧！
