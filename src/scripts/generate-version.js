import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate version.json file
 * This script runs during build to create a version file
 */
function generateVersion() {
  const version = process.env.npm_package_version || '1.0.0';
  const buildTime = new Date().toISOString();
  const buildTimestamp = Date.now();

  const versionInfo = {
    version: `${version}.${buildTimestamp}`,
    buildTime,
    buildTimestamp,
  };

  // Write to public directory so it's accessible at /version.json
  const publicDir = join(__dirname, '..', 'public');
  const outputPath = join(publicDir, 'version.json');

  writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2), 'utf-8');

  console.log('✓ Generated version.json');
  console.log(`  Version: ${versionInfo.version}`);
  console.log(`  Build Time: ${versionInfo.buildTime}`);
}

generateVersion();
