# Cache Headers for Netlify/Cloudflare Pages
# This file configures proper caching for static assets

# HTML files - Never cache (always fetch fresh)
/*.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

# Main index.html
/index.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

# Version file - Never cache (used for version checking)
/version.json
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

# JavaScript and CSS with hash - Cache for 1 year
/assets/*.js
  Cache-Control: public, max-age=31536000, immutable

/assets/*.css
  Cache-Control: public, max-age=31536000, immutable

# Images with hash - Cache for 1 year
/assets/*.png
  Cache-Control: public, max-age=31536000, immutable

/assets/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/assets/*.jpeg
  Cache-Control: public, max-age=31536000, immutable

/assets/*.svg
  Cache-Control: public, max-age=31536000, immutable

/assets/*.gif
  Cache-Control: public, max-age=31536000, immutable

/assets/*.webp
  Cache-Control: public, max-age=31536000, immutable

# Fonts - Cache for 1 year
/assets/*.woff
  Cache-Control: public, max-age=31536000, immutable

/assets/*.woff2
  Cache-Control: public, max-age=31536000, immutable

/assets/*.ttf
  Cache-Control: public, max-age=31536000, immutable

# Favicon and static images in public - Cache for 1 week
/*.ico
  Cache-Control: public, max-age=604800

/*.png
  Cache-Control: public, max-age=604800

/*.svg
  Cache-Control: public, max-age=604800
