import { getSingleAccountByUsername } from "../../api/users/accounts.helpers";
import { expect, test } from "../../fixtures/custom-fixtures";
import { RegisterFormData } from "../types/form-ui.types";
import { registerFormValidationRules } from "../utils/FormValidationRules";
import { generateTooShortPassword, generateValidUiRegisterData } from "../utils/accountDataGenerator";

test.beforeEach(async ({ registerPage }) => {
    await registerPage.navigateToRegisterPage();
});

test.describe('Register Functional Test', () => {

    test.describe('Valid Registration', () => {

        test('Successful registration with valid inputs @smoke @regression', async ({ registerPage, loginPage }) => {
            let registerInputs: RegisterFormData;

            await test.step('Submit registration form with valid inputs', async () => {
                registerInputs = generateValidUiRegisterData();
                await registerPage.fillFormAndSubmit(registerInputs);
            });

            await test.step('Verify registration success message', async () => {
                await registerPage.verifyRegisterSuccessMsg();
            });

            await test.step('Verify user can login with registered credentials', async () => {
                await loginPage.navigateToLoginPage();
                await loginPage.fillLoginFormAndSubmit(registerInputs.taiKhoan, registerInputs.matKhau);
                await loginPage.verifySuccessMsgAndLoggedInStatus();
            });

            await test.step('Verify user account data in backend matches registration inputs', async () => {
                const apiAccount = await getSingleAccountByUsername(registerInputs.taiKhoan);

                expect.soft(apiAccount.taiKhoan, 'Incorrect username').toBe(registerInputs.taiKhoan);
                expect.soft(apiAccount.hoTen, 'Incorrect fullName').toBe(registerInputs.hoTen);
                expect.soft(apiAccount.email, 'Incorrect email.').toBe(registerInputs.email);
            });
        });
    });

    test.describe('Invalid Registration', () => {

        test.describe('Due to Field validation error', () => {
            let registerInputs: RegisterFormData;

            test('Blank name field blocks submission', async ({ registerPage, loginPage }) => {

                await test.step('Generate and submit register data with blank name field', async () => {
                    registerInputs = generateValidUiRegisterData();
                    registerInputs.hoTen = '';

                    await registerPage.fillFormAndSubmit(registerInputs);
                });

                await test.step('Attempt to login with the registered credentials', async () => {
                    await loginPage.navigateToLoginPage();
                    await loginPage.fillLoginFormAndSubmit(registerInputs.taiKhoan, registerInputs.matKhau);
                });

                await test.step('Verify submission is blocked due to blank name field', async () => {
                    await loginPage.verifyInvalidCredentialAlert();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                });

            });

            test('Short password blocks submisson', async ({ registerPage, loginPage }) => {

                let registerInputs: RegisterFormData;
                let shortPassword: string;

                await test.step('Generate and submit register data with short password', async () => {

                    registerInputs = generateValidUiRegisterData();
                    shortPassword = generateTooShortPassword();
                    registerInputs.matKhau = shortPassword;
                    registerInputs.confirmPassWord = shortPassword;

                    await registerPage.fillFormAndSubmit(registerInputs);
                });

                await test.step('Attempt to login with the registered credentials', async () => {
                    await loginPage.navigateToLoginPage();
                    await loginPage.fillLoginFormAndSubmit(registerInputs.taiKhoan, shortPassword);
                });

                await test.step('Verify submission is blocked due to short password', async () => {
                    await loginPage.verifyInvalidCredentialAlert();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                });
            });

        });

        test.describe('Due to Form validation error (Server-Side)', () => {

            const testData = registerFormValidationRules;

            // Test password mismatch cases
            for (const testCase of testData.confirmPassWord.tests) {

                test(`Password Mismatch: ${testCase.case} blocks submission`, async ({ registerPage, loginPage }) => {

                    let registerInputs: RegisterFormData;

                    await test.step('Fill registration form with mismatched passwords and submit', async () => {
                        registerInputs = testCase.input;
                        await registerPage.fillFormAndSubmit(registerInputs);
                    });

                    await test.step('Verify error message', async () => {
                        await registerPage.verifyMismatchedPasswordErrorMsg(testCase.expectedError);
                    });

                    await test.step('Verify failed registered credentials', async () => {
                        // Cannot login with the registered credentials
                        await loginPage.navigateToLoginPage();
                        await loginPage.fillLoginFormAndSubmit(registerInputs.taiKhoan, registerInputs.matKhau);

                        await loginPage.verifyInvalidCredentialAlert();
                        await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                    });
                });
            }

            // Test all uniqueness error cases (username, email, both)
            const uniquenessCategories = [
                testData.taiKhoan,
                testData.email,
                testData.taiKhoanAndEmail
            ];

            for (const category of uniquenessCategories) {

                for (const testCase of category.tests) {

                    test(`Uniqueness Error: ${testCase.case} blocks submission @regression`, async ({ registerPage, loginPage }) => {

                        let registerInputs: RegisterFormData;

                        await test.step('Fill registration form with mismatched passwords and submit', async () => {
                            registerInputs = testCase.input;

                            await registerPage.fillFormAndSubmit(registerInputs);
                        });

                        await test.step('Verify error message', async () => {
                            await registerPage.verifyUniquenessErrorMsg(testCase.expectedError);
                        });

                        await test.step('Verify failed registered credentials', async () => {
                            await loginPage.navigateToLoginPage();
                            await loginPage.fillLoginFormAndSubmit(registerInputs.taiKhoan, registerInputs.matKhau);

                            await loginPage.verifyInvalidCredentialAlert();
                            await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                        });
                    });
                }
            }
        });
    });

});