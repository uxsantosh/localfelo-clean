# 🧪 SEO Testing Guide - Quick Reference

## Quick Browser Test

### 1. Open Browser DevTools
- Press `F12` or `Right Click → Inspect`
- Go to **Elements** tab
- Look for `<head>` section

### 2. Navigate Through Pages
Test each page and verify meta tags update:

#### Test Sequence:
```
Home (/) → Marketplace (/marketplace) → Tasks (/tasks) → Wishes (/wishes) → About (/about)
```

### 3. Inspect Meta Tags
For each page, expand `<head>` and check:
- `<title>` - Should be unique per page
- `<meta name="description">` - Should describe that specific page
- `<meta property="og:title">` - For social sharing
- `<meta property="og:url">` - Should match current URL
- `<link rel="canonical">` - Should match current URL

---

## Console Test Script

**Copy and paste this in browser console on each page:**

```javascript
// SEO Inspector - Run on each page
console.log('🔍 SEO INSPECTION REPORT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📄 Current URL:', window.location.href);
console.log('📌 Title:', document.title);
console.log('📝 Description:', document.querySelector('meta[name="description"]')?.content);
console.log('🔑 Keywords:', document.querySelector('meta[name="keywords"]')?.content);
console.log('🌐 Canonical:', document.querySelector('link[rel="canonical"]')?.href);
console.log('');
console.log('📱 Open Graph:');
console.log('  • OG Title:', document.querySelector('meta[property="og:title"]')?.content);
console.log('  • OG Description:', document.querySelector('meta[property="og:description"]')?.content);
console.log('  • OG URL:', document.querySelector('meta[property="og:url"]')?.content);
console.log('  • OG Image:', document.querySelector('meta[property="og:image"]')?.content);
console.log('');
console.log('🐦 Twitter Card:');
console.log('  • Twitter Title:', document.querySelector('meta[name="twitter:title"]')?.content);
console.log('  • Twitter Description:', document.querySelector('meta[name="twitter:description"]')?.content);
console.log('  • Twitter Image:', document.querySelector('meta[property="twitter:image"]')?.content);
console.log('');
console.log('🤖 Robots:', document.querySelector('meta[name="robots"]')?.content);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
```

---

## Expected Results Per Page

### 🏠 Home Page (`/`)
```
✓ Title: LocalFelo - India's Hyperlocal Marketplace | Buy, Sell & Get Tasks Done Nearby
✓ Description: LocalFelo is India's leading hyperlocal marketplace...
✓ Keywords: LocalFelo, hyperlocal marketplace, local marketplace India...
✓ Canonical: https://yoursite.com/
✓ Robots: index, follow
```

### 🛒 Marketplace (`/marketplace`)
```
✓ Title: Marketplace - Buy & Sell Locally | LocalFelo
✓ Description: Browse products for sale in your area on LocalFelo...
✓ Keywords: local marketplace, buy sell nearby, classifieds India...
✓ Canonical: https://yoursite.com/marketplace
✓ Robots: index, follow
```

### ⚡ Tasks (`/tasks`)
```
✓ Title: Tasks & Services - Find Local Help | LocalFelo
✓ Description: Find local helpers for tasks and services near you...
✓ Keywords: local tasks, nearby services, find help...
✓ Canonical: https://yoursite.com/tasks
✓ Robots: index, follow
```

### 💭 Wishes (`/wishes`)
```
✓ Title: Wishes - Post What You Need | LocalFelo
✓ Description: Post your wishes for products you want to buy...
✓ Keywords: wanted items, looking to buy, post wishes...
✓ Canonical: https://yoursite.com/wishes
✓ Robots: index, follow
```

### 👤 Profile (`/profile`) - Private Page
```
✓ Title: My Profile | LocalFelo
✓ Description: Manage your LocalFelo profile...
✓ Canonical: https://yoursite.com/profile
✓ Robots: noindex, nofollow  ← Should NOT be indexed
```

---

## Google Tools Testing

### 1. Rich Results Test
**URL:** https://search.google.com/test/rich-results

**How to use:**
1. Deploy your site
2. Visit the tool
3. Enter URL: `https://yoursite.com/marketplace`
4. Click "Test URL"
5. Check if all meta tags are detected

**Expected:** ✅ All meta tags visible, no errors

---

### 2. Mobile-Friendly Test
**URL:** https://search.google.com/test/mobile-friendly

**How to use:**
1. Enter URL: `https://yoursite.com/tasks`
2. Click "Test URL"
3. Verify page is mobile-friendly

**Expected:** ✅ Page is mobile-friendly, SEO tags visible

---

### 3. PageSpeed Insights
**URL:** https://pagespeed.web.dev/

**How to use:**
1. Enter URL: `https://yoursite.com/`
2. Run test for Mobile and Desktop
3. Check SEO section in results

**Expected:** ✅ 90+ SEO score, all meta tags present

---

### 4. Facebook Sharing Debugger
**URL:** https://developers.facebook.com/tools/debug/

**How to use:**
1. Enter URL: `https://yoursite.com/marketplace`
2. Click "Debug"
3. Verify Open Graph tags are correct

**Expected:** ✅ Title, description, image all correct

---

### 5. Twitter Card Validator
**URL:** https://cards-dev.twitter.com/validator

