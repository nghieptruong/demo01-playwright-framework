import { test } from "../../fixtures/custom-fixtures";
import { HomePage } from "../../pages/HomePage";


// Double check: create new unique users in beforeEach?

test.describe('Logout Functional Tests', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ loggedInHomepage }) => {
        homePage = new HomePage(loggedInHomepage.homePage.page);
    });

    test('Successful Logout @smoke @regression', async () => {

        await homePage.topBarNavigation.clickLogoutLink();
        await homePage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();

        await homePage.topBarNavigation.verifyLogoutSuccessAlert();
        await homePage.topBarNavigation.verifyNonLoggedInStatus();
    })

    test('Cancel Logout Attempt', async ({ homePage }) => {

        // Initiate logout but cancel at confirmation dialog
        await homePage.topBarNavigation.clickLogoutLink();
        await homePage.topBarNavigation.cancelLogout();

        await homePage.topBarNavigation.verifyUserIsLoggedIn();
    })
})