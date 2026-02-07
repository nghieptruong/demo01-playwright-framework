import { expect, Page } from "@playwright/test";
import { BaseForm } from "./BaseForm";
import { RegisterField, RegisterFormData } from "../tests/types/form-ui.types";
import { pageURLs } from "../tests/utils/pageRoutes";

export class RegisterPage extends BaseForm<RegisterField> {

    // ========== Static Configuration ==========
    static readonly successMsg = "Đăng ký thành công";

    constructor(page: Page) {
        super(page);
    }

    // ========== Abstract Implementation ==========
    getFieldSelector(fieldId: RegisterField): string {
        return `#${fieldId}`;
    }

    // ========== Navigation ==========
    async navigateToRegisterPage() {
        await this.navigateToPage(pageURLs.register);
    }

    // ========== Locators ==========
    get txtUsername() {
        return this.getLocatorForField('taiKhoan');
    }

    get txtPassword() {
        return this.getLocatorForField('matKhau');
    }

    get txtConfirmPassword() {
        return this.getLocatorForField('confirmPassWord');
    }

    get txtFullName() {
        return this.getLocatorForField('hoTen');
    }

    get txtEmail() {
        return this.getLocatorForField('email');
    }

    get btnPasswordToggle() {
        return this.getFieldVisibilityToggleButton(this.txtPassword);
    }

    get btnConfirmPasswordToggle() {
        return this.getFieldVisibilityToggleButton(this.txtConfirmPassword);
    }

    get btnRegister() {
        return this.page.getByRole('button', { name: 'Đăng ký' });
    }

    get alertFormErrorMsg() {
        return this.page.getByRole('alert');
    }

    get alertRegisterSuccessMsg() {
        return this.page.getByRole('heading', { name: RegisterPage.successMsg });
    }

    get alertMismatchedPasswords() {
        return this.getErrorMsgLocatorForField('confirmPassWord');
    }

    // ========== Get Info ==========
    async isPasswordVisible(): Promise<boolean> {
        return this.isFieldInputVisible(this.txtPassword);
    }

    async isConfirmPasswordVisible(): Promise<boolean> {
        return this.isFieldInputVisible(this.txtConfirmPassword);
    }

    // ========== Actions ==========
    async togglePasswordVisibility() {
        await this.clickElement(this.btnPasswordToggle);
    }

    async toggleConfirmPasswordVisibility() {
        await this.clickElement(this.btnConfirmPasswordToggle);
    }

    async clickRegister() {
        await this.clickElement(this.btnRegister);
    }

    async fillFormAndSubmit(inputs: RegisterFormData) {
        await this.setValueAndBlur(this.txtUsername, inputs.taiKhoan);
        await this.setValueAndBlur(this.txtPassword, inputs.matKhau);
        await this.setValueAndBlur(this.txtConfirmPassword, inputs.confirmPassWord);
        await this.setValueAndBlur(this.txtFullName, inputs.hoTen);
        await this.setValueAndBlur(this.txtEmail, inputs.email);

        await this.clickRegister();
    }

    // ========== Verifications ==========
    async verifyRegisterSuccessMsg() {
        await expect(this.alertRegisterSuccessMsg,
            'Success message not visiblefound after registration'
        ).toBeVisible();
    }

    async verifyMismatchedPasswordErrorMsg(expectedText: string) {

        await expect(this.alertMismatchedPasswords,
            `Error message for mismatched password not visible`
        ).toBeVisible();

        await expect(this.alertMismatchedPasswords,
            `Incorrect mismatched password error text`
        ).toHaveText(expectedText);
    }

    async verifyUniquenessErrorMsg(expectedText: string) {

        await expect(this.alertFormErrorMsg,
            `Error message for uniqueness error not found`
        ).toBeVisible();

        await expect(this.alertFormErrorMsg,
            `Incorrect uniqueness error text`
        ).toHaveText(expectedText);
    }
}