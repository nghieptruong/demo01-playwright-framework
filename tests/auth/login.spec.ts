import { test } from "../../fixtures/custom-fixtures";
import { changePasswordCasing, generateDifferentPassword, generateDifferentUsername } from "../utils/accountDataGenerator";
import { AccountDataApi } from "../../api/users/accounts.types"; 
import { createNewTestUser, deleteTestUser } from "../utils/testUserProvider";

test.describe('Login Functional Tests', async () => {

    let userData: AccountDataApi;
    let taiKhoan: string;
    let matKhau: string;
    let hoTen: string;

    test.beforeEach(async ({ loginPage }) => {
        await test.step('Create new test user before test', async () => {
            userData = await createNewTestUser();

            taiKhoan = userData.taiKhoan;
            matKhau = userData.matKhau;
            hoTen = userData.hoTen;
        });

        await test.step('Navigate to login page', async () => {
                await loginPage.navigateToLoginPage();
            });
    })

    test.afterEach(async () => {
        await test.step('Delete test user after test', async () => {
            await deleteTestUser(taiKhoan);
        });
    })

    test.describe('Valid Login', () => {

        test('Successful login with correct credentials @smoke @regression', async ({ loginPage }) => {

            await test.step('Submit login form with valid credentials', async () => {
                await loginPage.fillLoginFormAndSubmit(taiKhoan, matKhau);
            });

            await test.step('Verify success message and user profile link with correct name', async () => {
                await loginPage.verifySuccessMsgAndLoggedInStatus();
                await loginPage.topBarNavigation.verifyUserDisplayedName(hoTen);
            });

        })

        test('Successful login with username in different casing', async ({ loginPage }) => {

            await test.step('Submit login form with username in different casing and correct password', async () => {
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
                    const invalidUsername = generateDifferentUsername(userData.taiKhoan);
                    await loginPage.fillLoginFormAndSubmit(invalidUsername, userData.matKhau);
                });

                await test.step('Verify invalid credential alert is displayed and user remains in guest mode', async () => {
                    await loginPage.verifyInvalidCredentialAlert();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                });
            })

            test('Incorrect Password', async ({ loginPage }) => {

                await test.step('Submit login form with incorrect password', async () => {
                    const invalidPassword = generateDifferentPassword(userData.matKhau);
                    await loginPage.fillLoginFormAndSubmit(userData.taiKhoan, invalidPassword);
                });

                await test.step('Verify invalid credential alert is displayed and user remains in guest mode', async () => {
                    await loginPage.verifyInvalidCredentialAlert();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                });
            })

            test('Incorrect password casing @regression', async ({ loginPage }) => {

                await test.step('Submit login form with incorrect password casing', async () => {
                    const pwWrongCasing = changePasswordCasing(userData.matKhau);
                    await loginPage.fillLoginFormAndSubmit(userData.taiKhoan, pwWrongCasing);
                });

                await test.step('Verify invalid credential alert is displayed and user remains in guest mode', async () => {
                    await loginPage.verifyInvalidCredentialAlert();
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                });
            })
        })
    })
})