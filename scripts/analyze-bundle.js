#!/usr/bin/env node

/**
 * Bundle Size Analyzer
 *
 * Analyzes the production build output and reports bundle sizes.
 * Helps identify large dependencies and optimization opportunities.
 *
 * Usage:
 *   npm run build
 *   node scripts/analyze-bundle.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2);
}

/**
 * Analyze build directory
 */
function analyzeBuildDirectory() {
  const buildDir = path.join(__dirname, '../build');
  const assetsDir = path.join(buildDir, 'assets');

  if (!fs.existsSync(buildDir)) {
    console.error(`${colors.red}Build directory not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.bold}${colors.cyan}Bundle Size Analysis${colors.reset}\n`);
  console.log('═'.repeat(80));

  // Analyze assets
  const files = fs.readdirSync(assetsDir);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));

  // JavaScript bundles
  console.log(`\n${colors.bold}JavaScript Bundles:${colors.reset}`);
  console.log('─'.repeat(80));

  let totalJsSize = 0;
  const jsBundles = [];

  for (const file of jsFiles.sort()) {
    const filePath = path.join(assetsDir, file);
    const sizeKB = parseFloat(getFileSizeKB(filePath));
    totalJsSize += sizeKB;

    const gzipPath = `${filePath}.gz`;
    let gzipSize = null;
    if (fs.existsSync(gzipPath)) {
      gzipSize = getFileSizeKB(gzipPath);
    }

    jsBundles.push({ file, size: sizeKB, gzipSize });

    // Color code based on size
    let sizeColor = colors.green;
    if (sizeKB > 500) {
      sizeColor = colors.red;
    } else if (sizeKB > 200) {
      sizeColor = colors.yellow;
    }

    const gzipInfo = gzipSize ? ` (gzip: ${gzipSize} KB)` : '';
    console.log(`  ${file}`);
    console.log(`    ${sizeColor}${sizeKB} KB${colors.reset}${gzipInfo}`);
  }

  // CSS bundles
  console.log(`\n${colors.bold}CSS Bundles:${colors.reset}`);
  console.log('─'.repeat(80));

  let totalCssSize = 0;
  for (const file of cssFiles.sort()) {
    const filePath = path.join(assetsDir, file);
    const sizeKB = parseFloat(getFileSizeKB(filePath));
    totalCssSize += sizeKB;

    const gzipPath = `${filePath}.gz`;
    let gzipSize = null;
    if (fs.existsSync(gzipPath)) {
      gzipSize = getFileSizeKB(gzipPath);
    }

    const gzipInfo = gzipSize ? ` (gzip: ${gzipSize} KB)` : '';
    console.log(`  ${file}`);
    console.log(`    ${sizeKB} KB${gzipInfo}`);
  }

  // Summary
  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log('─'.repeat(80));
  console.log(`  Total JS size: ${colors.bold}${totalJsSize.toFixed(2)} KB${colors.reset}`);
  console.log(`  Total CSS size: ${colors.bold}${totalCssSize.toFixed(2)} KB${colors.reset}`);
  console.log(`  Total size: ${colors.bold}${(totalJsSize + totalCssSize).toFixed(2)} KB${colors.reset}`);

  // Performance targets
  console.log(`\n${colors.bold}Performance Targets:${colors.reset}`);
  console.log('─'.repeat(80));

  const targetSize = 300; // KB gzipped
  const mainBundle = jsBundles.find(b => b.file.includes('index'));
  const mainBundleSize = mainBundle?.gzipSize ? parseFloat(mainBundle.gzipSize) : mainBundle?.size || 0;

  if (mainBundleSize <= targetSize) {
    console.log(`  ${colors.green}✓ Main bundle: ${mainBundleSize} KB (target: <${targetSize} KB)${colors.reset}`);
  } else {
    console.log(`  ${colors.red}✗ Main bundle: ${mainBundleSize} KB (target: <${targetSize} KB)${colors.reset}`);
    console.log(`    Exceeds target by ${(mainBundleSize - targetSize).toFixed(2)} KB`);
  }

  // Chunk analysis
  console.log(`\n${colors.bold}Chunk Breakdown:${colors.reset}`);
  console.log('─'.repeat(80));

  const chunkTypes = {
    vendor: jsBundles.filter(b => b.file.includes('vendor')),
    widgets: jsBundles.filter(b => b.file.includes('widget')),
    routes: jsBundles.filter(b => !b.file.includes('vendor') && !b.file.includes('widget') && !b.file.includes('index')),
    main: jsBundles.filter(b => b.file.includes('index')),
  };

  for (const [type, bundles] of Object.entries(chunkTypes)) {
    if (bundles.length > 0) {
      const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
      console.log(`  ${type.charAt(0).toUpperCase() + type.slice(1)}: ${bundles.length} chunks (${totalSize.toFixed(2)} KB)`);
    }
  }

  // Recommendations
  console.log(`\n${colors.bold}Recommendations:${colors.reset}`);
  console.log('─'.repeat(80));

  const largeBundles = jsBundles.filter(b => b.size > 500);
  if (largeBundles.length > 0) {
    console.log(`  ${colors.yellow}⚠ Large bundles detected:${colors.reset}`);
    for (const bundle of largeBundles) {
      console.log(`    - ${bundle.file} (${bundle.size} KB)`);
    }
    console.log(`    Consider splitting these bundles further or lazy loading.`);
  } else {
    console.log(`  ${colors.green}✓ All bundles are under 500 KB${colors.reset}`);
  }

  if (mainBundleSize > targetSize) {
    console.log(`  ${colors.yellow}⚠ Main bundle exceeds target size${colors.reset}`);
    console.log(`    - Enable tree shaking for unused code`);
    console.log(`    - Move heavy dependencies to lazy-loaded chunks`);
    console.log(`    - Consider code splitting by route`);
  }

  console.log('\n' + '═'.repeat(80));
}

// Run analyzer
analyzeBuildDirectory();