**How to use:**
1. Enter URL: `https://yoursite.com/tasks`
2. Click "Preview card"
3. Verify Twitter Card preview

**Expected:** ✅ Card shows correct title, description

---

## Real-World Testing

### Test Social Sharing:
1. **Copy a page URL** (e.g., `https://yoursite.com/marketplace`)
2. **Paste in WhatsApp/Telegram** → Should show preview with correct title/image
3. **Share on Facebook** → Preview should match page content
4. **Tweet the link** → Twitter Card should display correctly

### Test Google Search:
1. **Submit sitemap** to Google Search Console
2. **Wait 24-48 hours** for indexing
3. **Search Google for:**
   - `site:yoursite.com marketplace` → Should show Marketplace page with unique description
   - `site:yoursite.com tasks` → Should show Tasks page with unique description
   - `site:yoursite.com wishes` → Should show Wishes page with unique description

---

## Common Issues & Solutions

### ❌ Meta tags not updating
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+Shift+R)
- Check browser console for JavaScript errors

### ❌ Old description showing in Google
**Solution:**
- Google cache takes time to update (1-4 weeks)
- Use "Request Indexing" in Google Search Console
- Wait for next crawl

### ❌ Social preview not updating
**Solution:**
- Use Facebook Debug Tool to force refresh
- Clear social media cache
- Wait 24-48 hours for cache expiry

### ❌ Canonical URL is wrong
**Solution:**
- Check your hosting environment's base URL
- Verify `window.location.origin` in console
- Update `baseUrl` in `/utils/seo.ts` if needed

---

## Automated Testing

### Create this test file: `/tests/seo.test.ts`

```typescript
import { getSEOConfig } from '../utils/seo';

describe('SEO Configuration', () => {
  test('Home page has correct SEO', () => {
    const config = getSEOConfig('home');
    expect(config.title).toContain('LocalFelo');
    expect(config.title).toContain('Hyperlocal Marketplace');
    expect(config.description.length).toBeGreaterThan(100);
    expect(config.description.length).toBeLessThan(160);
  });

  test('Marketplace has unique SEO', () => {
    const homeConfig = getSEOConfig('home');
    const marketplaceConfig = getSEOConfig('marketplace');
    expect(marketplaceConfig.title).not.toBe(homeConfig.title);
    expect(marketplaceConfig.description).not.toBe(homeConfig.description);
  });

  test('Private pages have noindex', () => {
    const profileConfig = getSEOConfig('profile');
    expect(profileConfig.noindex).toBe(true);
    
    const chatConfig = getSEOConfig('chat');
    expect(chatConfig.noindex).toBe(true);
  });

  test('All pages have canonical URLs', () => {
    const screens = ['home', 'marketplace', 'tasks', 'wishes', 'about'];
    screens.forEach(screen => {
      const config = getSEOConfig(screen);
      expect(config.canonicalUrl).toBeDefined();
      expect(config.canonicalUrl).toContain('http');
    });
  });
});
```

---

## Checklist for Production

### Before Deployment:
- [ ] Test SEO on localhost for all main pages
- [ ] Verify meta tags update in browser DevTools
- [ ] Check console for no JavaScript errors
- [ ] Test on mobile device (responsive)

### After Deployment:
- [ ] Run Google Rich Results Test on 5+ pages
- [ ] Test Facebook sharing for Marketplace, Tasks, Wishes
- [ ] Verify all pages load without errors
- [ ] Submit sitemap to Google Search Console

### Week 1:
- [ ] Check indexing status in Google Search Console
- [ ] Verify each page appears with unique title in search
- [ ] Monitor crawl errors
- [ ] Check mobile usability report

### Month 1:
- [ ] Analyze which pages get organic traffic
- [ ] Check search queries for each page
- [ ] Optimize underperforming pages
- [ ] Update SEO based on real data

---

## Quick Verification Script

**Save this as a bookmark:**

```javascript
javascript:(function(){const screens=['','marketplace','tasks','wishes','about','safety','terms','privacy','faq','prohibited'];let i=0;function test(){if(i>=screens.length){alert('✅ SEO test complete!');return;}const path='/'+screens[i];console.log(`Testing: ${path}`);window.history.pushState({},'',path);setTimeout(()=>{console.log('Title:',document.title);i++;test();},500);}test();})();
```

**Usage:**
1. Copy the script
2. Create a bookmark
3. Paste as URL
4. Name it "Test SEO"
5. Click bookmark on any page to auto-test all pages

---

## Success Metrics

### Technical Success:
✅ All pages have unique `<title>` tags  
✅ All pages have unique meta descriptions (150-160 chars)  
✅ Canonical URLs match page URLs  
✅ Private pages have noindex  
✅ No console errors  

### SEO Success:
✅ All pages indexed by Google (1-2 weeks)  
✅ Each page appears with correct title in search  
✅ Social shares show correct previews  
✅ No duplicate content warnings  
✅ Mobile-friendly on all pages  

### Business Success:
✅ Organic traffic from multiple pages  
✅ Different pages rank for different keywords  
✅ Lower bounce rate (correct page matches search intent)  
✅ Higher engagement (users find what they searched for)  

---

**Last Updated:** March 18, 2026  
**Status:** ✅ Ready to Test  
**Version:** 1.0
