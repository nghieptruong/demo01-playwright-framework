import { test } from "../../fixtures/custom-fixtures";
import { HomePage } from "../../pages/HomePage";

test.describe('Logout Functional Tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ loggedInHomepage }) => {
        await test.step('Log in and navigate to Homepage', async () => {
            homePage = new HomePage(loggedInHomepage.homePage.page);
        });
    });

    test('Cancel Logout Attempt', async ({ homePage }) => {

        await test.step('Click Logout and cancel at confirmation dialog', async () => {
            await homePage.topBarNavigation.clickLogoutLink();
            await homePage.topBarNavigation.cancelLogout();
        });

        await test.step('Verify user remains logged in', async () => {
            await homePage.topBarNavigation.verifyUserIsLoggedIn();
        });
    })

    test('Successful Logout @smoke @regression', async () => {
        await test.step('Click Logout and confirm at confirmation dialog', async () => {
            await homePage.topBarNavigation.clickLogoutLink();
            await homePage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();
        });

        await test.step('Verify user is logged out', async () => {
            await homePage.topBarNavigation.verifyLogoutSuccessAlert();
            await homePage.topBarNavigation.verifyNonLoggedInStatus();
        });
    })
})