import { test } from "../../fixtures/custom-fixtures";
import { createNewTestUser, deleteTestUser } from "../utils/testUserProvider";
import { AccountDataApi } from "../../api/users/accounts.types";
import { loginAndGoToHomePage } from "../utils/shared.helpers";

test.describe('Logout Functional Tests', () => {
    
    let testUser: AccountDataApi;

    test.beforeEach(async ({ loginPage }) => {
            await test.step('Login as new test user', async () => {
                testUser = await createNewTestUser();
                await loginAndGoToHomePage(loginPage, testUser);
            });
    })
    
    test.afterEach(async () => {
        await test.step('Delete test user after test', async () => {
            await deleteTestUser(testUser.taiKhoan);
        });
    })
    
    test('Cancel Logout Attempt', async ({ homePage }) => {

        await test.step('Click Logout link on top bar and cancel at confirmation dialog', async () => {
            await homePage.topBarNavigation.clickLogoutLink();
            await homePage.topBarNavigation.cancelLogout();
        });

        await test.step('Verify user remains logged in', async () => {
            await homePage.topBarNavigation.verifyUserIsLoggedIn();
        });
    })

    test('Successful Logout @smoke @regression', async ({ homePage }) => {
        await test.step('Click Logout link on top bar and confirm at confirmation dialog', async () => {
            await homePage.topBarNavigation.clickLogoutLink();
            await homePage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();
        });

        await test.step('Verify user is logged out', async () => {
            await homePage.topBarNavigation.verifyLogoutSuccessAlert();
            await homePage.topBarNavigation.verifyNonLoggedInStatus();
        });
    })
})