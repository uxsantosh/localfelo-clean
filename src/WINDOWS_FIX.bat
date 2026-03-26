@echo off
echo ============================================
echo LocalFelo - Windows Cache Clear Fix
echo ============================================
echo.
echo This will:
echo 1. Delete node_modules
echo 2. Delete .vite cache
echo 3. Delete dist folder
echo 4. Delete package-lock.json
echo 5. Reinstall dependencies
echo.
pause

echo.
echo [1/5] Removing node_modules...
if exist node_modules rmdir /s /q node_modules
echo Done!

echo.
echo [2/5] Removing .vite cache...
if exist .vite rmdir /s /q .vite
echo Done!

echo.
echo [3/5] Removing dist folder...
if exist dist rmdir /s /q dist
echo Done!

echo.
echo [4/5] Removing package-lock.json...
if exist package-lock.json del /f /q package-lock.json
echo Done!

echo.
echo [5/5] Reinstalling dependencies...
call npm install

echo.
echo ============================================
echo All done! Now run: npm run dev
echo ============================================
pause
