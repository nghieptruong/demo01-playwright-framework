import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

// This test checks for changes in Homepage UI components at responsive breakpoint (959px)

test.describe('Responsive Homepage UI', () => {

  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {

    await test.step('Set viewport to mobile size and navigate to homepage', async () => {
      await page.setViewportSize({ width: 959, height: 800 });

      homePage = new HomePage(page);
      await homePage.navigateToHomePageAndWait();
    });

  });

  test('Display search bar and remove dropdowns and tabs', async () => {

    await test.step('Verify search bar replaces dropdown selectors on mobile', async () => {

      // Search bar should be visible and enabled
      await expect(homePage.mobileMovieSearchBar.txtSearchBar).toBeVisible();
      await expect(homePage.mobileMovieSearchBar.btnSearchSubmit).toBeEnabled();
    });

    await test.step('Verify dropdown selectors are hidden on mobile', async () => {
      await expect(homePage.showtimeSelector.selMovieDropdown).toBeHidden();
      await expect(homePage.showtimeSelector.selCinemaBranchDropdown).toBeHidden();
      await expect(homePage.showtimeSelector.selShowtimeDropdown).toBeHidden();
    });

    await test.step('Cinema Tabs are removed on Homepage', async () => {
      await expect(homePage.cinemaShowtimesTabs.tabComponent).toBeHidden();
    });

  });

});
