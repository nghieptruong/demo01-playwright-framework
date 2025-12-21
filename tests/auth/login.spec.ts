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

        await test.step('Navigate to login page and pick random test user data before test', async () => {
            await loginPage.navigateToLoginPage();

            userData = pickRandomItem(userAccountDisplay);
            taiKhoan = userData.taiKhoan;
            matKhau = userData.matKhau;
            hoTen = userData.hoTen;
        });
    })

    test.describe('Valid Login', () => {

        test('Successful login with correct credentials @smoke @regression', async ({ loginPage }) => {
            await test.step('Fill login form and submit with valid credentials', async () => {
                await loginPage.fillLoginFormAndSubmit(taiKhoan, matKhau);
            });

            await test.step('Verify success message, loggedin status and correct profile name', async () => {
                await loginPage.verifySuccessMsgAndLoggedInStatus();
                await loginPage.topBarNavigation.verifyUserDisplayedName(hoTen);
            });
        })

        test('Successful login with username in different casing', async ({ loginPage }) => {

            await test.step('Fill login form and submit with username in different casing', async () => {
                const usernameUppercase = taiKhoan.toUpperCase();
                await loginPage.fillLoginFormAndSubmit(usernameUppercase, matKhau);
            });

            await test.step('Verify succesful login - username is case-insensitive', async () => {
                await loginPage.verifySuccessMsgAndLoggedInStatus();
                await loginPage.topBarNavigation.verifyUserDisplayedName(hoTen);
            });
        })
    })

    test.describe('Invalid Login', () => {

        test.describe('Failed due to blank Password', () => {

            test('Blank Password Field', async ({ loginPage }) => {

                await test.step('Submit login form with blank password', async () => {
                    await loginPage.fillLoginFormAndSubmit(taiKhoan, '');
                });

                await test.step('Verify blank password error message is displayed', async () => {
                    await loginPage.verifyBlankPasswordErrorMsg();
                });
            })
        })

        test.describe('Failed due to Invalid Credentials (Server-Side)', () => {

            test('Incorrect Username', async ({ loginPage }) => {

                await test.step('Submit login form with incorrect username', async () => {
                    const invalidData = generateInvalidUsernameLoginData(userData);
                    await loginPage.fillLoginFormAndSubmit(invalidData.taiKhoan, invalidData.matKhau);
                });

                await test.step('Verify invalid credential alert is displayed and user remains in guest mode', async () => {
                    await loginPage.verifyInvalidCredentialAlert();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                });
            })

            test('Incorrect Password', async ({ loginPage }) => {

                await test.step('Submit login form with incorrect password', async () => {
                    const invalidData = generateInvalidPasswordLoginData(userData);
                    await loginPage.fillLoginFormAndSubmit(invalidData.taiKhoan, invalidData.matKhau);
                });

                await test.step('Verify invalid credential alert is displayed and user remains in guest mode', async () => {
                    await loginPage.verifyInvalidCredentialAlert();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                });
            })

            test('Incorrect password casing @regression', async ({ loginPage }) => {

                await test.step('Submit login form with incorrect password casing', async () => {
                    const invalidData = generateIncorrectCasingPasswordLoginData(userData);
                    await loginPage.fillLoginFormAndSubmit(invalidData.taiKhoan, invalidData.matKhau);
                });

                await test.step('Verify invalid credential alert is displayed and user remains in guest mode', async () => {
                    await loginPage.verifyInvalidCredentialAlert();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                });
            })
        })
    })
})