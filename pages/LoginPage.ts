import { expect, Locator, Page } from "@playwright/test";
import { BaseForm } from "./BaseForm";
import { pageURLs } from "../tests/utils/pageRoutes";
import { LoginField } from "../tests/types/form-ui.types";

export class LoginPage extends BaseForm<LoginField> {

    // ========== Static Configuration ==========
    static readonly ACCESSIBLE_NAMES = {
        btnLogin: 'Đăng nhập',
        alertLoginSuccess: 'Đăng nhập thành công',
    }

    static readonly ERROR_MESSAGES = {
        invalidCredentials: 'Tài khoản hoặc mật khẩu không đúng!',
        blankField: 'Đây là trường bắt buộc !',
    }

    constructor(page: Page) {
        super(page);
    }

    // ========== Abstract Implementation ==========
    getFieldSelector(fieldId: LoginField): string {
        return `#${fieldId}`;
    }

    // ========== Navigation ==========
    async navigateToLoginPage() {
        await this.navigateToPage(pageURLs.login);
    }

    // ========== Locators ==========
    get btnLogin() {
        return this.page.getByRole('button', { name: LoginPage.ACCESSIBLE_NAMES.btnLogin })
    }

    get alertSuccessMsg(): Locator {
        return this.page.getByRole('dialog', { name: LoginPage.ACCESSIBLE_NAMES.alertLoginSuccess });
    }

    get txtUsername() {
        return this.getLocatorForField('taiKhoan');
    }

    get txtPassword() {
        return this.getLocatorForField('matKhau');
    }

    get btnPasswordToggle() {
        return this.getFieldVisibilityToggleButton(this.txtPassword);
    }

    get alertInvalidCredentials() {
        return this.page.getByRole('alert');
    }

    get alertPasswordFieldError() {
        return this.getErrorMsgLocatorForField('matKhau');
    }

    // ========== Get Info ==========
    async getPasswordVisibilityState(): Promise<boolean> {
        return this.isFieldInputVisible(this.txtPassword);
    }

    // ========== Actions ==========
    async togglePasswordVisibility() {
        await this.clickElement(this.btnPasswordToggle);
    }

    async fillLoginFormAndSubmit(username: string, password: string) {
        await this.setValueAndBlur(this.txtUsername, username);
        await this.setValueAndBlur(this.txtPassword, password);

        await this.clickElement(this.btnLogin);
    }

    // ========== Verifications ==========
    async verifySuccessMsgAndLoggedInStatus() {
        expect.soft(this.alertSuccessMsg, 'Success message not visible.').toBeVisible();
        await this.topBarNavigation.verifyUserIsLoggedIn();
    }

    async verifyInvalidCredentialAlert() {

        await expect.soft(this.alertInvalidCredentials, 'Invalid credentials alert not visible.'
        ).toBeVisible();

        await expect.soft(this.alertInvalidCredentials, 'Invalid credentials alert text mismatch.'
        ).toHaveText(LoginPage.ERROR_MESSAGES.invalidCredentials);
    }

    async verifyPasswordFieldErrorMsgVisible() {
        await expect.soft(this.alertPasswordFieldError,
            'Password field error message not visible.'
        ).toBeVisible();
    }

    async verifyBlankPasswordErrorMsg() {

        await expect.soft(this.alertPasswordFieldError,
            'Blank password error message not visible.'
        ).toBeVisible();

        await expect.soft(this.alertPasswordFieldError,
            'Blank password error message text mismatch.'
        ).toHaveText(LoginPage.ERROR_MESSAGES.blankField);
    }

}

