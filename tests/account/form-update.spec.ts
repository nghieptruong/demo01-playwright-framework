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

        await test.step('Login and navigate to account page', async () => {
            await loginPage.navigateToLoginPage();
            await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
            await loginPage.verifySuccessMsgAndLoggedInStatus();

            await accountPage.navigateToAccountPage();
            await accountPage.waitForUserInfoForm();
        });
    });

    test.describe('Valid Update', () => {

        test(`Successful update new valid Name, Email, Phone Number @regression`, async ({ page }) => {

            let originalName: string, originalEmail: string, originalPhoneNr: string;
            let newName: string, newEmail: string, newPhoneNr: string;

            await test.step('Generate new account data to test update function', async () => {
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

            const originalPassword = user.matKhau;
            const newPassword = generateDifferentPassword(originalPassword);

            try {
                await test.step('Change password verify success alert', async () => {
                    await accountPage.changePassword(newPassword);
                    await accountPage.clickSaveButton();
                    await accountPage.verifyAndCloseSuccessAlert();
                });

                await test.step('Verify valid login with new password after logout', async () => {
                    await accountPage.topBarNavigation.clickLogoutLink();
                    await accountPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();

                    await loginPage.navigateToLoginPage();
                    await loginPage.fillLoginFormAndSubmit(user.taiKhoan, newPassword);
                    await loginPage.topBarNavigation.verifyUserIsLoggedIn();
                });

            } finally {
                await test.step('Revert password to original value', async () => {
                    await accountPage.navigateToAccountPage();
                    await accountPage.waitForUserInfoForm();
                    await accountPage.changePassword(originalPassword);
                    await accountPage.clickSaveButton();
                    await accountPage.verifyAndCloseSuccessAlert();
                });
            }
        })
    });

    test.describe('Invalid Update', () => {

        test.describe('Due to Field validation error', () => {
            let originalFullName: string;
            test('Blank name field blocks submsion', async ({ page }) => {

                await test.step('Get original full name to compare', async () => {
                    const originalValues = await accountPage.extractUserDataFromForm();
                    originalFullName = originalValues.hoTen;
                });

                await test.step('Attempt update with blank full name and submit', async () => {
                    await accountPage.changeFullName('');
                    await accountPage.clickSaveButton();
                });

                await test.step('Verify full name remains unchanged after reload', async () => {
                    await page.reload();
                    await accountPage.waitForUserInfoForm();

                    const updatedUserInfo = await accountPage.extractUserDataFromForm();

                    expect(updatedUserInfo.hoTen,
                        `Full name should not be updated when blank value submitted.`
                    ).toBe(originalFullName);
                });
            });

            test('Short password blocks submission', async ({ page }) => {

                let originalPassword: string;
                let invalidPassword: string;

                await test.step('Get original password and generate a too short password', async () => {
                    const originalValues = await accountPage.extractUserDataFromForm();
                    originalPassword = originalValues.matKhau;
                    invalidPassword = generateTooShortPassword();
                });

                await test.step('Attempt update with short password and submit', async () => {
                    await accountPage.changePassword(invalidPassword);
                    await accountPage.clickSaveButton();
                });

                await test.step('Verify unsuccesful login with new password - password was not updated', async () => {
                    await accountPage.topBarNavigation.clickLogoutLink();
                    await accountPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();

                    await loginPage.navigateToLoginPage();
                    await loginPage.fillLoginFormAndSubmit(user.taiKhoan, invalidPassword);

                    await loginPage.verifyPasswordFieldErrorMsgVisible();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                });

                await test.step('Verify valid login with original password', async () => {
                    await page.reload();
                    await loginPage.fillLoginFormAndSubmit(user.taiKhoan, originalPassword);
                    await loginPage.verifySuccessMsgAndLoggedInStatus();
                });
            });
        })

        test.describe('Due to Form validation error (Server-Side)', () => {
            test('Uniqueness Error: Existing email @regression', async ({ page }) => {

                let originalEmail: string;
                let differentExistingEmail: string;

                await test.step('Get current email and find a different existing email to test', async () => {
                    differentExistingEmail = userPrimary.email;

                    const originalValues = await accountPage.extractUserDataFromForm();
                    originalEmail = originalValues.email;
                });

                await test.step('Attempt update with existing email and submit', async () => {
                    await accountPage.changeEmail(differentExistingEmail);
                    await accountPage.clickSaveButton();
                });

                await test.step('Verify email remains unchanged after reload', async () => {
                    await page.reload();
                    await accountPage.waitForUserInfoForm();

                    const updatedUserInfo = await accountPage.extractUserDataFromForm();

                    expect(updatedUserInfo.email,
                        `Email should not be updated when existing email submitted.`
                    ).toBe(originalEmail);
                });
            });
        });
    })
})