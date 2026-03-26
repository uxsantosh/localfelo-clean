# 🔐 LocalFelo Credentials Setup Guide

## ⚠️ IMPORTANT: Credentials Removed from Repository

All hardcoded credentials have been removed from the codebase for security. You need to set up your own credentials to run the app.

---

## 📋 Quick Setup Steps

### 1. Create Environment File

Copy the example file:
```bash
cp .env.example .env.local
```

### 2. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your LocalFelo project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 3. Update .env.local

```env
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Restart Your Dev Server

```bash
npm run dev
```

---

## 🚀 For Deployment

### Netlify / Vercel / Cloudflare Pages

Add environment variables in your hosting dashboard:

**Netlify:**
1. Go to **Site settings** → **Environment variables**
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key

**Vercel:**
1. Go to **Settings** → **Environment Variables**
2. Add the same variables

**Cloudflare Pages:**
1. Go to **Settings** → **Environment variables**
2. Add the same variables

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env.local` file locally (never commit)
- Use environment variables for all secrets
- Add `.env.local` to `.gitignore` (already done)
- Change default admin password after first login

### ❌ DON'T:
- Never commit `.env`, `.env.local`, or any file with credentials
- Never hardcode credentials in source code
- Never share your service role key publicly
- Never commit files with passwords or API keys

---

## 🗂️ Files That Were Cleaned

The following files had hardcoded credentials removed:

1. ✅ `/lib/supabaseClient.ts` - Removed hardcoded Supabase URL and key
2. ✅ `/ADMIN_USER_DIRECT_CREATE.sql` - Deleted (contained admin password hash)
3. ✅ `/.gitignore` - Created to prevent credential files from being committed
4. ✅ `/.env.example` - Created as a template for credentials

---

## 📝 Admin Setup

After setting up credentials, you'll need to create an admin user:

1. **Sign up** with your email through the app
2. **Run this SQL** in Supabase SQL Editor:
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE email = 'your-email@example.com';
   ```
3. **Refresh the app** - you should now see admin options

**OR** use the password hash generator:
- Open `generate_password_hash.html` in your browser
- Enter your desired password
- Copy the generated SQL and run it in Supabase

---

## 🧪 Verify Setup

Run this in browser console on your app:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
```

Expected output:
```
Supabase URL: https://yourproject.supabase.co
Supabase Key: ✅ Set
```

---

## ❓ Troubleshooting

### "Supabase credentials missing or invalid"
- Check that `.env.local` exists
- Verify variable names start with `VITE_`
- Restart dev server after creating `.env.local`

### "fetch failed" or "network error"
- Verify Supabase URL is correct
- Check that your Supabase project is active
- Verify anon key is correct (no spaces or line breaks)

### Variables not loading
- File must be named `.env.local` (not `.env`)
- Variables must start with `VITE_` for Vite to expose them
- Restart dev server after any changes

---

## 📚 Additional Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- Admin setup: See `FINAL_ADMIN_SETUP.md`
- Password hash generator: `generate_password_hash.html`

---

**Last Updated:** January 11, 2025  
**Status:** ✅ Credentials secured, repository safe for git
