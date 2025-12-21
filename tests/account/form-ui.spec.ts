import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";

test.describe('Account Form UI Tests', () => {

    let accountPage: AccountPage;

    test.beforeEach(async ({ loggedInHomepage }) => {

        // Make sure user is logged in and on account page before each test
        accountPage = new AccountPage(loggedInHomepage.homePage.page);

        await accountPage.navigateToAccountPage();
        await accountPage.waitForUserInfoForm();

    });

    test.describe('Password visibility toggle ', () => {

        test('Default state: hidden', async () => {

            // Initial state: password should be hidden
            const isVisible = await accountPage.isPasswordVisible();

            expect(isVisible,
                'Initial password visibility state incorrect. Expected hidden (false).'
            ).toBe(false);

        });

        test('Click toggle icon to switch visibility state', async () => {

            // Toggle visibility: password should change state

            const initialState = await accountPage.isPasswordVisible();
            await accountPage.togglePasswordVisibility();

            const switchedState = await accountPage.isPasswordVisible();

            expect(switchedState,
                'Password visibility state did not change after toggle.'
            ).toBe(!initialState);

            // Toggle visibility again: password should revert to initial state
            await accountPage.togglePasswordVisibility();

            const revertedState = await accountPage.isPasswordVisible();
            expect(revertedState,
                'Password visibility state did not revert after second toggle.'
            ).toBe(initialState);

        });
    });

});




