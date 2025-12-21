import { test } from "../../fixtures/custom-fixtures";
import { generateIncorrectCasingPasswordLoginData, generateInvalidPasswordLoginData, generateInvalidUsernameLoginData } from "../utils/auth.testDataGenerator";
import { pickRandomItem } from "../utils/shared.helpers";
import { AccountData } from "../../api/users/accounts.types";
import { userAccountDisplay } from "../test-data/testUsers";


test.describe('Login Functional Tests', async () => {

    let userData: AccountData;
    let taiKhoan: string;
    let matKhau: string;
    let hoTen: string;

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigateToLoginPage();

        // Pick a random valid user for each test
        userData = pickRandomItem(userAccountDisplay);
        taiKhoan = userData.taiKhoan;
        matKhau = userData.matKhau;
        hoTen = userData.hoTen;

    })

    test.describe('Valid Login', () => {

        test('Successful login with correct credentials @smoke @regression', async ({ loginPage }) => {

            // Login with stored credentials
            await loginPage.fillLoginFormAndSubmit(taiKhoan, matKhau);

            // Assertion: success message, logged-in status, correct profile name
            await loginPage.verifySuccessMsgAndLoggedInStatus();
            await loginPage.topBarNavigation.verifyUserDisplayedName(hoTen);
        })

        test('Successful login with username in different casing', async ({ loginPage }) => {

            // Test users have username in lowercase or mixed case
            // Login with username in uppercase and verify success message
            const usernameUppercase = taiKhoan.toUpperCase();
            await loginPage.fillLoginFormAndSubmit(usernameUppercase, matKhau);

            // Assertion: success message, logged-in status, correct profile name
            await loginPage.verifySuccessMsgAndLoggedInStatus();
            await loginPage.topBarNavigation.verifyUserDisplayedName(hoTen);
        })

    })

    test.describe('Invalid Login', () => {

        test.describe('Failed due to blank Password', () => {

            test('Blank Password Field', async ({ loginPage }) => {

                await loginPage.fillLoginFormAndSubmit(taiKhoan, '');

                await loginPage.verifyBlankPasswordErrorMsg();
            })
        })

        test.describe('Failed due to Invalid Credentials (Server-Side)', () => {

            test('Incorrect Username', async ({ loginPage }) => {

                const invalidData = generateInvalidUsernameLoginData(userData);

                await loginPage.fillLoginFormAndSubmit(invalidData.taiKhoan, invalidData.matKhau);

                await loginPage.verifyInvalidCredentialAlert();
                await loginPage.topBarNavigation.verifyNonLoggedInStatus();
            })

            test('Incorrect Password', async ({ loginPage }) => {

                const invalidData = generateInvalidPasswordLoginData(userData);
                await loginPage.fillLoginFormAndSubmit(invalidData.taiKhoan, invalidData.matKhau);

                await loginPage.verifyInvalidCredentialAlert();
                await loginPage.topBarNavigation.verifyNonLoggedInStatus();
            })

            test('Incorrect password casing @regression', async ({ loginPage }) => {

                const invalidData = generateIncorrectCasingPasswordLoginData(userData);
                await loginPage.fillLoginFormAndSubmit(invalidData.taiKhoan, invalidData.matKhau);

                await loginPage.verifyInvalidCredentialAlert();
                await loginPage.topBarNavigation.verifyNonLoggedInStatus();
            })

        })

    })

})