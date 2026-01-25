import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = '/tmp/phase1-screenshots';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Test credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('Phase 1 Integration Testing - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('01 - Login Page Screenshot', async ({ page }) => {
    // Wait for login page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-login-page.png'),
      fullPage: true
    });
  });

  test('02 - Admin Login Flow', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find and fill login form
    const emailInput = page.locator('input[type="email"], input[type="text"], input[name="username"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);
    
    // Screenshot before login
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-login-form-filled.png'),
      fullPage: true
    });
    
    // Submit login
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
    await loginButton.click();
    
    // Wait for navigation or dashboard
    await page.waitForTimeout(2000);
    
    // Screenshot after login
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-after-login.png'),
      fullPage: true
    });
  });
});
