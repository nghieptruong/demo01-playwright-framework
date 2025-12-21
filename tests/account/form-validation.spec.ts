import { test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { accountFieldValidationRules } from "../test-data/FieldValidationRules";
import { editableAccountDataKeys } from "../types/auth.types";

// Importing test data from TypeScript file
const testData = accountFieldValidationRules;

let accountPage: AccountPage;

test.beforeEach(async ({ loggedInHomepage }) => {
    accountPage = new AccountPage(loggedInHomepage.homePage.page);
    await accountPage.navigateToAccountPage();
    await accountPage.waitForUserInfoForm();
});

test.describe('Account Form Field Validation Test', () => {

    for (const field of editableAccountDataKeys) {

        // Iterating and retrieving test data for each field
        const fieldData = testData[field];

        test.describe(`${field} Validation`, () => {

            // Iterating over each test case for the current field
            for (const testCase of fieldData.tests) {

                test(`${field}: ${testCase.case}`, async () => {

                    await accountPage.triggerFieldValidation(field, testCase.input);

                    // Assertion: Error message matches expected error message
                    await accountPage.verifyFieldErrorMsg(field, testCase.expectedError);
                })
            }
        })
    }
})

