import { test } from "../../fixtures/custom-fixtures";
import { loginFieldValidationRules } from "../test-data/FieldValidationRules";
import { loginFieldIds } from "../types/form-ui.types";

// Importing test data from FieldValidationRules.ts file
const testData = loginFieldValidationRules;

test.describe('Login Form: Field Validation', () => {

    for (const field of loginFieldIds) {

        // Retrieving test data for each field
        const fieldData = testData[field];

        test.describe(`${field} Validation`, () => {

            for (const testCase of fieldData.tests) {

                test(`${field}: ${testCase.case}`, async ({ loginPage }) => {

                    await test.step('Navigate to login page and trigger field validation', async () => {
                        await loginPage.navigateToLoginPage();
                        await loginPage.triggerFieldValidation(field, testCase.input);
                    });

                    await test.step('Verify error message and guest status', async () => {
                        await loginPage.verifyFieldErrorMsg(field, testCase.expectedError);
                        await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                    });
                })
            }
        })
    }
})