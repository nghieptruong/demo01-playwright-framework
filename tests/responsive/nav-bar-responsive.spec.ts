import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { testUser } from '../test-data/testUsers';
import { LoginPage } from '../../pages/LoginPage';

// This test checks the mobile navigation and search bar at the responsive breakpoint (959px)

test.describe('Responsive design', () => {

  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 959, height: 800 });

    homePage = new HomePage(page);
    await homePage.navigateToHomePageAndWait();
  });

  test('Mobile menu visiblility and navigation', async ({ page }) => {

    await test.step('Verify Mobile Menu button replaces navigation links on top bar', async () => {

      const btnMobileMenu = homePage.topBarNavigation.btnMobileMenu;
      await expect(btnMobileMenu).toBeVisible();

      const lnkDesktopRegister = homePage.topBarNavigation.lnkRegister;
      const lnkDesktopLogin = homePage.topBarNavigation.lnkLogin;
      const lnkDesktopUserProfile = homePage.topBarNavigation.lnkUserProfile;
      const lnkDesktopLogout = homePage.topBarNavigation.lnkLogout;

      await expect(lnkDesktopRegister).toBeHidden();
      await expect(lnkDesktopLogin).toBeHidden();
      await expect(lnkDesktopUserProfile).toBeHidden();
      await expect(lnkDesktopLogout).toBeHidden();

    });

    await test.step('Open Mobile Navigation Bar and verify navigation links visibility', async () => {

      await homePage.topBarNavigation.openMobileNavigationBar();

      const lnkMobileRegister = homePage.topBarNavigation.lnkMobileRegister;
      const lnkMobileLogin = homePage.topBarNavigation.lnkMobileLogin;

      await expect(lnkMobileRegister).toBeVisible();
      await expect(lnkMobileLogin).toBeVisible();

    });

    await test.step('Verify navigation links behavior on mobile', async () => {

      // Click Register link and verify navigation
      await homePage.topBarNavigation.clickRegisterLinkOnMobile();
      await homePage.verifyNavigationToRegisterPage();
      await homePage.navigateBack();

      // Open Menu again and verify Login link navigation
      await homePage.topBarNavigation.openMobileNavigationBar();
      await homePage.topBarNavigation.clickLoginLinkOnMobile();
      await homePage.verifyNavigationToLoginPage();

    });

    await test.step('Login and verify mobile navigation for logged-in user', async () => {

      // Login as default user
      const loginPage = new LoginPage(page);
      await loginPage.navigateToLoginPage;
      await loginPage.fillLoginFormAndSubmit(testUser.taiKhoan, testUser.matKhau);

      // Open mobile menu and verify user displayed name and account navigation
      await homePage.topBarNavigation.verifyNavigationToHomePage();
      await homePage.topBarNavigation.openMobileNavigationBar();

      await loginPage.topBarNavigation.verifyUserIsLoggedInMobile();

      await homePage.topBarNavigation.clickUserProfileLinkOnMobile();
      await homePage.verifyNavigationToAccountPage();

      await homePage.navigateBack();

      // Click Logout link and verify logout
      await homePage.topBarNavigation.openMobileNavigationBar();
      await homePage.topBarNavigation.clickLogoutLinkOnMobile();

      await homePage.topBarNavigation.closeMobileNavigationBar();
      await homePage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();

    });

  });

});
