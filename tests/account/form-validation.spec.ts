import { test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { accountFieldValidationRules } from "../test-data/FieldValidationRules";
import { editableAccountDataKeys } from "../types/form-ui.types";

// Importing test data from TypeScript file
const testData = accountFieldValidationRules;

test.describe('Account Form Field Validation Test', () => {

    let accountPage: AccountPage;

    test.beforeEach(async ({ loggedInHomepage }) => {
        accountPage = new AccountPage(loggedInHomepage.homePage.page);
        await accountPage.navigateToAccountPage();
        await accountPage.waitForUserInfoForm();
    });

    for (const field of editableAccountDataKeys) {

        // Iterating and retrieving test data for each field
        const fieldData = testData[field];
        test.describe(`${field} Validation`, () => {

            // Iterating over each test case for the current field
            for (const testCase of fieldData.tests) {

                test(`${field}: ${testCase.case}`, async () => {

                    await test.step(`Trigger ${field} validation with input: ${testCase.input}`, async () => {
                        await accountPage.triggerFieldValidation(field, testCase.input);
                    });

                    await test.step('Verify error message is displayed', async () => {
                        await accountPage.verifyFieldErrorMsg(field, testCase.expectedError);
                    });
                })
            }
        })
    }
})
