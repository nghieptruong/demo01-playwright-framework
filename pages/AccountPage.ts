import { expect, Locator, Page } from "@playwright/test";
import { BaseForm } from "./BaseForm";
import { pageURLs } from "../tests/utils/pageRoutes";
import { AccountDataApi, AccountDataFields } from "../api/users/accounts.types";
import { EditableAccountFields } from "../tests/types/form-ui.types";
import { OrderHistory } from "./components/OrderHistory";

export class AccountPage extends BaseForm<AccountDataFields> {

    // ========== Components ==========
    readonly orderHistory: OrderHistory;

    // ========== Static Configuration ==========
    static readonly CUSTOM_SELECTORS: Partial<Record<AccountDataFields, string>> = {
        maLoaiNguoiDung: 'select[name="maLoaiNguoiDung"]',
    }

    static readonly ACCESSIBLE_NAMES = {
        btnSave: 'Cập Nhật',
        btnCloseAlert: 'Đóng',
        alertUpdateSuccess: 'Cập nhật thành công',
    }

    static readonly USER_TYPE_VALUES = {
        Customer: 'KhachHang',
        Admin: 'QuanTri',
    }

    constructor(page: Page) {
        super(page);
        this.orderHistory = new OrderHistory(page);
    }

    // ========== Abstract Implementation ==========
    getFieldSelector(fieldId: AccountDataFields): string {
        return AccountPage.CUSTOM_SELECTORS[fieldId] ?? `#${fieldId}`;
    }

    // ========== Override: Scope to Form ==========
    getLocatorForField(fieldId: AccountDataFields): Locator {
        const selector = this.getFieldSelector(fieldId);
        return this.formUserInfo.locator(selector);
    }

    // ========== Navigation ==========
    async navigateToAccountPage(): Promise<void> {
        await this.navigateToPage(pageURLs.account);
    }

    // ========== Waits ========== 

    async waitForUserInfoForm() {
        try {
            // wait for form animation to complete, unable to find a dynamic wait that works
            await this.page.waitForTimeout(500);
            await this.waitForElementVisible(this.formUserInfo, 5000);
        } catch {
            throw new Error("Account form is not visible");
        }
    }

    async waitForOrderHistoryPanel() {
        await this.orderHistory.waitForElementVisible(this.orderHistory.pnlOrderHistory);
    }

    // ========== Locators: User Profile Form ==========
    get formUserInfo(): Locator {
        return this.page.locator('form');
    }

    get txtUsername(): Locator {
        return this.getLocatorForField('taiKhoan');
    }

    get txtPassword(): Locator {
        return this.getLocatorForField('matKhau');
    }

    get btnPasswordToggle(): Locator {
        return this.getFieldVisibilityToggleButton(this.txtPassword);
    }

    get txtFullName(): Locator {
        return this.getLocatorForField('hoTen');
    }

    get txtEmail(): Locator {
        return this.getLocatorForField('email');
    }

    get txtPhone(): Locator {
        return this.getLocatorForField('soDt');
    }

    get selUserType(): Locator {
        return this.getLocatorForField('maLoaiNguoiDung');
    }

    get optionUserType(): Locator {
        return this.selUserType.locator('option');
    }

    get optionNonSelectedUserType(): Locator {
        return this.selUserType.filter({ hasNot: this.page.locator('option:checked') });
    }

    get btnSave(): Locator {
        return this.formUserInfo.getByRole('button', { name: AccountPage.ACCESSIBLE_NAMES.btnSave });
    }

    get alertUpdateSuccess(): Locator {
        return this.page.getByRole('dialog', { name: AccountPage.ACCESSIBLE_NAMES.alertUpdateSuccess });
    }

    get btnCloseAlert(): Locator {
        return this.alertUpdateSuccess.getByRole('button', { name: AccountPage.ACCESSIBLE_NAMES.btnCloseAlert });
    }

    // ========== Get Info: User Profile ========== 
    async isUserInfoFormVisible(timeoutMs: number = 5000): Promise<boolean> {
        let isVisible = true;
        try {
            await this.waitForElementVisible(this.formUserInfo, timeoutMs);
        } catch {
            isVisible = false;
            console.warn(`User info form not visible after ${timeoutMs} ms`);
        }
        return isVisible;
    }

    async extractUserDataFromForm(): Promise<AccountDataApi> {
        const isVisible = await this.isUserInfoFormVisible();
        if (!isVisible) {
            throw new Error('User info form is not visible, cannot get profile data');
        }

        const username = await this.getFieldValue(this.txtUsername);
        const password = await this.getFieldValue(this.txtPassword);
        const fullName = await this.getFieldValue(this.txtFullName);
        const email = await this.getFieldValue(this.txtEmail);
        const phone = await this.getFieldValue(this.txtPhone) || null;
        const userType = await this.getFieldValue(this.selUserType);

        return {
            taiKhoan: username,
            matKhau: password,
            hoTen: fullName,
            email: email,
            soDt: phone,
            maLoaiNguoiDung: userType,
        };
    }

    async isPasswordVisible(): Promise<boolean> {
        return this.isFieldInputVisible(this.txtPassword);
    }

    // ========== Actions: Form Interactions ==========
    async togglePasswordVisibility() {
        await this.clickElement(this.btnPasswordToggle);
    }

    async triggerEditableFieldValidation(field: EditableAccountFields, input: string): Promise<void> {
        await super.triggerFieldValidation(field, input);
    }

    async changeFullName(newFullName: string): Promise<void> {
        await this.setValueAndBlur(this.txtFullName, newFullName);
    }

    async changeEmail(newEmail: string): Promise<void> {
        await this.setValueAndBlur(this.txtEmail, newEmail);
    }

    async changePhoneNumber(newPhone: string): Promise<void> {
        await this.setValueAndBlur(this.txtPhone, newPhone);
    }

    async changePassword(newPassword: string) {
        await this.setValueAndBlur(this.txtPassword, newPassword);
    }

    async attemptToChangeUsername(newUsername: string): Promise<void> {
        await this.setValueAndBlur(this.txtUsername, newUsername);
    }

    async attemptToChangeUserTypeToAdmin(): Promise<void> {
        await this.selectDropdownOption(this.selUserType, AccountPage.USER_TYPE_VALUES.Admin);
    }

    async clickSaveButton(): Promise<void> {
        await this.clickElement(this.btnSave);
    }

    // ========== Verifications ==========

    async verifyInvalidFieldErrorMsgVisible(field: EditableAccountFields): Promise<void> {
        const errorLocator = this.getErrorMsgLocatorForField(field);

        await expect(errorLocator,
            `Error message not visible for invalid ${field} field`
        ).toBeVisible();
    }

    async verifyAndCloseSuccessAlert() {
        await expect(this.alertUpdateSuccess).toBeVisible();

        await this.clickElement(this.btnCloseAlert);
        await expect(this.alertUpdateSuccess).not.toBeVisible();
    }

}


