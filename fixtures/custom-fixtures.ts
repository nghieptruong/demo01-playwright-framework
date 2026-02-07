import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { test as base } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { testUser } from '../tests/test-data/testUsers';
import { AccountDataApi } from '../api/users/accounts.types';

type MyFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  loggedInHomepage: {
    homePage: HomePage;
    user: AccountDataApi;
  };
};

export const test = base.extend<MyFixtures>({
  homePage: async ({ page }, use) => {
    // Set up the fixture
    const homePage = new HomePage(page);
    // Use the fixture value in the test
    await use(homePage);
  },

  loginPage: async ({ page }, use) => {
    const cachedLoginPage = new LoginPage(page);
    await use(cachedLoginPage);
  },

  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },

  loggedInHomepage: async ({ page, loginPage }, use) => {
    // Use default test user for logged-in homepage
    const user = testUser;

    // Login flow
    await loginPage.navigateToLoginPage();
    await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
    await loginPage.topBarNavigation.verifyUserIsLoggedIn();

    // Go to homepage
    const homePage = new HomePage(page);
    await homePage.navigateToHomePageAndWait();

    await use({ homePage, user });
  },
});

export { expect } from '@playwright/test';