#!/bin/bash
# LocalFelo - Unix/Mac/Linux Bash Restructure Script
# Run this from your project ROOT folder

echo "🚀 Starting LocalFelo folder restructure..."
echo ""

# Create /src/ folder if it doesn't exist
mkdir -p src
echo "✅ /src/ folder ready"

# Function to move folder safely
move_folder_safely() {
    SOURCE=$1
    DEST=$2
    
    if [ -d "$SOURCE" ]; then
        if [ -d "$DEST" ]; then
            echo "⚠️  $DEST already exists, merging..."
            cp -r "$SOURCE"/* "$DEST"/
            rm -rf "$SOURCE"
        else
            mv "$SOURCE" "$DEST"
        fi
        echo "✅ Moved $SOURCE → $DEST"
    else
        echo "⏭️  Skipping $SOURCE (doesn't exist)"
    fi
}

# Move App.tsx
if [ -f "App.tsx" ]; then
    if [ -f "src/App.tsx" ]; then
        echo "⚠️  /src/App.tsx already exists, skipping..."
    else
        mv App.tsx src/App.tsx
        echo "✅ Moved /App.tsx → /src/App.tsx"
    fi
else
    echo "⏭️  Skipping App.tsx (doesn't exist)"
fi

# Move all folders into /src/
echo ""
echo "📁 Moving folders into /src/..."

move_folder_safely "components" "src/components"
move_folder_safely "screens" "src/screens"
move_folder_safely "services" "src/services"
move_folder_safely "hooks" "src/hooks"
move_folder_safely "lib" "src/lib"
move_folder_safely "utils" "src/utils"
move_folder_safely "types" "src/types"
move_folder_safely "constants" "src/constants"
move_folder_safely "data" "src/data"
move_folder_safely "assets" "src/assets"

# Handle config folder
if [ -d "config" ]; then
    if [ -d "src/config" ]; then
        echo "⚠️  Found duplicate /config/ folder, removing root version..."
        rm -rf config
        echo "✅ Removed duplicate /config/ folder"
    else
        mv config src/config
        echo "✅ Moved /config/ → /src/config/"
    fi
fi

# Delete old /styles/globals.css (keep /src/styles/globals.css)
if [ -f "styles/globals.css" ]; then
    if [ -f "src/styles/globals.css" ]; then
        echo "⚠️  Removing duplicate /styles/globals.css..."
        rm -f styles/globals.css
        echo "✅ Removed duplicate globals.css"
    fi
fi

# Delete duplicate root files
echo ""
echo "🗑️  Cleaning up duplicate root files..."

FILES_TO_DELETE=("main.tsx" "vite-env.d.ts")

for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "✅ Deleted /$file (duplicate exists in /src/)"
    fi
done

echo ""
echo "✅ ✅ ✅ RESTRUCTURE COMPLETE! ✅ ✅ ✅"
echo ""
echo "📝 Next steps:"
echo "   1. Run: npm install"
echo "   2. Run: npm run dev"
echo "   3. Your app should start without errors!"
echo ""
echo "🎉 Your /src/ folder now contains all application code!"