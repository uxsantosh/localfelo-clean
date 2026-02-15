#!/bin/bash

# Backup original file
cp App.tsx App.tsx.backup

echo "🔧 Applying location system fixes to App.tsx..."

# 1. Remove LocationBottomSheet import (line 21)
sed -i '/import { LocationBottomSheet }/d' App.tsx

# 2. Remove showLocationSheet state declaration
sed -i '/const \[showLocationSheet, setShowLocationSheet\] = useState(false);/d' App.tsx

# 3. Remove the auto-open location sheet logic in useEffect
# This is complex, so we'll handle it with a multi-line sed
sed -i '/if (globalLocation && globalLocation.latitude && globalLocation.longitude && !globalLocation.city) {/,/setShowLocationSheet(true);/d' App.tsx

# 4. Replace all setShowLocationSheet(true) with setShowLocationSetupModal(true)
sed -i 's/setShowLocationSheet(true)/setShowLocationSetupModal(true)/g' App.tsx

# 5. Remove LocationBottomSheet JSX component usage
sed -i '/<!-- Location Bottom Sheet -->/,/<\/LocationBottomSheet>/d' App.tsx
sed -i '/{\/\* Location Bottom Sheet \*\/}/,/<\/LocationBottomSheet>/d' App.tsx

echo "✅ Basic fixes applied!"
echo ""
echo "⚠️  Manual steps required:"
echo "1. Remove the LocationBottomSheet JSX component (search for '<LocationBottomSheet')"
echo "2. Add the new LocationSetupModal for manual location changes"
echo "3. Test the app to ensure location flow works"
echo ""
echo "📁 Backup saved as: App.tsx.backup"
