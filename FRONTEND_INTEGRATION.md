# Frontend Integration Guide

## 如何將前端連接到後端

### 步驟 1: 配置郵件服務

編輯 `server/.env` 文件，設置你的郵件服務：

**使用 Gmail（最簡單）：**
1. 訪問 https://myaccount.google.com/security
2. 啟用"兩步驟驗證"
3. 搜索"應用程序密碼"
4. 生成一個新的應用程序密碼
5. 更新 `.env`:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 步驟 2: 更新前端代碼

在 `src/store/authStore.ts` 中，修改以下函數以調用後端 API：

#### 1. 發送驗證碼
將 `sendVerificationEmail` 改為：

```typescript
sendVerificationEmail: async (email: string) => {
  try {
    const response = await fetch('http://localhost:3001/api/email/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'email-verification' })
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
},
```

#### 2. 驗證郵件
將 `verifyEmail` 改為：

```typescript
verifyEmail: async (email: string, code: string) => {
  try {
    const response = await fetch('http://localhost:3001/api/email/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    
    const data = await response.json();
    if (!data.success) {
      return false;
    }
    
    // 標記用戶郵箱已驗證
    await fetch('http://localhost:3001/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const users = JSON.parse(localStorage.getItem('petTimer_users') || '{}');
    const user = users[email];
    if (user) {
      user.emailVerified = true;
      localStorage.setItem('petTimer_users', JSON.stringify(users));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to verify email:', error);
    return false;
  }
},
```

#### 3. 註冊用戶
將 `register` 改為：

```typescript
register: async (email: string, password: string, username: string) => {
  try {
    // 調用後端 API
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }
    
    // 同時保存到 localStorage（向後兼容）
    const users = JSON.parse(localStorage.getItem('petTimer_users') || '{}');
    users[email] = {
      email,
      password, // 注意：生產環境不應該在前端存儲密碼
      username,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('petTimer_users', JSON.stringify(users));
    
    return data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
},
```

#### 4. 密碼重置
將 `sendPasswordResetEmail` 改為：

```typescript
sendPasswordResetEmail: async (email: string) => {
  try {
    const response = await fetch('http://localhost:3001/api/email/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'password-reset' })
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to send reset email:', error);
    throw error;
  }
},
```

### 步驟 3: 移除開發模式面板（可選）

一旦郵件服務配置好，你可以從以下文件中移除開發模式代碼顯示：
- `src/components/Auth/VerifyEmailPage.tsx`
- `src/components/Auth/PasswordResetPage.tsx`

刪除 `showDevCode` 相關的代碼和黃色面板。

### 步驟 4: 測試流程

1. 確保後端和前端都在運行：
   - 後端: `cd server && npm run dev` (端口 3001)
   - 前端: `npm run dev` (端口 5174)

2. 註冊新用戶
3. 檢查你的郵箱（你應該會收到驗證碼郵件）
4. 輸入驗證碼完成註冊
5. 登錄系統

### 故障排除

**沒有收到郵件？**
- 檢查 `server/.env` 配置
- 查看後端控制台的錯誤信息
- Gmail 用戶：確認使用的是應用程序密碼，不是帳戶密碼
- 檢查垃圾郵件文件夾

**CORS 錯誤？**
- 確保 `server/.env` 中的 `FRONTEND_URL` 設置為 `http://localhost:5174`

**API 調用失敗？**
- 確認後端服務器在 http://localhost:3001 運行
- 測試健康檢查：`curl http://localhost:3001/api/health`

### 生產環境部署

要部署到生產環境，需要：

1. **數據庫**: 將內存存儲改為 MongoDB 或 PostgreSQL
2. **郵件服務**: 使用 SendGrid（推薦）
3. **環境變量**: 更新所有 URL 為生產域名
4. **HTTPS**: 使用 SSL 證書
5. **部署平台**: Railway, Heroku, AWS, Vercel 等

詳細部署指南請參考 `server/README.md`

## 當前狀態

✅ 後端服務器運行在: http://localhost:3001
✅ 前端應用運行在: http://localhost:5174
✅ API 端點已準備好
⚠️ 需要配置郵件服務才能發送真實郵件
