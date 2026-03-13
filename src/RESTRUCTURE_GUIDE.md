# 🎯 LocalFelo Folder Restructure Guide

## What This Does
This script automatically moves all your application code into the `/src/` folder to match standard Vite structure and fix all import path issues.

---

## 📥 STEP 1: Download Your Project

1. **Download from Figma Make** (the button in the UI)
2. **Extract the ZIP file** to your desired location
3. **Open the folder in VS Code**

---

## 🪟 FOR WINDOWS USERS

### Option A: Using PowerShell (Recommended)

1. **Open PowerShell** in your project folder:
   - In VS Code: Press `` Ctrl + ` `` (backtick) to open terminal
   - OR right-click the project folder → "Open in Terminal"

2. **Run the script:**
   ```powershell
   .\restructure-windows.ps1
   ```

3. **If you get "execution policy" error**, run this first:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
   Then run the script again.

### Option B: Using Command Prompt

1. **Open Command Prompt** in your project folder
2. **Run:**
   ```cmd
   powershell -ExecutionPolicy Bypass -File restructure-windows.ps1
   ```

---

## 🍎 FOR MAC USERS

1. **Open Terminal** in your project folder:
   - In VS Code: Press `` Ctrl + ` `` (backtick) to open terminal
   - OR right-click the project folder → "New Terminal at Folder"

2. **Make the script executable:**
   ```bash
   chmod +x restructure-unix.sh
   ```

3. **Run the script:**
   ```bash
   ./restructure-unix.sh
   ```

---

## 🐧 FOR LINUX USERS

Same as Mac:

```bash
chmod +x restructure-unix.sh
./restructure-unix.sh
```

---

## ✅ After Running the Script

You should see output like:

```
🚀 Starting LocalFelo folder restructure...

✅ /src/ folder ready
✅ Moved /App.tsx → /src/App.tsx
✅ Moved components → src/components
✅ Moved screens → src/screens
✅ Moved services → src/services
...

✅ ✅ ✅ RESTRUCTURE COMPLETE! ✅ ✅ ✅
```

---

## 🎯 Final Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

3. **Your app should start without any import errors!** 🎉

---

## 📁 Final Folder Structure

After running the script, your structure will be:

```
localfelo/
├── src/
│   ├── App.tsx                 ← Main app component
│   ├── main.tsx                ← Entry point
│   ├── components/             ← All components
│   ├── screens/                ← All screens
│   ├── services/               ← API services
│   ├── hooks/                  ← Custom hooks
│   ├── lib/                    ← Libraries
│   ├── utils/                  ← Utilities
│   ├── types/                  ← TypeScript types
│   ├── constants/              ← Constants
│   ├── data/                   ← Static data
│   ├── config/                 ← Configuration
│   ├── styles/
│   │   └── globals.css         ← Global styles
│   └── vite-env.d.ts           ← Vite types
├── public/                     ← Public assets
├── index.html                  ← HTML template
├── vite.config.ts              ← Vite config
├── tsconfig.json               ← TypeScript config
└── package.json                ← Dependencies
```

---

## ❓ Troubleshooting

### Script won't run on Windows?
- Make sure you're using **PowerShell**, not Command Prompt
- Run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

### Script won't run on Mac/Linux?
- Make sure you made it executable: `chmod +x restructure-unix.sh`
- Try running with bash explicitly: `bash restructure-unix.sh`

### Still getting import errors?
- Make sure you ran `npm install` after restructuring
- Check that `/src/styles/globals.css` exists
- Restart VS Code and the dev server

---

## 🆘 Need Help?

If the script doesn't work, you can **manually move folders**:

1. Create a `/src/` folder if it doesn't exist
2. Move these from root into `/src/`:
   - `App.tsx`
   - `components/`
   - `screens/`
   - `services/`
   - `hooks/`
   - `lib/`
   - `utils/`
   - `types/`
   - `constants/`
   - `data/`
   - `config/`
3. Delete duplicate `main.tsx` and `vite-env.d.ts` from root (keep `/src/` versions)
4. Run `npm install` and `npm run dev`

---

**Created by LocalFelo Team** 🚀
