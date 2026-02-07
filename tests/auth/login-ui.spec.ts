import { expect, test } from "../../fixtures/custom-fixtures";

test.describe('Login UI Tests', () => {

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigateToLoginPage();
    });

    test.describe('Password visibility toggle', () => {

        test('Password visibility default state: hidden', async ({ loginPage }) => {

            await test.step('Verify password is hidden by default', async () => {
                const isVisible = await loginPage.getPasswordVisibilityState();

                expect(isVisible,
                    'Initial password visibility state incorrect. Expected hidden (false).'
                ).toBe(false);
            });

        });

        test('Click toggle icon to switch visibility state', async ({ loginPage }) => {

            let initialVisibility: boolean;

            await test.step('Click visibility toggle and verify state changes accordingly', async () => {
                initialVisibility = await loginPage.getPasswordVisibilityState();
                await loginPage.togglePasswordVisibility();

                const switchedState = await loginPage.getPasswordVisibilityState();

                expect(switchedState,
                    'Password visibility state did not change after toggle.'
                ).toBe(!initialVisibility);
            });

            await test.step('Toggle visibility again to revert to initial state', async () => {
                await loginPage.togglePasswordVisibility();

                const revertedState = await loginPage.getPasswordVisibilityState();
                expect(revertedState,
                    'Password visibility state did not revert after second toggle.'
                ).toBe(initialVisibility);
            });
        });
    });
});