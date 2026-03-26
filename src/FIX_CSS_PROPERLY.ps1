# ========================================
# LocalFelo CSS Import Fix - PowerShell Script
# ========================================

Write-Host "🔍 LocalFelo CSS Structure Diagnosis" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Step 1: Check what exists
Write-Host "📁 Checking current CSS files..." -ForegroundColor Yellow

if (Test-Path "styles/globals.css") {
    Write-Host "  ✅ /styles/globals.css EXISTS (MAIN FILE - has Tailwind)" -ForegroundColor Green
} else {
    Write-Host "  ❌ /styles/globals.css MISSING" -ForegroundColor Red
}

if (Test-Path "src/styles/globals.css") {
    Write-Host "  ⚠️  /src/styles/globals.css EXISTS (DUPLICATE - different content)" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ /src/styles/globals.css doesn't exist" -ForegroundColor Green
}

if (Test-Path "src/index.css") {
    Write-Host "  ⚠️  /src/index.css EXISTS (we created this)" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ /src/index.css doesn't exist" -ForegroundColor Red
}

Write-Host "`n🎯 PROBLEM IDENTIFIED:" -ForegroundColor Red
Write-Host "  • TWO globals.css files exist in different locations" -ForegroundColor Red
Write-Host "  • The MAIN one is at /styles/globals.css (has Tailwind)" -ForegroundColor Red
Write-Host "  • There's a DUPLICATE at /src/styles/globals.css (different content)" -ForegroundColor Red

Write-Host "`n✅ SOLUTION:" -ForegroundColor Green
Write-Host "  1. Delete /src/styles/globals.css (duplicate)" -ForegroundColor Green
Write-Host "  2. Delete /src/index.css (unnecessary bridge)" -ForegroundColor Green
Write-Host "  3. Update /src/main.tsx to import from /styles/globals.css" -ForegroundColor Green

Write-Host "`n❓ Do you want to apply the fix? (Y/N): " -ForegroundColor Cyan -NoNewline
$confirmation = Read-Host

if ($confirmation -eq 'Y' -or $confirmation -eq 'y') {
    Write-Host "`n🔧 Applying fixes..." -ForegroundColor Yellow
    
    # Delete duplicate files
    if (Test-Path "src/styles/globals.css") {
        Remove-Item "src/styles/globals.css" -Force
        Write-Host "  ✅ Deleted /src/styles/globals.css" -ForegroundColor Green
    }
    
    if (Test-Path "src/index.css") {
        Remove-Item "src/index.css" -Force
        Write-Host "  ✅ Deleted /src/index.css" -ForegroundColor Green
    }
    
    # Check if src/styles directory is empty and delete it
    if (Test-Path "src/styles") {
        $filesInDir = Get-ChildItem "src/styles" -Force
        if ($filesInDir.Count -eq 0) {
            Remove-Item "src/styles" -Force -Recurse
            Write-Host "  ✅ Deleted empty /src/styles directory" -ForegroundColor Green
        }
    }
    
    Write-Host "`n📝 Now update /src/main.tsx manually:" -ForegroundColor Yellow
    Write-Host "  Change line 4 from:" -ForegroundColor White
    Write-Host "    import './index.css';" -ForegroundColor Red
    Write-Host "  To:" -ForegroundColor White
    Write-Host "    import '../styles/globals.css';" -ForegroundColor Green
    
    Write-Host "`n🧹 Clearing Vite cache..." -ForegroundColor Yellow
    if (Test-Path ".vite") {
        Remove-Item ".vite" -Recurse -Force
        Write-Host "  ✅ Vite cache cleared" -ForegroundColor Green
    }
    
    Write-Host "`n✅ FIX COMPLETE!" -ForegroundColor Green
    Write-Host "`n⚠️  MANUAL STEP REQUIRED:" -ForegroundColor Yellow
    Write-Host "  Open /src/main.tsx and change the CSS import as shown above" -ForegroundColor Yellow
    Write-Host "`nThen run: npm run dev" -ForegroundColor Cyan
    
} else {
    Write-Host "`n❌ Fix cancelled. No changes made." -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
