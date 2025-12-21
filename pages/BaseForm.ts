import { expect, Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";

export abstract class BaseForm<TFieldId extends string> extends CommonPage {

    constructor(page: Page) {
        super(page);
    }

    // ========== Abstract methods to be implemented by child classes ==========
    abstract getFieldSelector(fieldId: TFieldId): string;


    // =========== Locators ==========
    getLocatorForField(fieldId: TFieldId): Locator {
        const selector = this.getFieldSelector(fieldId);
        return this.page.locator(selector);
    }

    getErrorMsgLocatorForField(fieldId: TFieldId): Locator {
        const fieldSelector = this.getFieldSelector(fieldId);
        return this.page.locator(`${fieldSelector}-helper-text`);
    }

    getFieldVisibilityToggleButton(field: Locator): Locator {
        return field.locator('..').getByRole('button');
    }

    // ========== Methods ==========

    async isFieldInputVisible(field: Locator): Promise<boolean> {
        const typeAttr = await this.getElementAttribute(field, 'type');
        return typeAttr === 'text';
    }

    async triggerFieldValidation(fieldId: TFieldId, input: string): Promise<void> {
        const fieldLocator = this.getLocatorForField(fieldId);
        await this.waitForElementVisible(fieldLocator);
        await this.setValueAndBlur(fieldLocator, input);
    }

    async verifyFieldErrorMsg(fieldId: TFieldId, expectedText: string): Promise<void> {
        const errorLocator = this.getErrorMsgLocatorForField(fieldId);

        // Implicit check for visibility by verifying text
        await expect.soft(errorLocator,
            `Error message for ${fieldId} field not found or text does not match. Expected: ${expectedText}`
        ).toHaveText(expectedText);
    }
}
