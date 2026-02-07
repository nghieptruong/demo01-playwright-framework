import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";

test.describe('Account Form UI Tests', () => {

    let accountPage: AccountPage;

    test.beforeEach(async ({ loggedInHomepage }) => {
        accountPage = new AccountPage(loggedInHomepage.homePage.page);
        await accountPage.navigateToAccountPage();
        await accountPage.waitForUserInfoForm();
    });

    test.describe('Password visibility toggle ', () => {

        test('Default state: hidden', async () => {
            await test.step('Verify password field is hidden by default', async () => {
                const isVisible = await accountPage.isPasswordVisible();
                expect(isVisible,
                    'Initial password visibility state incorrect. Expected hidden (false).'
                ).toBe(false);
            });

        });

        test('Click toggle icon to switch visibility state', async () => {

            let initialVisibility: boolean;

            await test.step('Click visibility toggle and verify state changes accordingly', async () => {
                initialVisibility = await accountPage.isPasswordVisible();

                await accountPage.togglePasswordVisibility();
                const switchedState = await accountPage.isPasswordVisible();

                expect(switchedState,
                    'Password visibility state did not change after toggle.'
                ).toBe(!initialVisibility);

            });

            await test.step('Toggle visibility again to revert to initial state', async () => {

                await accountPage.togglePasswordVisibility();
                const revertedState = await accountPage.isPasswordVisible();

                expect(revertedState,
                    'Password visibility state did not revert after second toggle.'
                ).toBe(initialVisibility);

            });
        });
    });
});
