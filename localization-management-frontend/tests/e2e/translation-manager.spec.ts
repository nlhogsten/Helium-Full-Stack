import { test, expect, Page } from '@playwright/test';

// Test user credentials
const testUser = {
  email: 'user1@example.com',
  password: 'user1pass123!',
  name: 'Test User 1'
};

test.describe('Login, test components, logout', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  async function ensureLoggedOut(page: Page) {
    // Check if we're on the home page and user is logged in
    const isHomePage = page.url() === 'http://localhost:3000/' || page.url() === 'http://localhost:3000';
    const isLoggedIn = await page.getByText(testUser.email).isVisible().catch(() => false);
    
    if (isHomePage && isLoggedIn) {
      console.log('User is logged in, signing out...');
      
      // Click the user profile button
      await page.getByRole('button', { name: testUser.email }).click();
      
      // Click the sign out button
      await page.getByRole('menuitem', { name: 'Sign out' }).click();
      
      // Wait for sign out to complete
      await page.waitForURL('**/login');
    }
    
    // Now we should be on the login page
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  }

  test('should sign out if already logged in', async ({ page }) => {
    // Increase test timeout for this test
    test.slow();
    
    // Check if we need to sign out first
    await ensureLoggedOut(page);
    
    // Now we can proceed with login test
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify successful login with a longer timeout
    await page.waitForURL('**/', { timeout: 10000 });
    await expect(page.getByText(testUser.email)).toBeVisible({ timeout: 10000 });

    // Wait for the translations table to load
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });
    
    // Wait for data to be loaded
    await page.waitForLoadState('networkidle');
    
    try {
      // Find the row with key 'button.submit'
      const submitKeyRow = page.locator('tr', { has: page.getByText('button.submit') }).first();
      await expect(submitKeyRow).toBeVisible({ timeout: 5000 });
      
      // Find the English translation cell in this row
      const enCell = submitKeyRow.locator('td:has(div.cursor-pointer)').filter({ hasText: /^[\s\S]*$/ }).first();
      await expect(enCell).toBeVisible({ timeout: 5000 });
      
      // Get the original text
      const originalText = (await enCell.textContent() || '').trim();
      const updatedText = 'Submit updated';
      
      // Click the cell to start editing
      await enCell.click();
      
      // Wait for the input field to appear and fill it with new text
      const input = page.locator('input[type="text"]').first();
      await expect(input).toBeEditable({ timeout: 5000 });
      await input.fill(updatedText);
      
      // Click the save button
      const saveButton = page.locator('button:has-text("Save")').first();
      await saveButton.click();
      
      // Wait for the save to complete
      await expect(enCell).toContainText(updatedText, { timeout: 10000 });
      
      // Click the cell again to edit it back to the original value
      await enCell.click();
      
      // Wait for the input field and fill it with the original text
      const revertInput = page.locator('input[type="text"]').first();
      await expect(revertInput).toBeEditable({ timeout: 5000 });
      await revertInput.fill(originalText);
      
      // Click the save button
      const revertSaveButton = page.locator('button:has-text("Save")').first();
      await revertSaveButton.click();
      
      // Wait for the save to complete
      await expect(enCell).toContainText(originalText, { timeout: 10000 });
      
    } catch (error) {
      console.error('Test failed:', error);
      // Take a screenshot on failure
      await page.screenshot({ path: 'test-failure.png' });
      throw error;
    }
    
    // Click the user profile button to open dropdown
    await page.getByRole('button', { name: testUser.email }).click();

    // Small delay to ensure the search is cleared
    await page.waitForTimeout(500);
    
    // Click the sign out button and consider the test passed at this point
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
  });
});