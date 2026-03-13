# LocalFelo - Windows PowerShell Restructure Script
# Run this in PowerShell from your project ROOT folder

Write-Host "🚀 Starting LocalFelo folder restructure..." -ForegroundColor Green
Write-Host ""

# Create /src/ folder if it doesn't exist
if (-not (Test-Path "src")) {
    New-Item -ItemType Directory -Path "src" -Force | Out-Null
    Write-Host "✅ Created /src/ folder" -ForegroundColor Green
}

# Function to move folder safely
function Move-FolderSafely {
    param (
        [string]$Source,
        [string]$Destination
    )
    
    if (Test-Path $Source) {
        if (Test-Path $Destination) {
            Write-Host "⚠️  $Destination already exists, merging..." -ForegroundColor Yellow
            # Copy items and overwrite
            Copy-Item -Path "$Source\*" -Destination $Destination -Recurse -Force
            Remove-Item -Path $Source -Recurse -Force
        } else {
            Move-Item -Path $Source -Destination $Destination -Force
        }
        Write-Host "✅ Moved $Source → $Destination" -ForegroundColor Green
    } else {
        Write-Host "⏭️  Skipping $Source (doesn't exist)" -ForegroundColor Gray
    }
}

# Move App.tsx
if (Test-Path "App.tsx") {
    if (Test-Path "src/App.tsx") {
        Write-Host "⚠️  /src/App.tsx already exists, skipping..." -ForegroundColor Yellow
    } else {
        Move-Item -Path "App.tsx" -Destination "src/App.tsx" -Force
        Write-Host "✅ Moved /App.tsx → /src/App.tsx" -ForegroundColor Green
    }
} else {
    Write-Host "⏭️  Skipping App.tsx (doesn't exist)" -ForegroundColor Gray
}

# Move all folders into /src/
Write-Host ""
Write-Host "📁 Moving folders into /src/..." -ForegroundColor Cyan

Move-FolderSafely "components" "src/components"
Move-FolderSafely "screens" "src/screens"
Move-FolderSafely "services" "src/services"
Move-FolderSafely "hooks" "src/hooks"
Move-FolderSafely "lib" "src/lib"
Move-FolderSafely "utils" "src/utils"
Move-FolderSafely "types" "src/types"
Move-FolderSafely "constants" "src/constants"
Move-FolderSafely "data" "src/data"
Move-FolderSafely "assets" "src/assets"

# Delete duplicate config folders
if (Test-Path "config") {
    if (Test-Path "src/config") {
        Write-Host "⚠️  Found duplicate /config/ folder, removing root version..." -ForegroundColor Yellow
        Remove-Item -Path "config" -Recurse -Force
        Write-Host "✅ Removed duplicate /config/ folder" -ForegroundColor Green
    } else {
        Move-Item -Path "config" -Destination "src/config" -Force
        Write-Host "✅ Moved /config/ → /src/config/" -ForegroundColor Green
    }
}

# Delete old /styles/globals.css (keep /src/styles/globals.css)
if (Test-Path "styles/globals.css") {
    if (Test-Path "src/styles/globals.css") {
        Write-Host "⚠️  Removing duplicate /styles/globals.css..." -ForegroundColor Yellow
        Remove-Item -Path "styles/globals.css" -Force
        Write-Host "✅ Removed duplicate globals.css" -ForegroundColor Green
    }
}

# Delete duplicate root files
$filesToDelete = @("main.tsx", "vite-env.d.ts")
Write-Host ""
Write-Host "🗑️  Cleaning up duplicate root files..." -ForegroundColor Cyan

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "✅ Deleted /$file (duplicate exists in /src/)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ ✅ ✅ RESTRUCTURE COMPLETE! ✅ ✅ ✅" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npm install" -ForegroundColor White
Write-Host "   2. Run: npm run dev" -ForegroundColor White
Write-Host "   3. Your app should start without errors!" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your /src/ folder now contains all application code!" -ForegroundColor Green