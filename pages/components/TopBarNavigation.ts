import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "../BasePage";

export class TopBarNavigation extends BasePage {

    // ========== Static Configuration ==========
    static readonly ACCESSIBLE_NAMES = {
        // Links
        register: 'Đăng Ký',
        login: 'Đăng Nhập',
        logout: 'Đăng xuất',
        userProfile: 'Avatar',

        // alert content
        logoutRequestConfirm: 'Bạn có muốn đăng xuất ?',
        logoutSuccessAlert: 'Đã đăng xuất',

        // alert buttons
        acceptLogout: 'Đồng ý',
        cancelLogout: 'Hủy',
    }

    static readonly MOBILE_SELECTORS = {
        btnMobileMenu: 'xpath=.//*[local-name()="path"]',
        pnlNavBarBackdrop: 'div.MuiBackdrop-root'
    }

    // ========== Constructor ==========
    readonly root: Locator;

    constructor(page: Page) {
        super(page);
        this.root = page.getByRole('banner');
    }

    // ========== Locators ==========
    get lnkRegister() {
        return this.root.getByRole('link', { name: TopBarNavigation.ACCESSIBLE_NAMES.register });
    }

    get lnkLogin() {
        return this.root.getByRole('link', { name: TopBarNavigation.ACCESSIBLE_NAMES.login });
    }

    get lnkLogout() {
        return this.root.getByRole('link', { name: TopBarNavigation.ACCESSIBLE_NAMES.logout });
    }

    get confirmLogoutDialog() {
        return this.page.getByRole('dialog', { name: TopBarNavigation.ACCESSIBLE_NAMES.logoutRequestConfirm });
    }

    get btnAcceptLogout() {
        return this.page.getByRole('button', { name: TopBarNavigation.ACCESSIBLE_NAMES.acceptLogout });
    }

    get btnCancelLogout() {
        return this.page.getByRole('button', { name: TopBarNavigation.ACCESSIBLE_NAMES.cancelLogout });
    }

    get logoutSuccessAlert() {
        return this.page.getByRole('dialog', { name: TopBarNavigation.ACCESSIBLE_NAMES.logoutSuccessAlert });
    }

    get lnkUserProfile() {
        return this.root.getByRole('link', { name: TopBarNavigation.ACCESSIBLE_NAMES.userProfile })
    }

    // ========== Mobile Locators ==========
    get btnMobileMenu() {
        return this.root.locator(TopBarNavigation.MOBILE_SELECTORS.btnMobileMenu);
    }

    get pnlMobileNavBar() {
        return this.page.getByRole('presentation').last();
    }

    get pnlNavBarBackdrop() {
        return this.page.locator(TopBarNavigation.MOBILE_SELECTORS.pnlNavBarBackdrop);
    }

    get lnkMobileRegister() {
        return this.pnlMobileNavBar.getByRole('link', { name: TopBarNavigation.ACCESSIBLE_NAMES.register });
    }

    get lnkMobileLogin() {
        return this.pnlMobileNavBar.getByRole('link', { name: TopBarNavigation.ACCESSIBLE_NAMES.login });
    }

    get lnkMobileLogout() {
        return this.pnlMobileNavBar.getByRole('link', { name: TopBarNavigation.ACCESSIBLE_NAMES.logout });
    }

    get lnkMobileUserProfile() {
        return this.pnlMobileNavBar.getByRole('link', { name: TopBarNavigation.ACCESSIBLE_NAMES.userProfile })
    }

    // ========== Get Info ==========
    async getUserDisplayedName(): Promise<string> {
        return await this.getElementText(this.lnkUserProfile);
    }

    // ========== Actions ==========
    async clickRegisterLink() {
        await this.clickElement(this.lnkRegister);
    }

    async clickLoginLink() {
        await this.clickElement(this.lnkLogin);
    }

    async clickUserProfileLink() {
        await this.clickElement(this.lnkUserProfile);
    }

    async clickLogoutLink() {
        await this.clickElement(this.lnkLogout);
    }

    async cancelLogout() {
        await this.waitForElementVisible(this.confirmLogoutDialog);
        await this.clickElement(this.btnCancelLogout);
    }

    async confirmLogoutAndVerifySuccessMsg() {
        await this.waitForElementVisible(this.confirmLogoutDialog);
        await this.clickElement(this.btnAcceptLogout);
        await this.verifyLogoutSuccessAlert();
    }

    // ========== Mobile Actions ==========
    async openMobileNavigationBar() {
        await this.clickElement(this.btnMobileMenu);
        await this.waitForElementVisible(this.pnlMobileNavBar);
    }

    async closeMobileNavigationBar() {
        const navbarBox = await this.pnlMobileNavBar.boundingBox();

        if (navbarBox) {
            // Use navbarBox.x, navbarBox.y, etc.
            const x = navbarBox.x + navbarBox.width + 10;
            const y = navbarBox.y + 10;
            await this.pnlNavBarBackdrop.click({ position: { x, y } });
            await expect(this.pnlMobileNavBar).toBeHidden();
        } else {
            throw new Error('Navbar bounding box not found. Is the element visible?');
        }
    }

    async clickLogoutLinkOnMobile() {
        await this.clickElement(this.lnkMobileLogout);
    }

    async clickLoginLinkOnMobile() {
        await this.clickElement(this.lnkMobileLogin);
    }

    async clickRegisterLinkOnMobile() {
        await this.clickElement(this.lnkMobileRegister);
    }

    async clickUserProfileLinkOnMobile() {
        await this.clickElement(this.lnkMobileUserProfile);
    }

    // ========== Verifications ==========
    async verifyLogoutSuccessAlert() {
        await expect(this.logoutSuccessAlert).toBeVisible();
    }

    async verifyNonLoggedInStatus() {
        // VP: User profile is not visible
        await expect(this.lnkUserProfile,
            'User profile button found. User is incorrectly logged in'
        ).not.toBeVisible();

        // VP: Login button is still visible
        await expect(this.lnkLogin).toBeVisible();
    }

    async verifyUserIsLoggedIn() {
        // VP: Userprofile and logout button is visible
        await expect(this.lnkUserProfile, 'User Profile button not found').toBeVisible();
        await expect(this.lnkLogout, 'Logout button not found').toBeVisible();
    }

    async verifyUserIsLoggedInMobile() {
        // VP: Userprofile and logout button is visible
        await expect(this.lnkMobileUserProfile, 'User Profile button not found').toBeVisible();
        await expect(this.lnkMobileLogout, 'Logout button not found').toBeVisible();
    }

    async verifyUserDisplayedName(expectedName: string) {
        const currentUser = await this.getUserDisplayedName();

        expect(currentUser,
            `Incorrect display name: Expected ${expectedName} but received ${currentUser}`
        ).toBe(expectedName);
    }

}