import { getSingleAccountByUsername } from "../../api/users/accounts.helpers";
import { expect, test } from "../../fixtures/custom-fixtures";
import { registerFormValidationRules } from "../utils/FormValidationRules";
import { generateTooShortPassword, generateValidRegisterData } from "../utils/auth.testDataGenerator";


test.beforeEach(async ({ registerPage }) => {
    await registerPage.navigateToRegisterPage();
});


test.describe('Register Functional Test', () => {

    test.describe('Valid Registration', () => {

        test('Successful registration with valid inputs @smoke @regression', async ({ registerPage, loginPage }) => {

            // Generate random valid inputs and submmit register form
            const { taiKhoan, matKhau, confirmPassWord, hoTen, email } = generateValidRegisterData();

            await registerPage.fillFormAndSubmit(
                taiKhoan,
                matKhau,
                confirmPassWord,
                hoTen,
                email
            );

            // Assertion 1: success message
            await registerPage.verifyRegisterSuccessMsg();

            // Assertion 2: User can login with registered credentials
            await loginPage.navigateToLoginPage();
            await loginPage.fillLoginFormAndSubmit(taiKhoan, matKhau);
            await loginPage.verifySuccessMsgAndLoggedInStatus();

            // Assertion 3: Registered user data is correct in backend
            const apiAccount = await getSingleAccountByUsername(taiKhoan);

            expect.soft(apiAccount.taiKhoan, 'Incorrect username').toBe(taiKhoan);
            expect.soft(apiAccount.hoTen, 'Incorrect fullName').toBe(hoTen);
            expect.soft(apiAccount.email, 'Incorrect email.').toBe(email);

        });

    });

    test.describe('Invalid Registration', () => {

        test.describe('Due to Field validation error', () => {

            test('Blank name field blocks submission', async ({ registerPage, loginPage }) => {

                // Generate and submit input with blank name field
                const { taiKhoan, matKhau, confirmPassWord, email } = generateValidRegisterData();
                await registerPage.fillFormAndSubmit(taiKhoan, matKhau, confirmPassWord, '', email);

                // Attempt to login with the registered credentials 
                await loginPage.navigateToLoginPage();
                await loginPage.fillLoginFormAndSubmit(taiKhoan, matKhau);

                // Assertion: Invalid credential alert visible and user remains in guest mode
                await loginPage.verifyInvalidCredentialAlert();
                await loginPage.topBarNavigation.verifyNonLoggedInStatus();

            });

            test('Short password blocks submisson', async ({ registerPage, loginPage }) => {

                // Test case: short password
                // Generate and submit input with invalid short password
                const { taiKhoan, hoTen, email } = generateValidRegisterData();
                const shortPassword = generateTooShortPassword();

                await registerPage.fillFormAndSubmit(
                    taiKhoan,
                    shortPassword,
                    shortPassword,
                    hoTen,
                    email
                );

                // Attempt to login with the registered credentials and verify failed login
                await loginPage.navigateToLoginPage();
                await loginPage.fillLoginFormAndSubmit(taiKhoan, shortPassword);

                await loginPage.verifyInvalidCredentialAlert();
                await loginPage.topBarNavigation.verifyNonLoggedInStatus();

            });

        });

        test.describe('Due to Form validation error (Server-Side)', () => {

            const testData = registerFormValidationRules;

            // Test password mismatch cases
            for (const testCase of testData.confirmPassWord.tests) {

                test(`Password Mismatch: ${testCase.case}`, async ({ registerPage, loginPage }) => {

                    const { taiKhoan, matKhau, confirmPassWord, hoTen, email } = testCase.input;
                    await registerPage.fillFormAndSubmit(taiKhoan, matKhau, confirmPassWord, hoTen, email);

                    // Verify submission blocked
                    await registerPage.verifyMismatchedPasswordErrorMsg(testCase.expectedError);

                    // Cannot login with the registered credentials
                    await loginPage.navigateToLoginPage();
                    await loginPage.fillLoginFormAndSubmit(taiKhoan, matKhau);

                    await loginPage.verifyInvalidCredentialAlert();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
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

                        const { taiKhoan, matKhau, confirmPassWord, hoTen, email } = testCase.input;
                        await registerPage.fillFormAndSubmit(taiKhoan, matKhau, confirmPassWord, hoTen, email);

                        // Verify submission blocked
                        await registerPage.verifyUniquenessErrorMsg(testCase.expectedError);

                        // Cannot login with the registered credentials
                        await loginPage.navigateToLoginPage();
                        await loginPage.fillLoginFormAndSubmit(taiKhoan, matKhau);

                        await loginPage.verifyInvalidCredentialAlert();
                        await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                    });
                }
            }
        });
    });

});