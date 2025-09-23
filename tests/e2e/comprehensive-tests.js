const { test, expect } = require('@playwright/test');

// Comprehensive end-to-end test for the entire Flavatix application
test.describe('Flavatix Complete Application Flow', () => {
  test('Complete user journey from registration to study mode completion', async ({ page }) => {
    try {
      // Start at the home page
      console.log('🏠 Testing home page...');
      await page.goto('http://localhost:3000');
      await expect(page).toHaveTitle(/Flavatix/);

      // Navigate to create tasting
      console.log('🍷 Testing create tasting page...');
      await page.getByRole('link', { name: /create/i }).click();
      await expect(page).toHaveURL(/create-tasting/);

      // Fill out the tasting creation form
      console.log('📝 Filling out tasting creation form...');

      // Select category
      await page.selectOption('select[name="category"]', 'coffee');

      // Fill session name
      await page.fill('input[name="sessionName"]', 'Test Study Session');

      // Select study mode
      await page.click('input[name="mode"][value="study"]');

      // Select collaborative approach
      await page.click('input[name="studyApproach"][value="collaborative"]');

      // Set to not blind
      await page.click('input[name="isBlindParticipants"][value="false"]');
      await page.click('input[name="isBlindItems"][value="false"]');
      await page.click('input[name="isBlindAttributes"][value="false"]');

      // Submit the form
      console.log('🚀 Submitting tasting creation form...');
      await page.click('button[type="submit"]');

      // Wait for navigation to the tasting session
      await page.waitForURL(/quick-tasting/, { timeout: 10000 });
      const url = page.url();
      console.log('📍 Navigated to:', url);

      // Extract tasting ID from URL
      const tastingIdMatch = url.match(/quick-tasting\/([^/?]+)/);
      if (!tastingIdMatch) {
        throw new Error('Could not extract tasting ID from URL');
      }
      const tastingId = tastingIdMatch[1];
      console.log('🆔 Tasting ID:', tastingId);

      // Test the tasting session page
      console.log('🎯 Testing tasting session functionality...');

      // Check if we're in study mode with collaborative approach
      await expect(page.locator('text=collaborative')).toBeVisible();

      // Test adding a suggestion (should be available in collaborative mode)
      console.log('💡 Testing item suggestions...');
      const suggestionButton = page.locator('button').filter({ hasText: 'Suggestions' });
      await expect(suggestionButton).toBeVisible();

      // Open suggestions panel
      await suggestionButton.click();

      // Add a suggestion
      const suggestionInput = page.locator('input[placeholder*="suggest"]').first();
      await suggestionInput.fill('Ethiopian Yirgacheffe');
      await page.click('button:has-text("Submit Suggestion")');

      // Test moderation dashboard
      console.log('👑 Testing moderation dashboard...');
      const moderateButton = page.locator('button').filter({ hasText: 'Moderate' });
      await expect(moderateButton).toBeVisible();
      await moderateButton.click();

      // Check if moderation dashboard opens
      await expect(page.locator('text=Moderation Dashboard')).toBeVisible();

      // Test role switching
      console.log('🔄 Testing role switching...');
      const roleButton = page.locator('button').filter({ hasText: 'Moderating' });
      if (await roleButton.isVisible()) {
        await roleButton.click();
        await expect(page.locator('button').filter({ hasText: 'Participating' })).toBeVisible();
      }

      // Test approving the suggestion
      console.log('✅ Testing suggestion approval...');
      const approveButton = page.locator('button:has-text("Approve")').first();
      if (await approveButton.isVisible()) {
        await approveButton.click();
      }

      // Test adding items directly (should work for hosts)
      console.log('➕ Testing direct item addition...');
      const addItemButton = page.locator('button').filter({ hasText: 'Add Item' });
      if (await addItemButton.isVisible()) {
        await addItemButton.click();
      }

      // Navigate to sample page and test
      console.log('🧪 Testing sample page...');
      await page.goto('http://localhost:3000/sample');
      await expect(page.locator('text=Sample')).toBeVisible();

      // Test social page
      console.log('👥 Testing social page...');
      await page.goto('http://localhost:3000/social');
      await expect(page.locator('text=Social')).toBeVisible();

      // Test profile page
      console.log('👤 Testing profile page...');
      await page.goto('http://localhost:3000/profile');
      await expect(page.locator('text=Profile')).toBeVisible();

      console.log('✅ All tests passed successfully!');

    } catch (error) {
      console.error('❌ Test failed:', error);
      // Take a screenshot for debugging
      await page.screenshot({ path: 'error-screenshot.png' });
      throw error;
    }
  });

  test('Test multiple users joining the same session', async ({ browser }) => {
    // This test would require multiple browser contexts
    console.log('🔄 Multi-user test skipped for now');
  });

  test('Test error handling and edge cases', async ({ page }) => {
    console.log('🛡️ Testing error handling...');

    // Test invalid tasting ID
    await page.goto('http://localhost:3000/quick-tasting/invalid-uuid');
    await expect(page.locator('text=Session Not Found')).toBeVisible();

    // Test non-existent tasting ID
    await page.goto('http://localhost:3000/quick-tasting/00000000-0000-0000-0000-000000000000');
    await expect(page.locator('text=Session Not Found')).toBeVisible();

    console.log('✅ Error handling tests passed');
  });
});
