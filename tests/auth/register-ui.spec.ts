import { expect, test } from "../../fixtures/custom-fixtures";

test.describe('Register UI Tests', () => {

    test.beforeEach(async ({ registerPage }) => {
        await registerPage.navigateToRegisterPage();
    });

    test.describe('Password visibility toggle', () => {

        test('Default state: hidden', async ({ registerPage }) => {

            // Initial state: password should be hidden
            const isVisible = await registerPage.isPasswordVisible();

            expect(isVisible,
                'Initial password visibility state incorrect. Expected hidden (false).'
            ).toBe(false);

        });

        test('Click toggle icon to switch visibility state', async ({ registerPage }) => {

            // Toggle visibility: password should change state

            const initialState = await registerPage.isPasswordVisible();
            await registerPage.togglePasswordVisibility();

            const switchedState = await registerPage.isPasswordVisible();

            expect(switchedState,
                'Password visibility state did not change after toggle.'
            ).toBe(!initialState);

            // Toggle visibility again: password should revert to initial state
            await registerPage.togglePasswordVisibility();

            const revertedState = await registerPage.isPasswordVisible();
            expect(revertedState,
                'Password visibility state did not revert after second toggle.'
            ).toBe(initialState);

        });
    });

    test.describe('Confirm Password visibility toggle', () => {

        test('Default state: hidden', async ({ registerPage }) => {

            // Initial state: password should be hidden
            const isVisible = await registerPage.isConfirmPasswordVisible();

            expect(isVisible,
                'Initial confirmPassWord visibility state incorrect. Expected hidden (false).'
            ).toBe(false);

        });

        test('Click toggle icon to switch visibility state', async ({ registerPage }) => {

            // Toggle visibility: password should change state
            const initialState = await registerPage.isConfirmPasswordVisible();

            await registerPage.toggleConfirmPasswordVisibility();
            const switchedState = await registerPage.isConfirmPasswordVisible();

            expect(switchedState,
                'Password visibility state did not change after toggle.'
            ).toBe(!initialState);

            // Toggle visibility again: password should revert to initial state
            await registerPage.toggleConfirmPasswordVisibility();

            const revertedState = await registerPage.isConfirmPasswordVisible();
            expect(revertedState,
                'confirmPassWord visibility state did not revert after second toggle.'
            ).toBe(initialState);

        });
    });

    test.describe('Password and Confirm Password visibility toggled independently', () => {

        test('Toggling password does not affect confirmPassWord', async ({ registerPage }) => {

            // Get initial confirmPassWord state
            const initialConfirmPasswordState = await registerPage.isConfirmPasswordVisible();

            // Toggle password visibility and verify confirmPassWord state unchanged
            await registerPage.togglePasswordVisibility();

            const confirmPasswordStateAfterPasswordToggle = await registerPage.isConfirmPasswordVisible();

            expect(confirmPasswordStateAfterPasswordToggle,
                `confirmPassWord visibility state changed unexpectedly when toggling password.
                Expected visibility: ${initialConfirmPasswordState}.`
            ).toBe(initialConfirmPasswordState);

        })

        test('Toggling confirmPassWord does not affect password', async ({ registerPage }) => {

            // Get initial password state
            const initialPasswordState = await registerPage.isPasswordVisible();

            // Toggle confirmPassWord visibility and verify password state unchanged
            await registerPage.toggleConfirmPasswordVisibility();

            const passwordStateAfterConfirmPasswordToggle = await registerPage.isPasswordVisible();

            expect(passwordStateAfterConfirmPasswordToggle,
                `Password visibility state changed unexpectedly when toggling confirmPassWord.
                Expected visibility: ${initialPasswordState}.`
            ).toBe(initialPasswordState);
        })

    })

});




