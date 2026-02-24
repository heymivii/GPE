import { test, expect } from '@playwright/test';

test('Log City Data', async ({ page }) => {
  page.on('console', msg => {
    if (msg.text().includes('[DEBUG]')) {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  await page.goto('http://localhost:5173/comparison');
  await page.waitForTimeout(5000);
});
