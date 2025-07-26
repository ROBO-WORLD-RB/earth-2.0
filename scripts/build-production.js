#!/usr/bin/env node

// Production build optimization script
// Runs additional optimizations after Vite build

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DIST_DIR = 'dist';
const BUILD_INFO_FILE = join(DIST_DIR, 'build-info.json');

console.log('🚀 Starting production build optimization...\n');

// Step 1: Run Vite build
console.log('📦 Building with Vite...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Vite build completed\n');
} catch (error) {
  console.error('❌ Vite build failed:', error.message);
  process.exit(1);
}

// Step 2: Generate build info
console.log('📊 Generating build information...');
const buildInfo = {
  buildTime: new Date().toISOString(),
  version: process.env.npm_package_version || '1.0.0',
  commit: getGitCommit(),
  branch: getGitBranch(),
  environment: 'production',
  features: [
    'AI Personality Manager',
    'Voice Integration',
    'Smart Search',
    'Message Templates',
    'Conversation Analytics',
    'Export/Import System',
    'Keyboard Shortcuts',
    'Command Palette',
    'PWA Support',
    'Offline Functionality'
  ]
};

writeFileSync(BUILD_INFO_FILE, JSON.stringify(buildInfo, null, 2));
console.log('✅ Build info generated\n');

// Step 3: Optimize service worker
console.log('🔧 Optimizing service worker...');
optimizeServiceWorker();
console.log('✅ Service worker optimized\n');

// Step 4: Generate security headers
console.log('🔒 Generating security configuration...');
generateSecurityConfig();
console.log('✅ Security configuration generated\n');

// Step 5: Bundle analysis (if requested)
if (process.argv.includes('--analyze')) {
  console.log('📈 Analyzing bundle size...');
  analyzeBundleSize();
}

console.log('🎉 Production build optimization completed!\n');
console.log('📋 Build Summary:');
console.log(`   Version: ${buildInfo.version}`);
console.log(`   Build Time: ${buildInfo.buildTime}`);
console.log(`   Commit: ${buildInfo.commit}`);
console.log(`   Features: ${buildInfo.features.length} features included`);
console.log('\n🚀 Ready for deployment to Vercel!');

// Helper functions
function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 7);
  } catch {
    return 'unknown';
  }
}

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function optimizeServiceWorker() {
  const swPath = join(DIST_DIR, 'sw.js');
  if (existsSync(swPath)) {
    let swContent = readFileSync(swPath, 'utf8');
    
    // Update cache version with build time
    const cacheVersion = `earth-ai-${Date.now()}`;
    swContent = swContent.replace(/CACHE_NAME = '[^']*'/, `CACHE_NAME = '${cacheVersion}'`);
    swContent = swContent.replace(/STATIC_CACHE = '[^']*'/, `STATIC_CACHE = '${cacheVersion}-static'`);
    swContent = swContent.replace(/DYNAMIC_CACHE = '[^']*'/, `DYNAMIC_CACHE = '${cacheVersion}-dynamic'`);
    
    writeFileSync(swPath, swContent);
  }
}

function generateSecurityConfig() {
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://generativelanguage.googleapis.com https://firebase.googleapis.com",
      "worker-src 'self' blob:"
    ].join('; ')
  };

  const securityConfigPath = join(DIST_DIR, 'security-headers.json');
  writeFileSync(securityConfigPath, JSON.stringify(securityHeaders, null, 2));
}

function analyzeBundleSize() {
  try {
    // This would require bundle-analyzer to be installed
    console.log('📊 Bundle analysis would require additional setup');
    console.log('   Consider using: npm install --save-dev webpack-bundle-analyzer');
  } catch (error) {
    console.warn('⚠️  Bundle analysis not available:', error.message);
  }
}