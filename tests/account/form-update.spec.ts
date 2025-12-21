import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { LoginPage } from "../../pages/LoginPage";
import { userAccountUpdate, userPrimary } from "../test-data/testUsers";
import { generateDifferentName, generateDifferentPassword, generateDifferentPhoneNumber } from "../utils/auth.testDataGenerator";
import { generateTooShortPassword, generateValidRegisterData } from "../utils/auth.testDataGenerator";

// Run tests serially - all tests modify the same user account
test.describe.configure({ mode: 'serial' });

test.describe('Update User Account Functionality', () => {

    let loginPage: LoginPage;
    let accountPage: AccountPage;
    const user = userAccountUpdate;

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

    test.describe('Valid Update', () => {

        test(`Successful update new valid Name, Email, Phone Number @regression`, async ({ page }) => {

            let originalName: string, originalEmail: string, originalPhoneNr: string;
            let newName: string, newEmail: string, newPhoneNr: string;

            await test.step('Generate test data', async () => {
                const originalValues = await accountPage.extractUserDataFromForm();
                originalName = originalValues.hoTen;
                originalEmail = originalValues.email;
                originalPhoneNr = originalValues.soDt ?? '';

                newName = generateDifferentName(originalValues.hoTen);
                newPhoneNr = generateDifferentPhoneNumber(originalValues.soDt);
                newEmail = generateValidRegisterData().email;

            });

            await test.step('Perform updates and submit', async () => {

                await accountPage.changeFullName(newName);
                await accountPage.changeEmail(newEmail);
                await accountPage.changePhoneNumber(newPhoneNr);

                await accountPage.clickSaveButton();
            });

            await test.step('Verify success alert', async () => {
                await accountPage.verifyAndCloseSuccessAlert();
            });

            await test.step('Verify data persists after reload', async () => {
                await page.reload();
                await accountPage.waitForUserInfoForm();

                const updatedUserInfo = await accountPage.extractUserDataFromForm();

                expect.soft(updatedUserInfo.hoTen,
                    `Full name not updated correctly for user: ${user.taiKhoan}`
                ).toBe(newName);

                expect.soft(updatedUserInfo.email,
                    `Email not updated correctly for user: ${user.taiKhoan}`
                ).toBe(newEmail);

                expect.soft(updatedUserInfo.soDt,
                    `Phone number not updated correctly for user: ${user.taiKhoan}`
                ).toBe(newPhoneNr);
            });

            await test.step('Revert changes to original values', async () => {

                await accountPage.changeFullName(originalName);
                await accountPage.changeEmail(originalEmail);
                await accountPage.changePhoneNumber(originalPhoneNr);

                await accountPage.clickSaveButton();
                await accountPage.verifyAndCloseSuccessAlert();
            });
        })

        test(`Successful update new valid Password @regression`, async () => {

            test.setTimeout(120000); // Extend timeout for this test to avoid timeout preventing password reset

            //Get original password and generate different valid one
            const originalPassword = user.matKhau;
            const newPassword = generateDifferentPassword(originalPassword);

            try {
                // Perform password update
                await accountPage.changePassword(newPassword);
                await accountPage.clickSaveButton();

                // Assertion 1: Success alert visible
                await accountPage.verifyAndCloseSuccessAlert();

                // Assertion 2: Log out and verify Successful login with new password
                await accountPage.topBarNavigation.clickLogoutLink();
                await accountPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();

                await loginPage.navigateToLoginPage();
                await loginPage.fillLoginFormAndSubmit(user.taiKhoan, newPassword);
                await loginPage.topBarNavigation.verifyUserIsLoggedIn();

            } finally {
                
                // Always revert password to original, even if test fails
                await accountPage.navigateToAccountPage();
                await accountPage.waitForUserInfoForm();
                await accountPage.changePassword(originalPassword);
                await accountPage.clickSaveButton();
                await accountPage.verifyAndCloseSuccessAlert();
            }
        })
    })

    test.describe('Invalid Update', () => {

        test.describe('Due to Field validation error', () => {

            test('Blank name field blocks submsion', async ({ page }) => {

                // Attempt update with blank field and verify error message
                const originalValues = await accountPage.extractUserDataFromForm();
                const originalFullName = originalValues.hoTen;

                await accountPage.changeFullName('');
                await accountPage.clickSaveButton();

                // Assertion: Failed update - full name remains the same
                await page.reload();
                await accountPage.waitForUserInfoForm();

                const updatedUserInfo = await accountPage.extractUserDataFromForm();

                expect(updatedUserInfo.hoTen,
                    `Full name should not be updated when blank value submitted.`
                ).toBe(originalFullName);

            });

            test('Short password blocks submission', async ({ page }) => {

                // Test case: short password 
                // Generate and submit invalid input per error case
                const originalValues = await accountPage.extractUserDataFromForm();
                const originalPassword = originalValues.matKhau;

                const invalidPassword = generateTooShortPassword();

                // Attempt update with invalid value and verify error message
                await accountPage.changePassword(invalidPassword);
                await accountPage.clickSaveButton();

                // Assertion: Failed update - cannot login with invalid password
                await accountPage.topBarNavigation.clickLogoutLink();
                await accountPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();

                await loginPage.navigateToLoginPage();
                await loginPage.fillLoginFormAndSubmit(user.taiKhoan, invalidPassword);

                await loginPage.verifyPasswordFieldErrorMsgVisible();
                await loginPage.topBarNavigation.verifyNonLoggedInStatus();

                // Assertion: Reload and verify Successful login with original password
                await page.reload();
                await loginPage.fillLoginFormAndSubmit(user.taiKhoan, originalPassword);
                await loginPage.verifySuccessMsgAndLoggedInStatus();
            });

        })

        test.describe('Due to Form validation error (Server-Side)', () => {
            test('Uniqueness Error: Existing email @regression', async ({ page }) => {

                // Get different existing email from another user
                const differentExistingEmail = userPrimary.email;

                // Attempt update with existing email
                const originalValues = await accountPage.extractUserDataFromForm();
                const originalEmail = originalValues.email;

                await accountPage.changeEmail(differentExistingEmail);
                await accountPage.clickSaveButton();

                // Assertion: Email remains unchanged after reload
                await page.reload();
                await accountPage.waitForUserInfoForm();

                const updatedUserInfo = await accountPage.extractUserDataFromForm();

                expect(updatedUserInfo.email,
                    `Email should not be updated when existing email submitted.`
                ).toBe(originalEmail);
            });

        });

    })

})




