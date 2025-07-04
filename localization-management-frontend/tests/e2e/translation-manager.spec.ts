import { test, expect, Page } from '@playwright/test';

// Test user credentials
const testUser = {
  email: 'user1@example.com',
  password: 'user1pass123!',
  name: 'Test User 1'
};

test.describe('Translation Manager Authentication', () => {
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
    // Check if we need to sign out first
    await ensureLoggedOut(page);
    
    // Now we can proceed with login test
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify successful login
    await page.waitForURL('/');
    await expect(page.getByText(testUser.email)).toBeVisible();

    // Wait for the translations table to load
    await page.waitForSelector('table');
    
    // Find the first editable cell that's not empty (skip the key and category columns)
    const firstEditableCell = page.locator('td:has(div.cursor-pointer):not(:empty)').first();
    await expect(firstEditableCell).toBeVisible();
    
    // Get the original text
    const originalText = (await firstEditableCell.textContent()) || ''; // Ensure we have a string
    const newText = originalText + ' updated';
    
    // Click the cell to start editing
    await firstEditableCell.click();
    
    // Wait for the input field to appear and fill it with new text
    const input = page.locator('input[type="text"]').first();
    await expect(input).toBeEditable();
    await input.fill(newText);
    
    // Click the save button
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    
    // Wait for the save to complete and verify the cell shows the updated text
    await expect(firstEditableCell).toContainText(newText);

    // Click the cell again to edit it back to the original value
    await firstEditableCell.click();
    
    // Wait for the input field and fill it with the original text
    const revertInput = page.locator('input[type="text"]').first();
    await expect(revertInput).toBeEditable();
    await revertInput.fill(originalText);
    
    // Click the save button
    const revertSaveButton = page.locator('button:has-text("Save")').first();
    await revertSaveButton.click();
    
    // Wait for the save to complete and verify the cell shows the original text
    await expect(firstEditableCell).toContainText(originalText);
    
    // Test search functionality
    const searchInput = page.getByPlaceholder('Search Keys & Categories…');
    await searchInput.click();
    
    // Get the initial count of visible rows
    const initialRowCount = await page.locator('tbody tr').count();
    
    // Search for something we know exists (using the original text we just verified)
    await searchInput.fill(originalText);
    
    // Wait for the table to update and verify we have at least one matching row
    // and fewer rows than before the search
    await expect(async () => {
      const rowCount = await page.locator('tbody tr').count();
      expect(rowCount).toBeGreaterThan(0);
      expect(rowCount).toBeLessThan(initialRowCount);
    }).toPass();
    
    // Verify the original text is visible in one of the rows
    await expect(page.locator('tbody tr', { hasText: originalText })).toBeVisible();
    
    // Clear the search
    await searchInput.fill('');
    
    // Wait for the table to show all rows again
    await expect(page.locator('tbody tr')).toHaveCount(initialRowCount);
    
    // Search for something that doesn't exist
    const nonExistentTerm = 'thistermdoesnotexist123';
    await searchInput.fill(nonExistentTerm);
    
    // Verify the "no results" message appears
    await expect(page.getByText(`No translations found matching "${nonExistentTerm}"`)).toBeVisible();
    
    // Clear the search again
    await searchInput.fill('');
    
    // Wait for the table to show all rows again
    await expect(page.locator('tbody tr')).toHaveCount(initialRowCount);

    // Click the user profile button to open dropdown
    await page.getByRole('button', { name: testUser.email }).click();

    // Small delay to ensure the search is cleared
    await page.waitForTimeout(500);
    
    // Click the sign out button
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    
    // Wait for sign out to complete and verify redirect to login page
    await page.waitForURL('**/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});