import { expect, test } from "../../fixtures/custom-fixtures";

test.describe('Register UI Tests', () => {

    test.beforeEach(async ({ registerPage }) => {
        await registerPage.navigateToRegisterPage();
    });

    test.describe('Password visibility toggle', () => {

        test('Default state: hidden', async ({ registerPage }) => {

            await test.step('Verify password field is hidden by default', async () => {
                const isVisible = await registerPage.isPasswordVisible();

                expect(isVisible,
                    'Initial password visibility state incorrect. Expected hidden (false).'
                ).toBe(false);
            });
        });

        test('Click toggle icon to switch visibility state', async ({ registerPage }) => {

            let initialVisibility: boolean;

            await test.step('Click visibility toggle and verify state changes accordingly', async () => {
                initialVisibility = await registerPage.isPasswordVisible();
                await registerPage.togglePasswordVisibility();

                const switchedState = await registerPage.isPasswordVisible();

                expect(switchedState,
                    'Password visibility state did not change after toggle.'
                ).toBe(!initialVisibility);

            });

            await test.step('Toggle visibility again to revert to initial state', async () => {
                await registerPage.togglePasswordVisibility();

                const revertedState = await registerPage.isPasswordVisible();
                expect(revertedState,
                    'Password visibility state did not revert after second toggle.'
                ).toBe(initialVisibility);
            });
        });
    });

    test.describe('Confirm Password visibility toggle', () => {

        test('Default state: hidden', async ({ registerPage }) => {

            await test.step('Verify confirm password field is hidden by default', async () => {
                const isVisible = await registerPage.isConfirmPasswordVisible();

                expect(isVisible,
                    'Initial confirmPassWord visibility state incorrect. Expected hidden (false).'
                ).toBe(false);
            });
        });

        test('Click toggle icon to switch visibility state', async ({ registerPage }) => {
            let initialVisibility: boolean;

            await test.step('Click visibility toggle and verify state changes accordingly', async () => {
                initialVisibility = await registerPage.isConfirmPasswordVisible();

                await registerPage.toggleConfirmPasswordVisibility();
                const switchedState = await registerPage.isConfirmPasswordVisible();

                expect(switchedState,
                    'Password visibility state did not change after toggle.'
                ).toBe(!initialVisibility);

            });
            await test.step('Toggle visibility again to revert to initial state', async () => {
                await registerPage.toggleConfirmPasswordVisibility();

                const revertedState = await registerPage.isConfirmPasswordVisible();
                expect(revertedState,
                    'confirmPassWord visibility state did not revert after second toggle.'
                ).toBe(initialVisibility);
            });
        });
    });

    test.describe('Password and Confirm Password visibility toggled independently', () => {

        test('Toggling password does not affect confirmPassWord', async ({ registerPage }) => {

            let initialConfirmPasswordState: boolean;
            await test.step('Get initial confirmPassWord visibility and toggle password visibility', async () => {
                initialConfirmPasswordState = await registerPage.isConfirmPasswordVisible();

                await registerPage.togglePasswordVisibility();
            });

            await test.step('Verify confirmPassWord visibility state remains unchanged', async () => {
                const confirmPasswordStateAfterPasswordToggle = await registerPage.isConfirmPasswordVisible();

                expect(confirmPasswordStateAfterPasswordToggle,
                    `confirmPassWord visibility state changed unexpectedly when toggling password.
                Expected visibility: ${initialConfirmPasswordState}.`
                ).toBe(initialConfirmPasswordState);
            });

        })

        test('Toggling confirmPassWord does not affect password', async ({ registerPage }) => {
            let initialPasswordState: boolean;

            await test.step('Get initial password visibility and toggle confirmPassWord visibility', async () => {
                initialPasswordState = await registerPage.isPasswordVisible();
                await registerPage.toggleConfirmPasswordVisibility();
            });

            await test.step('Verify password visibility state remains unchanged', async () => {
                const passwordStateAfterConfirmPasswordToggle = await registerPage.isPasswordVisible();

                expect(passwordStateAfterConfirmPasswordToggle,
                    `Password visibility state changed unexpectedly when toggling confirmPassWord.
                Expected visibility: ${initialPasswordState}.`
                ).toBe(initialPasswordState);
            });
        })
    })
});