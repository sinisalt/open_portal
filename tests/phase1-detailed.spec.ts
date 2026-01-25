import * as path from 'node:path';
import { expect, test } from '@playwright/test';

const SCREENSHOTS_DIR = '/tmp/phase1-screenshots-detailed';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('Phase 1 Detailed Testing - Frontend Login Flow', () => {
  test('Complete Login Flow with Verification', async ({ page }) => {
    // Step 1: Navigate to login page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Capture initial login page
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-login-page-initial.png'),
      fullPage: true,
    });

    // Step 2: Fill in login form
    const emailInput = page
      .locator(
        'input[type="email"], input[type="text"], input[name="username"], input[name="email"]'
      )
      .first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill(ADMIN_EMAIL);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-email-filled.png'),
      fullPage: true,
    });

    await passwordInput.fill(ADMIN_PASSWORD);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-form-complete.png'),
      fullPage: true,
    });

    // Step 3: Submit login
    const loginButton = page
      .locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")')
      .first();

    // Listen for navigation/response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login') && response.status() === 200,
      { timeout: 10000 }
    );

    await loginButton.click();
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-button-clicked.png'),
      fullPage: true,
    });

    // Wait for login response
    try {
      const response = await responsePromise;
      console.log('Login response status:', response.status());
      const body = await response.json();
      console.log('Login response body:', JSON.stringify(body, null, 2));
    } catch (_e) {
      console.log('No login response captured, may have navigated away');
    }

    // Step 4: Wait for post-login state
    await page.waitForTimeout(3000);

    // Check localStorage for token
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('Token in localStorage:', token ? 'Present' : 'Not found');

    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05-after-login-page.png'),
      fullPage: true,
    });

    // Step 5: Check for any error messages
    const errorMessage = await page.locator('[role="alert"], .error, .alert-error').count();
    console.log('Error messages found:', errorMessage);

    // Step 6: Try to navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06-dashboard-navigation.png'),
      fullPage: true,
    });

    // Step 7: Check console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    // Step 8: Take a screenshot of the browser console/network
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '07-final-state.png'),
      fullPage: true,
    });

    // Verify we have a token (basic success check)
    expect(token).toBeTruthy();
  });

  test('Verify Bootstrap API Call', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const emailInput = page
      .locator(
        'input[type="email"], input[type="text"], input[name="username"], input[name="email"]'
      )
      .first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);

    // Track network requests
    const requests: any[] = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
      });
    });

    const responses: any[] = [];
    page.on('response', async response => {
      responses.push({
        url: response.url(),
        status: response.status(),
      });
    });

    const loginButton = page
      .locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")')
      .first();
    await loginButton.click();

    // Wait for navigation and API calls
    await page.waitForTimeout(5000);

    console.log('Network requests made:', JSON.stringify(requests, null, 2));
    console.log('Network responses received:', JSON.stringify(responses, null, 2));

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '08-with-network-activity.png'),
      fullPage: true,
    });
  });
});
