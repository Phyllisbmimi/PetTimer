# PetTimer Backend Server

Backend API server for PetTimer application with email verification and user authentication.

## 🚀 Features

- ✅ User Registration & Login
- ✅ Email Verification with real email sending
- ✅ Password Reset via email
- ✅ JWT Authentication
- ✅ CORS enabled for frontend
- ✅ Support for multiple email providers (Gmail, SendGrid, Mailgun)

## 📦 Installation

```bash
cd server
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and configure:

### Qwen AI Proxy (Required for AI features)

```env
DASHSCOPE_API_KEY=your-dashscope-api-key
```

### Option 1: Gmail (Easiest for testing)

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Gmail Setup:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate a new app password
5. Use that password in `.env`

### Option 2: SendGrid (Recommended for production)

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-api-key
```

**SendGrid Setup:**
1. Sign up at https://sendgrid.com (free 100 emails/day)
2. Create API key
3. Verify sender identity

### Option 3: Mailgun

```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=your-domain.mailgun.org
```

## 🏃 Running the Server

### Development (with auto-reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

Server will run on `http://localhost:3001`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Authentication

#### Register User
```
POST /api/auth/register
Body: { email, password, username }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
```

#### Verify Email
```
POST /api/auth/verify-email
Body: { email }
```

#### Reset Password
```
POST /api/auth/reset-password
Body: { email, newPassword }
```

### Email

#### Send Verification Code
```
POST /api/email/send-verification
Body: { email, type: "email-verification" | "password-reset" }
```

#### Verify Code
```
POST /api/email/verify-code
Body: { email, code }
```

#### Resend Code
```
POST /api/email/resend-code
Body: { email, type: "email-verification" | "password-reset" }
```

### AI Proxy

#### Qwen Chat Completions Proxy
```
POST /api/qwen
Body: OpenAI-compatible chat completion payload
```

## 🔧 Integration with Frontend

Update your frontend `authStore.ts` to call these APIs instead of using localStorage.

Example:
```typescript
// Send verification email
const response = await fetch('http://localhost:3001/api/email/send-verification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, type: 'email-verification' })
});
```

## 📝 Notes

- **Development**: Uses in-memory storage (data resets on restart)
- **Production**: Should use a real database (MongoDB, PostgreSQL, etc.)
- **Security**: Change JWT_SECRET in production
- **Email Limits**: Gmail has sending limits (500/day for free accounts)

## 🐛 Troubleshooting

### Email not sending?
1. Check `.env` configuration
2. For Gmail: Make sure app password is correct
3. Check console logs for error messages
4. Test email service with a simple script

### CORS errors?
- Update `FRONTEND_URL` in `.env` to match your frontend URL

## 📚 Next Steps

To make this production-ready:
1. Add database (MongoDB/PostgreSQL)
2. Add rate limiting
3. Add input validation middleware
4. Add logging (Winston/Morgan)
5. Deploy to cloud (Railway, Heroku, AWS)

## 🎉 Testing

Once running, test the health endpoint:
```bash
curl http://localhost:3001/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "PetTimer Backend is running!",
  "timestamp": "2026-03-07T..."
}
```
