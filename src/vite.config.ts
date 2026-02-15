import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-htaccess',
      closeBundle() {
        // Copy .htaccess to dist folder after build
        try {
          const sourceFile = path.resolve(__dirname, 'htaccess.txt');
          const distDir = path.resolve(__dirname, 'dist');
          const destFile = path.resolve(distDir, '.htaccess');
          
          // Ensure dist directory exists
          if (!existsSync(distDir)) {
            mkdirSync(distDir, { recursive: true });
          }
          
          // Check if source file exists
          if (!existsSync(sourceFile)) {
            console.warn('⚠️  htaccess.txt not found in project root');
            return;
          }
          
          copyFileSync(sourceFile, destFile);
          console.log('✅ .htaccess file copied to dist folder');
        } catch (err) {
          console.warn('⚠️  Could not copy .htaccess file:', err);
        }
      }
    }
  ],
  // ✅ FIX: Enable SPA routing in development
  server: {
    historyApiFallback: true,  // Fallback to index.html for all routes
  },
  preview: {
    historyApiFallback: true,  // Also enable for preview mode (npm run preview)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '/components': path.resolve(__dirname, './components'),
      '/screens': path.resolve(__dirname, './screens'),
      '/types': path.resolve(__dirname, './types'),
      '/services': path.resolve(__dirname, './services'),
      '/constants': path.resolve(__dirname, './constants'),
      '/config': path.resolve(__dirname, './config'),
      '/utils': path.resolve(__dirname, './utils'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',  // ✅ Use esbuild (faster and included with Vite)
    rollupOptions: {
      external: [
        // Ignore figma:asset imports (used during development with Figma)
        /^figma:asset\//
      ],
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react'],
        },
        assetFileNames: (assetInfo) => {
          // Keep logo.svg in assets root for favicon
          if (assetInfo.name === 'logo.svg') {
            return 'assets/logo.svg';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  base: '/',
});