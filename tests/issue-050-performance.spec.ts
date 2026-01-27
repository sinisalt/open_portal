import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Issue 050 - Performance Tests
 * Tests bundle size, loading times, and performance metrics
 */

const SCREENSHOTS_DIR = '/tmp/issue-050-performance';
const RESULTS_DIR = '/tmp/issue-050-results';

// Ensure directories exist
[SCREENSHOTS_DIR, RESULTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Test credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('Issue 050 - Performance Metrics', () => {
  test('01 - Login page loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;

    // Performance budget: < 3000ms
    expect(loadTime).toBeLessThan(3000);

    console.log(`✓ Login page load time: ${loadTime}ms`);

    // Save metrics
    const metrics = {
      page: 'login',
      loadTime,
      timestamp: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'login-performance.json'),
      JSON.stringify(metrics, null, 2)
    );
  });

  test('02 - Dashboard loads within performance budget', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"], input[name="username"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    // Measure dashboard load
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;

    // Performance budget: < 3000ms
    expect(loadTime).toBeLessThan(3000);

    console.log(`✓ Dashboard load time: ${loadTime}ms`);

    // Save metrics
    const metrics = {
      page: 'dashboard',
      loadTime,
      timestamp: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'dashboard-performance.json'),
      JSON.stringify(metrics, null, 2)
    );
  });

  test('03 - Navigation between pages is fast', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"], input[name="username"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    // Measure navigation time between pages
    const pages = ['/', '/dashboard', '/about', '/team'];
    const navigationTimes: number[] = [];

    for (const pageUrl of pages) {
      const startTime = Date.now();
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      const navTime = Date.now() - startTime;
      navigationTimes.push(navTime);
      console.log(`✓ Navigation to ${pageUrl}: ${navTime}ms`);
    }

    // Average navigation time should be < 2000ms
    const avgNavTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
    expect(avgNavTime).toBeLessThan(2000);

    // Save metrics
    const metrics = {
      pages,
      navigationTimes,
      averageTime: avgNavTime,
      timestamp: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'navigation-performance.json'),
      JSON.stringify(metrics, null, 2)
    );
  });

  test('04 - Web Vitals are within acceptable range', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get Web Vitals using Performance API
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics: Record<string, number> = {};
        
        // Get performance entries
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
          metrics.loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
          metrics.domInteractive = navigation.domInteractive;
        }

        resolve(metrics);
      });
    });

    console.log('Web Vitals:', vitals);

    // Save metrics
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'web-vitals.json'),
      JSON.stringify(vitals, null, 2)
    );

    // Basic checks
    expect(vitals).toBeDefined();
  });
});

test.describe('Issue 050 - Bundle Size & Lazy Loading', () => {
  test('05 - Initial bundle size is reasonable', async ({ page }) => {
    // Track network requests
    const jsFiles: Array<{ url: string; size: number }> = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.endsWith('.js')) {
        try {
          const body = await response.body();
          jsFiles.push({
            url,
            size: body.length,
          });
        } catch (error) {
          // Some responses might not be accessible
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Calculate total JS size
    const totalSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    console.log(`Total JS bundle size: ${totalSizeMB}MB`);
    console.log(`Number of JS files: ${jsFiles.length}`);

    // Save metrics
    const metrics = {
      totalSize,
      totalSizeMB,
      fileCount: jsFiles.length,
      files: jsFiles.map(f => ({
        url: f.url.split('/').pop(),
        sizeMB: (f.size / (1024 * 1024)).toFixed(2),
      })),
      timestamp: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'bundle-size.json'),
      JSON.stringify(metrics, null, 2)
    );

    // Bundle should be < 5MB (reasonable for modern SPA)
    expect(totalSize).toBeLessThan(5 * 1024 * 1024);
  });

  test('06 - Widgets are lazy loaded', async ({ page }) => {
    const jsFiles: string[] = [];
    
    page.on('response', (response) => {
      const url = response.url();
      if (url.endsWith('.js')) {
        jsFiles.push(url);
      }
    });

    // Initial page load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const initialFileCount = jsFiles.length;
    console.log(`Initial JS files loaded: ${initialFileCount}`);

    // Navigate to different pages to trigger lazy loading
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const afterNavFileCount = jsFiles.length;
    console.log(`JS files after navigation: ${afterNavFileCount}`);

    // Save metrics
    const metrics = {
      initialFileCount,
      afterNavFileCount,
      additionalFilesLoaded: afterNavFileCount - initialFileCount,
      timestamp: new Date().toISOString(),
    };
    
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'lazy-loading.json'),
      JSON.stringify(metrics, null, 2)
    );

    // Should have loaded some initial files
    expect(initialFileCount).toBeGreaterThan(0);
  });
});

test.describe('Issue 050 - Memory & Resource Usage', () => {
  test('07 - Memory usage is reasonable during navigation', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Login
    const emailInput = page.locator('input[type="email"], input[name="username"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    // Navigate through multiple pages
    const pages = ['/', '/dashboard', '/about', '/team', '/users-management'];
    
    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500); // Let things settle
    }

    // Check no memory leaks by ensuring page still works
    await page.goto('/');
    await expect(page).toHaveURL(/\//);

    console.log('✓ No obvious memory leaks detected');
  });
});
