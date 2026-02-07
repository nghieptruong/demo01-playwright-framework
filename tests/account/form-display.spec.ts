import { accountDataKeys } from "../../api/users/accounts.types";
import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { LoginPage } from "../../pages/LoginPage";
import { AccountDataApi } from "../../api/users/accounts.types";
import { createTestUserForAccountFormTest, deleteTestUser } from "../utils/testUserProvider";
import { loginAndGoToHomePage } from "../utils/shared.helpers";

let accountPage: AccountPage;
let loginPage: LoginPage;
let testUser: AccountDataApi;

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    accountPage = new AccountPage(page);

    await test.step('Login as new test user', async () => {
        // Using specific user generator due to known issue with special characters and spaces in name field
        testUser = await createTestUserForAccountFormTest();
        await loginAndGoToHomePage(loginPage, testUser);
    });

    await test.step(`Navigate to account page`, async () => {
        await accountPage.navigateToAccountPage();
    });
});

test.afterEach(async () => {
    await test.step('Delete test user after test', async () => {
        await deleteTestUser(testUser.taiKhoan);
    });
});

test(`Verify account form displays correct user data `, async () => {

    await test.step(`Verify user info form is displayed`, async () => {
        // Assertion: User account form is visible
        const formVisible = await accountPage.isUserInfoFormVisible();

        expect(formVisible,
            `User info form not visible for user: ${testUser.taiKhoan}`
        ).toBe(true);
    });

    await test.step(`Extract and verify user info data`, async () => {

        const uiUserInfo = await accountPage.extractUserDataFromForm();

        // Assertion 1: Correct user is loaded (username is unique and read-only)
        expect(uiUserInfo.taiKhoan, `Wrong user loaded`).toBe(testUser.taiKhoan);

        // Assertion 2: Check all other fields 
        for (const key of accountDataKeys) {
            if (key === 'taiKhoan') continue; // Skip username as it's already verified

            expect.soft(uiUserInfo[key],
                `Mismatch for user ${testUser.taiKhoan}, field ${key}`
            ).toBe(testUser[key]);
        }
    });

    await test.step(`Logout to reset state`, async () => {
        await loginPage.topBarNavigation.clickLogoutLink();
        await loginPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();
    });
});