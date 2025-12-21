import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { getSingleAccountByUsername } from "../../api/users/accounts.helpers";
import { generateDifferentName, generateDifferentPassword } from "../utils/auth.testDataGenerator";
import { generateValidRegisterData } from "../utils/auth.testDataGenerator";

test.describe('E2E: Complete Authentication Flow', () => {

    test('Register → Login → Update Profile → Logout → Login Again', async ({ page, registerPage, loginPage }) => {

        const { taiKhoan, matKhau, confirmPassWord, hoTen, email } = await generateValidRegisterData();
        const differentName = await generateDifferentName(hoTen);
        const accountPage = new AccountPage(page);

        await test.step('Register new user account', async () => {
            await registerPage.navigateToRegisterPage();
            await registerPage.fillFormAndSubmit(taiKhoan, matKhau, confirmPassWord, hoTen, email);

            await registerPage.verifyRegisterSuccessMsg();
        });

        await test.step('Login with registered credentials', async () => {
            await loginPage.navigateToLoginPage();
            await loginPage.fillLoginFormAndSubmit(taiKhoan, matKhau);

            await loginPage.verifySuccessMsgAndLoggedInStatus();
        });

        await test.step('Navigate to account page and verify correct API call', async () => {

            // Monitor network requests
            const apiRequestPromise = page.waitForRequest(request =>
                request.url().includes('/QuanLyNguoiDung/') &&
                request.method() === 'GET'
            );

            await accountPage.navigateToAccountPage();

            const apiRequest = await apiRequestPromise;
            const requestUrl = apiRequest.url();

            // Verify API call uses username (taiKhoan) since it is unique identifier
            expect(requestUrl, 'API should fetch profile by username').toContain(taiKhoan);
            expect(requestUrl, 'API URL should use hyphens (-) only to connect multi-word keyword').not.toMatch(/\+|%20|_/);
        });

        await test.step('Verify profile data loads correctly in UI', async () => {

            await accountPage.waitForUserInfoForm();
            const initialProfile = await accountPage.extractUserDataFromForm();

            expect(initialProfile.taiKhoan, 'Username field should match registered username').toBe(taiKhoan);
            expect(initialProfile.hoTen, 'Full name field should match registered name').toBe(hoTen);
            expect(initialProfile.email, 'Email field should match registered email').toBe(email);
        });

        await test.step('Update profile name', async () => {
            await accountPage.changeFullName(differentName);
            await accountPage.clickSaveButton();

            await accountPage.verifyAndCloseSuccessAlert();
        });

        await test.step('Verify backend data matches updated profile', async () => {
            const apiAccount = await getSingleAccountByUsername(taiKhoan);

            expect(apiAccount.hoTen).toBe(differentName);
        });

        await test.step('Logout from account', async () => {
            await accountPage.topBarNavigation.clickLogoutLink();
            await accountPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();

            await accountPage.topBarNavigation.verifyNonLoggedInStatus();
        });

        await test.step('Re-login and verify updated name displayed', async () => {
            await loginPage.navigateToLoginPage();
            await loginPage.fillLoginFormAndSubmit(taiKhoan, matKhau);

            await loginPage.verifySuccessMsgAndLoggedInStatus();
            await loginPage.topBarNavigation.verifyUserDisplayedName(differentName);

        });
    });

    test('Register → Login → Change Password → Logout → Login with New Password', async ({ page, registerPage, loginPage }) => {

        const { taiKhoan, matKhau, confirmPassWord, hoTen, email } = await generateValidRegisterData();
        const newPassword = generateDifferentPassword(matKhau);
        const accountPage = new AccountPage(page);

        await test.step('Register new user account', async () => {
            await registerPage.navigateToRegisterPage();
            await registerPage.fillFormAndSubmit(taiKhoan, matKhau, confirmPassWord, hoTen, email);

            await registerPage.verifyRegisterSuccessMsg();
        });

        await test.step('Login with registered credentials', async () => {
            await loginPage.navigateToLoginPage();
            await loginPage.fillLoginFormAndSubmit(taiKhoan, matKhau);

            await loginPage.verifySuccessMsgAndLoggedInStatus();
        });

        await test.step('Change password in account page', async () => {

            await accountPage.navigateToAccountPage();
            await accountPage.waitForUserInfoForm();

            await accountPage.changePassword(newPassword);
            await accountPage.clickSaveButton();

            await accountPage.verifyAndCloseSuccessAlert();
        });

        await test.step('Logout from account', async () => {
            await accountPage.topBarNavigation.clickLogoutLink();
            await accountPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();

            await accountPage.topBarNavigation.verifyNonLoggedInStatus();
        });

        await test.step('Verify old password no longer works', async () => {
            await loginPage.navigateToLoginPage();
            await loginPage.fillLoginFormAndSubmit(taiKhoan, matKhau);

            await loginPage.verifyInvalidCredentialAlert();
            await loginPage.topBarNavigation.verifyNonLoggedInStatus();
        });

        await test.step('Login successfully with new password', async () => {
            await loginPage.fillLoginFormAndSubmit(taiKhoan, newPassword);

            await loginPage.verifySuccessMsgAndLoggedInStatus();

        });
    });

});
