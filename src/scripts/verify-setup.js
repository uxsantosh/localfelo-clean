import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Verification script to check if update system is properly configured
 */

let passed = 0;
let failed = 0;

function check(description, condition) {
  if (condition) {
    console.log(`✅ ${description}`);
    passed++;
  } else {
    console.log(`❌ ${description}`);
    failed++;
  }
}

function fileExists(path) {
  return existsSync(join(rootDir, path));
}

function fileContains(path, text) {
  try {
    const content = readFileSync(join(rootDir, path), 'utf-8');
    return content.includes(text);
  } catch {
    return false;
  }
}

console.log('\n🔍 Verifying LocalFelo Update System Setup...\n');
console.log('─────────────────────────────────────────────────\n');

// Core Files
console.log('📁 Core Implementation Files:');
check('Generate version script exists', fileExists('scripts/generate-version.js'));
check('Version manager exists', fileExists('src/utils/version-manager.ts'));
check('Update notification component exists', fileExists('src/components/UpdateNotification.tsx'));
check('Version.json placeholder exists', fileExists('public/version.json'));

console.log('\n📝 Configuration Files:');
check('Package.json has prebuild script', fileContains('package.json', '"prebuild"'));
check('Vite config updated', fileContains('vite.config.ts', 'VITE_APP_VERSION'));
check('App.tsx imports UpdateNotification', fileContains('App.tsx', 'UpdateNotification'));
check('App.tsx renders UpdateNotification', fileContains('App.tsx', '<UpdateNotification />'));
check('TypeScript definitions updated', fileContains('src/vite-env.d.ts', 'VITE_APP_VERSION'));

console.log('\n🌐 Deployment Configurations:');
check('Netlify headers configured', fileExists('public/_headers'));
check('Vercel config exists', fileExists('vercel.json'));
check('Netlify TOML exists', fileExists('netlify.toml'));
check('Apache .htaccess exists', fileExists('public/.htaccess'));

console.log('\n📚 Documentation:');
check('Deployment guide exists', fileExists('DEPLOYMENT_CACHE_GUIDE.md'));
check('Quick start exists', fileExists('VERSION_UPDATE_README.md'));
check('Summary exists', fileExists('CACHE_SOLUTION_SUMMARY.md'));
check('Checklist exists', fileExists('UPDATE_SYSTEM_CHECKLIST.md'));
check('Architecture doc exists', fileExists('SYSTEM_ARCHITECTURE.md'));
check('Quick reference exists', fileExists('QUICK_REFERENCE.md'));
check('Get started guide exists', fileExists('GET_STARTED.md'));

console.log('\n🔧 Vite Configuration:');
check('Hashed filenames configured', 
  fileContains('vite.config.ts', 'entryFileNames') && 
  fileContains('vite.config.ts', '[hash]'));

console.log('\n─────────────────────────────────────────────────');
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('🎉 SUCCESS! All checks passed!');
  console.log('\n✅ Your update system is properly configured.');
  console.log('\n📖 Next steps:');
  console.log('   1. Run: npm run build');
  console.log('   2. Check: cat public/version.json');
  console.log('   3. Deploy to staging and test');
  console.log('\n📚 See GET_STARTED.md for detailed instructions.\n');
} else {
  console.log('⚠️  Some checks failed!');
  console.log('\n🔧 Please review the failed items above.');
  console.log('📚 See GET_STARTED.md for troubleshooting.\n');
  process.exit(1);
}
