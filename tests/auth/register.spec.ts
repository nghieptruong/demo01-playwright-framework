import { getSingleAccountByUsername } from "../../api/users/accounts.helpers";
import { expect, test } from "../../fixtures/custom-fixtures";
import { RegisterFormData } from "../types/auth.types";
import { registerFormValidationRules } from "../utils/FormValidationRules";
import { generateTooShortPassword, generateValidRegisterData } from "../utils/auth.testDataGenerator";

test.beforeEach(async ({ registerPage }) => {
    await registerPage.navigateToRegisterPage();
});

test.describe('Register Functional Test', () => {

    test.describe('Valid Registration', () => {

        test('Successful registration with valid inputs @smoke @regression', async ({ registerPage, loginPage }) => {

            let data: RegisterFormData;

            await test.step('Generate and fill registration form with valid data and submit', async () => {
                data = generateValidRegisterData();

                await registerPage.fillFormAndSubmit(
                    data.taiKhoan,
                    data.matKhau,
                    data.confirmPassWord,
                    data.hoTen,
                    data.email
                );

            });

            await test.step('Verify registration success', async () => {
                await registerPage.verifyRegisterSuccessMsg();
            });

            await test.step('Verify user can login with registered credentials and backend data is correct', async () => {
                await loginPage.navigateToLoginPage();
                await loginPage.fillLoginFormAndSubmit(data.taiKhoan, data.matKhau);
                await loginPage.verifySuccessMsgAndLoggedInStatus();
            });

            await test.step('Verify backend account data matches registered data', async () => {
                const apiAccount = await getSingleAccountByUsername(data.taiKhoan);

                expect.soft(apiAccount.taiKhoan, 'Incorrect username').toBe(data.taiKhoan);
                expect.soft(apiAccount.hoTen, 'Incorrect fullName').toBe(data.hoTen);
                expect.soft(apiAccount.email, 'Incorrect email.').toBe(data.email);
            });
        });
    });

    test.describe('Invalid Registration', () => {

        test.describe('Due to Field validation error', () => {

            let data: RegisterFormData;
            test('Blank name field blocks submission', async ({ registerPage, loginPage }) => {

                await test.step('Generate and submit register data with blank name field', async () => {
                    data = generateValidRegisterData();

                    await registerPage.fillFormAndSubmit(
                        data.taiKhoan,
                        data.matKhau,
                        data.confirmPassWord,
                        '',
                        data.email
                    );
                });

                await test.step('Attempt to login with the registered credentials', async () => {
                    await loginPage.navigateToLoginPage();
                    await loginPage.fillLoginFormAndSubmit(data.taiKhoan, data.matKhau);
                });

                await test.step('Verify submission is blocked due to blank name field', async () => {
                    await loginPage.verifyInvalidCredentialAlert();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                });

            });

            test('Short password blocks submisson', async ({ registerPage, loginPage }) => {

                let data: RegisterFormData;
                let shortPassword: string;

                await test.step('Generate and submit register data with short password', async () => {

                    data = generateValidRegisterData();
                    shortPassword = generateTooShortPassword();

                    await registerPage.fillFormAndSubmit(
                        data.taiKhoan,
                        shortPassword,
                        shortPassword,
                        data.hoTen,
                        data.email
                    );
                });

                await test.step('Attempt to login with the registered credentials', async () => {
                    await loginPage.navigateToLoginPage();
                    await loginPage.fillLoginFormAndSubmit(data.taiKhoan, shortPassword);
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

                test(`Password Mismatch: ${testCase.case}`, async ({ registerPage, loginPage }) => {

                    let data: RegisterFormData;

                    await test.step('Fill registration form with mismatched passwords and submit', async () => {
                        data = testCase.input;

                        await registerPage.fillFormAndSubmit(
                            data.taiKhoan,
                            data.matKhau,
                            data.confirmPassWord,
                            data.hoTen,
                            data.email
                        );
                    });

                    await test.step('Verify error message', async () => {
                        await registerPage.verifyMismatchedPasswordErrorMsg(testCase.expectedError);

                    });

                    await test.step('Verify failed registered credentials', async () => {
                        // Cannot login with the registered credentials
                        await loginPage.navigateToLoginPage();
                        await loginPage.fillLoginFormAndSubmit(data.taiKhoan, data.matKhau);

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

                    test(`Uniqueness Error: ${testCase.case} @regression`, async ({ registerPage, loginPage }) => {

                        let data: RegisterFormData;

                        await test.step('Fill registration form with mismatched passwords and submit', async () => {
                            data = testCase.input;

                            await registerPage.fillFormAndSubmit(
                                data.taiKhoan,
                                data.matKhau,
                                data.confirmPassWord,
                                data.hoTen,
                                data.email
                            );
                        });

                        await test.step('Verify error message', async () => {
                            await registerPage.verifyUniquenessErrorMsg(testCase.expectedError);
                        });

                        await test.step('Verify failed registered credentials', async () => {
                            await loginPage.navigateToLoginPage();
                            await loginPage.fillLoginFormAndSubmit(data.taiKhoan, data.matKhau);

                            await loginPage.verifyInvalidCredentialAlert();
                            await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                        });
                    });
                }
            }
        });
    });

});