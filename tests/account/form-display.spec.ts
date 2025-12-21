import { accountDataKeys } from "../../api/users/accounts.types";
import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { LoginPage } from "../../pages/LoginPage";
import { userAccountDisplay } from "../test-data/testUsers";

let accountPage: AccountPage;
let loginPage: LoginPage;

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    accountPage = new AccountPage(page);

    await loginPage.navigateToLoginPage();
});

test.describe('Verify Account Displays Correct User Data', () => {

    for (const user of userAccountDisplay) {

        test(`Check account data for user: ${user.taiKhoan}`, async () => {

            await test.step(`Login and navigate to account page`, async () => {
                await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
                await loginPage.topBarNavigation.verifyUserIsLoggedIn();
                await accountPage.navigateToAccountPage();
            });

            await test.step(`Verify user info form is displayed`, async () => {
                // Assertion: User account form is visible
                const formVisible = await accountPage.isUserInfoFormVisible();

                expect(formVisible,
                    `User info form not visible for user: ${user.taiKhoan}`
                ).toBe(true);
            });

            await test.step(`Extract and verify user info data`, async () => {

                const uiUserInfo = await accountPage.extractUserDataFromForm();

                // Assertion 1: Correct user is loaded (username is unique and read-only)
                expect(uiUserInfo.taiKhoan, `Wrong user loaded`).toBe(user.taiKhoan);

                // Assertion 2: Check all other fields 
                for (const key of accountDataKeys) {
                    if (key === 'taiKhoan') continue; // Skip username as it's already verified

                    expect.soft(uiUserInfo[key],
                        `Mismatch for user ${user.taiKhoan}, field ${key}`
                    ).toBe(user[key]);
                }
            });

            await test.step(`Logout to reset state`, async () => {
                await loginPage.topBarNavigation.clickLogoutLink();
                await loginPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();
            });
        });
    }
});