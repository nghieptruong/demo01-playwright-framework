import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { LoginPage } from "../../pages/LoginPage";
import { userAccountReadonly } from "../test-data/testUsers";
import { generateValidRegisterData } from "../utils/auth.testDataGenerator";

let loginPage: LoginPage;
let accountPage: AccountPage;
const user = userAccountReadonly;

test.beforeEach(async ({ page }) => {

    // Initialize pages and test user
    loginPage = new LoginPage(page);
    accountPage = new AccountPage(page);

    // Login as testUser and navigate to account page
    await loginPage.navigateToLoginPage();
    await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
    await loginPage.verifySuccessMsgAndLoggedInStatus();

    await accountPage.navigateToAccountPage();
    await accountPage.waitForUserInfoForm();
});


test.describe('Read-Only User Account Fields', () => {

    test('User cannot change readonly fields (username and user type) @regression', async ({ page, loginPage }) => {

        let originalUsername: string;
        let originalUserType: string;
        let newUsername: string;

        await test.step('Get original values', async () => {
            const uiUserInfo = await accountPage.extractUserDataFromForm();

            originalUsername = uiUserInfo.taiKhoan;
            originalUserType = uiUserInfo.maLoaiNguoiDung;
            newUsername = generateValidRegisterData().taiKhoan;
        });

        await test.step('Verify user cannot switch user type (to Admin)', async () => {
            // Attempt to change user type
            await accountPage.attemptToChangeUserTypeToAdmin();
            await accountPage.clickSaveButton();

            // Reload and verify user type remains unchanged
            await page.reload();
            await accountPage.waitForUserInfoForm();

            const updatedUserInfo = await accountPage.extractUserDataFromForm();

            expect(updatedUserInfo.maLoaiNguoiDung,
                `User type should not be editable. Expected: ${originalUserType}, Received: ${updatedUserInfo.maLoaiNguoiDung}`
            ).toBe(originalUserType);
        });

        await test.step('Verify username is readonly', async () => {
            // Attempt to change username
            await accountPage.attemptToChangeUsername(newUsername);
            await accountPage.clickSaveButton();

            // Reload and verify username remains unchanged
            await page.reload();
            await accountPage.waitForUserInfoForm();

            const updatedUserInfo = await accountPage.extractUserDataFromForm();
            expect(updatedUserInfo.taiKhoan, 'Username should not be editable.').toBe(originalUsername);
        });

        await test.step('Logout and verify cannot login with attempted new username', async () => {

            // Logout and navigate to login page
            await accountPage.topBarNavigation.clickLogoutLink();
            await accountPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();

            await loginPage.navigateToLoginPage();

            // Verify new username doesn't work (username change was rejected)
            await loginPage.fillLoginFormAndSubmit(newUsername, user.matKhau);
            await loginPage.verifyInvalidCredentialAlert();
            await loginPage.topBarNavigation.verifyNonLoggedInStatus();

            // Reload and log in with original username(confirms username unchanged)
            await page.reload();
            await loginPage.fillLoginFormAndSubmit(originalUsername, user.matKhau);
            await loginPage.verifySuccessMsgAndLoggedInStatus();
        });

    });
});

