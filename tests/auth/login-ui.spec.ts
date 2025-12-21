import { expect, test } from "../../fixtures/custom-fixtures";

test.describe('Login UI Tests', () => {

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigateToLoginPage();
    });

    test.describe('Password visibility toggle', () => {

        test('Default state: hidden', async ({ loginPage }) => {

            // Initial state: password should be hidden
            const isVisible = await loginPage.getPasswordVisibilityState();

            expect(isVisible,
                'Initial password visibility state incorrect. Expected hidden (false).'
            ).toBe(false);

        });

        test('Click toggle icon to switch visibility state', async ({ loginPage }) => {

            // Toggle visibility: password should change state

            const initialState = await loginPage.getPasswordVisibilityState();
            await loginPage.togglePasswordVisibility();

            const switchedState = await loginPage.getPasswordVisibilityState();

            expect(switchedState,
                'Password visibility state did not change after toggle.'
            ).toBe(!initialState);

            // Toggle visibility again: password should revert to initial state
            await loginPage.togglePasswordVisibility();

            const revertedState = await loginPage.getPasswordVisibilityState();
            expect(revertedState,
                'Password visibility state did not revert after second toggle.'
            ).toBe(initialState);

        });
    });

});




