import { defineConfig } from 'vite';
import path from 'path';
import { readFileSync } from 'fs';

export default defineConfig(({ command }) => {
  // Read version info if it exists (during build)
  let versionInfo = { version: 'dev', buildTime: new Date().toISOString() };
  
  // Only try to read version file during build, and handle errors gracefully
  if (command === 'build') {
    try {
      const versionFilePath = path.join(process.cwd(), 'public', 'version.json');
      const fileContent = readFileSync(versionFilePath, 'utf-8');
      versionInfo = JSON.parse(fileContent);
      console.log('✅ Loaded version:', versionInfo.version);
    } catch (error) {
      console.warn('⚠️ Could not read version.json, using default version');
    }
  }

  return {
    root: './',
    publicDir: 'public',
    plugins: [],
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(versionInfo.version),
      'import.meta.env.VITE_BUILD_TIME': JSON.stringify(versionInfo.buildTime),
    },
    esbuild: {
      loader: 'tsx',
      include: /src\/.*\.[tj]sx?$/,
      exclude: [],
    },
    server: {
      fs: {
        strict: false,
        allow: ['.'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: [
        '@capacitor/core',
        '@capacitor/app',
        '@capacitor/device',
        '@capacitor/preferences',
        '@capacitor/push-notifications',
      ],
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.ts': 'tsx',
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        external: [
          /^figma:asset\//,
        ],
        output: {
          // Add hash to filenames for cache busting
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
    base: '/',
  };
});