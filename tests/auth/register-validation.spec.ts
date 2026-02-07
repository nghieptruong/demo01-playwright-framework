import { test } from "../../fixtures/custom-fixtures";
import { registerFieldValidationRules } from "../test-data/FieldValidationRules";
import { registerFieldIds } from "../types/form-ui.types";

// Importing test data from FieldValidationRules.ts
const testData = registerFieldValidationRules;

test.describe('Register Form: Field Validation', () => {

    for (const field of registerFieldIds) {

        // Retrieving test data for each field
        const fieldData = testData[field];

        test.describe(`${field} Validation`, () => {

            // Iterating over each test case for the current field
            for (const testCase of fieldData.tests) {

                test(`${field}: ${testCase.case}`, async ({ registerPage }, testInfo) => {

                    if (field === 'email') {
                        testInfo.annotations.push({ type: 'regression', description: '@regression' });
                    }

                    await test.step('Navigate to register page, trigger field validation and get error message', async () => {

                        await registerPage.navigateToRegisterPage();
                        await registerPage.triggerFieldValidation(field, testCase.input);
                    });

                    await test.step('Verify error message matches expected error message', async () => {
                        await registerPage.verifyFieldErrorMsg(field, testCase.expectedError);
                    });

                })
            }
        })
    }
})

