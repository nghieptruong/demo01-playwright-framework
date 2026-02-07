import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { LoginPage } from "../../pages/LoginPage";
import { generateValidUiRegisterData } from "../utils/accountDataGenerator";
import { createTestUserForAccountFormTest, deleteTestUser } from "../utils/testUserProvider";
import { loginAndGoToHomePage } from "../utils/shared.helpers";
import type { AccountDataApi } from "../../api/users/accounts.types";

test.describe('Read-Only User Account Fields', () => {

    let accountPage: AccountPage;
    let user: AccountDataApi;

    test.beforeEach(async ({ page }) => {

        const loginPage = new LoginPage(page);
        accountPage = new AccountPage(page);

        await test.step('Login as new test user', async () => {
            // Using specific user generator due to known issue with special characters and spaces in name field
            user = await createTestUserForAccountFormTest();
            await loginAndGoToHomePage(loginPage, user);
        });

        await test.step(`Navigate to account page and wait for account form display`, async () => {
            await accountPage.navigateToAccountPage();
            await accountPage.waitForUserInfoForm();
        });

    });

    test.afterEach(async () => {
        await test.step('Delete test user after test', async () => {
            await deleteTestUser(user.taiKhoan);
        });
    });

    test('Username is read-only @regression', async ({ page, loginPage }) => {

        let newUsername: string;

        await test.step('Attempt to update username field with new input', async () => {
            // Attempt to change username
            newUsername = generateValidUiRegisterData().taiKhoan;
            await accountPage.attemptToChangeUsername(newUsername);
            await accountPage.clickSaveButton();
        });

        await test.step('Verify username remains unchanged on UI after reload', async () => {
            // Reload and verify username remains unchanged
            await page.reload();
            await accountPage.waitForUserInfoForm();

            const updatedUserInfo = await accountPage.extractUserDataFromForm();
            expect(updatedUserInfo.taiKhoan,
                `Username should not be editable. Original: ${user.taiKhoan}, Attempted update: ${newUsername}, UI displays: ${updatedUserInfo.taiKhoan}`)
                .toBe(user.taiKhoan);
        });

        await test.step('Verify user cannot login with new username', async () => {
            // Logout and navigate to login page
            await accountPage.topBarNavigation.clickLogoutLink();
            await accountPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();
            await loginPage.navigateToLoginPage();

            // Verify login fails with new username
            await loginPage.fillLoginFormAndSubmit(newUsername, user.matKhau);
            await loginPage.verifyInvalidCredentialAlert();
            await loginPage.topBarNavigation.verifyNonLoggedInStatus();
        });

        await test.step('Login with original username to confirm it remains unchanged', async () => {
            await loginPage.navigateToLoginPage();
            await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
            await loginPage.verifySuccessMsgAndLoggedInStatus();
        });
    });

    test('User Type is read-only @regression', async ({ page }) => {

        await test.step('Attempt to select Admin as User Type', async () => {
            // Attempt to change user type
            await accountPage.attemptToChangeUserTypeToAdmin();
            await accountPage.clickSaveButton();

        });

        await test.step('Verify user type remains unchanged', async () => {
            // Reload and verify user type remains unchanged
            await page.reload();
            await accountPage.waitForUserInfoForm();

            const updatedUserInfo = await accountPage.extractUserDataFromForm();

            expect(updatedUserInfo.maLoaiNguoiDung,
                `User type should not be editable. Expected: ${user.maLoaiNguoiDung}, Received: ${updatedUserInfo.maLoaiNguoiDung}`
            ).toBe(user.maLoaiNguoiDung);
        });
    });

});

