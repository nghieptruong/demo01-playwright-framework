import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { LoginPage } from "../../pages/LoginPage";
import { generateDifferentName, generateDifferentPassword, generateDifferentPhoneNumber } from "../utils/accountDataGenerator";
import { generateTooShortPassword, generateValidUiRegisterData } from "../utils/accountDataGenerator";
import { createTestUserForAccountFormTest, deleteTestUser } from "../utils/testUserProvider";
import { loginAndGoToHomePage } from "../utils/shared.helpers";
import type { AccountDataApi } from "../../api/users/accounts.types";

test.describe('Update User Account Functionality', () => {

    let accountPage: AccountPage;
    let testUser: AccountDataApi;

    test.beforeEach(async ({ page }) => {

        const loginPage = new LoginPage(page);
        accountPage = new AccountPage(page);

        await test.step('Login as new test user', async () => {
            // Using specific user generator due to known issue with special characters and spaces in name field and phone number
            testUser = await createTestUserForAccountFormTest();
            await loginAndGoToHomePage(loginPage, testUser);
        });

        await test.step(`Navigate to account page and wait for account form display`, async () => {
            await accountPage.navigateToAccountPage();
            await accountPage.waitForUserInfoForm();
        });
    });

    test.afterEach(async () => {
        await test.step('Delete test user after test', async () => {
            await deleteTestUser(testUser.taiKhoan);
        });
    });

    test.describe('Valid Update', () => {

        test(`Successful update new valid Name, Email, Phone Number @regression`, async ({ page }) => {
            let newName: string, newEmail: string, newPhoneNr: string;

            await test.step('Generate new Full Name, Email, Phone number', async () => {
                newName = generateDifferentName(testUser.hoTen);
                newPhoneNr = generateDifferentPhoneNumber(testUser.soDt);
                newEmail = generateValidUiRegisterData().email;
            });

            await test.step('Updates new values and click Save', async () => {
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
                    `Full name not updated correctly for user: ${testUser.taiKhoan}`
                ).toBe(newName);

                expect.soft(updatedUserInfo.email,
                    `Email not updated correctly for user: ${testUser.taiKhoan}`
                ).toBe(newEmail);

                expect.soft(updatedUserInfo.soDt,
                    `Phone number not updated correctly for user: ${testUser.taiKhoan}`
                ).toBe(newPhoneNr);
            });
        })

        test(`Successful update new valid Password @regression`, async ({ loginPage }) => {

            const originalPassword = testUser.matKhau;
            const newPassword = generateDifferentPassword(originalPassword);

            await test.step('Change password and Save', async () => {
                await accountPage.changePassword(newPassword);
                await accountPage.clickSaveButton();
                await accountPage.verifyAndCloseSuccessAlert();
            });

            await test.step('Verify success alert', async () => {
                await accountPage.changePassword(newPassword);
                await accountPage.clickSaveButton();
                await accountPage.verifyAndCloseSuccessAlert();
            });

            await test.step('Verify user can log in with new password', async () => {
                await accountPage.topBarNavigation.clickLogoutLink();
                await accountPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();

                await loginPage.navigateToLoginPage();
                await loginPage.fillLoginFormAndSubmit(testUser.taiKhoan, newPassword);
                await loginPage.verifySuccessMsgAndLoggedInStatus
            });
        })
    });

    test.describe('Invalid Update', () => {
        test.describe('Due to Field validation error', () => {
            test('Blank name field blocks submsion', async ({ page }) => {

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
                    ).toBe(testUser.hoTen);
                });
            });

            test('Short password blocks submission', async ({ loginPage }) => {
                let invalidPassword: string;

                await test.step('Attempt update with short password and Save', async () => {
                    invalidPassword = generateTooShortPassword();
                    await accountPage.changePassword(invalidPassword);
                    await accountPage.clickSaveButton();
                });

                await test.step('Verify unsuccesful login with new password - password was not updated', async () => {
                    await accountPage.topBarNavigation.clickLogoutLink();
                    await accountPage.topBarNavigation.confirmLogoutAndVerifySuccessMsg();

                    await loginPage.navigateToLoginPage();
                    await loginPage.fillLoginFormAndSubmit(testUser.taiKhoan, invalidPassword);

                    await loginPage.verifyPasswordFieldErrorMsgVisible();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                });

                await test.step('Verify valid login with original password', async () => {
                    await loginPage.navigateToLoginPage();
                    await loginPage.fillLoginFormAndSubmit(testUser.taiKhoan, testUser.matKhau);
                    await loginPage.verifySuccessMsgAndLoggedInStatus();
                });
            });
        })

        test.describe('Due to Form validation error (Server-Side)', () => {
            test('Uniqueness Error: Existing email @regression', async ({ page }) => {
                await test.step('Attempt update with existing email and submit', async () => {
                    const existingEmail = testUser.email;
                    await accountPage.changeEmail(existingEmail);
                    await accountPage.clickSaveButton();
                });

                await test.step('Verify email remains unchanged after reload', async () => {
                    await page.reload();
                    await accountPage.waitForUserInfoForm();

                    const updatedUserInfo = await accountPage.extractUserDataFromForm();

                    expect(updatedUserInfo.email,
                        `Email should not be updated when existing email submitted.`
                    ).toBe(testUser.email);
                });
            });
        });
    })
})