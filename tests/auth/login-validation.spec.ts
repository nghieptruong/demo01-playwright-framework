import { test } from "../../fixtures/custom-fixtures";
import { loginFieldValidationRules } from "../test-data/FieldValidationRules";
import { loginFieldIds } from "../types/auth.types";


// Importing test data from TypeScript file
const testData = loginFieldValidationRules;

test.describe('Login Form: Field Validation', () => {

    for (const field of loginFieldIds) {

        // Retrieving test data for each field
        const fieldData = testData[field];

        test.describe(`${field} Validation`, () => {

            for (const testCase of fieldData.tests) {

                test(`${field}: ${testCase.case}`, async ({ loginPage }) => {

                    // Go to login page and trigger field validation with invalid username format
                    await loginPage.navigateToLoginPage();
                    await loginPage.triggerFieldValidation(field, testCase.input);

                    // Assertion: Error message and guest status
                    await loginPage.verifyFieldErrorMsg(field, testCase.expectedError);
                    await loginPage.topBarNavigation.verifyNonLoggedInStatus();
                })

            }
        })
    }
})

