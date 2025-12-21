import { expect, Locator, Page } from "@playwright/test";
import { pageURLs } from "../tests/utils/routes";

export abstract class BasePage {

    // ========== Constructor ==========
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ========== Navigation ==========
    async navigateToPage(url: string) {
        await this.page.goto(url);
        await expect(this.page).toHaveURL(url);
    }

    async navigateBack() {
        await this.page.goBack();
        await this.page.waitForLoadState();
    }

    // ========== Verify Navigation ==========

    async verifyNavigationToHomePage() {
        await expect(this.page,
            `Expected to be redirected to Home page: ${pageURLs.home}. Actual: ${this.page.url()}`
        ).toHaveURL(pageURLs.home);
    }

    async verifyNavigationToLoginPage() {
        await expect(this.page,
            `Expected to be redirected to Login page: ${pageURLs.login}. Actual: ${this.page.url()}`
        ).toHaveURL(pageURLs.login);
    }

    async verifyNavigationToRegisterPage() {
        await expect(this.page,
            `Expected to be redirected to Register page: ${pageURLs.register}. Actual: ${this.page.url()}`
        ).toHaveURL(pageURLs.register);
    }

    async verifyNavigationToAccountPage() {
        await expect(this.page,
            `Expected to be redirected to User Profile page: ${pageURLs.account}. Actual: ${this.page.url()}`
        ).toHaveURL(pageURLs.account);
    }

    async verifyNavigationToShowtimePage(showtimeId: string) {
        const expectedUrl = pageURLs.showtime(showtimeId);

        await expect(this.page,
            `Expected showtime page: ${expectedUrl}. Actual: ${this.page.url()}`
        ).toHaveURL(expectedUrl);
    }

    async verifyNavigationToMovieDetailPage(movieId: string) {
        const expectedUrl = pageURLs.movie(movieId);

        await expect(this.page,
            `Expected movie detail page: ${expectedUrl}. Actual: ${this.page.url()}`
        ).toHaveURL(expectedUrl);
    }

    async verifyNoNavigation(currentUrl: string) {
        await expect(this.page,
            `Expected to stay on the same page: ${currentUrl}. Actual: ${this.page.url()}`
        ).toHaveURL(currentUrl);
    }

    // ========== Get Info ==========
    async getElementText(locator: Locator): Promise<string> {
        await this.waitForElementVisible(locator);
        return await locator.textContent() ?? '';
    }

    async getElementAttribute(locator: Locator, attribute: string): Promise<string> {
        await this.waitForElementVisible(locator);
        return await locator.getAttribute(attribute) ?? '';
    }

    async getElementCount(locator: Locator): Promise<number> {
        return locator.count();
    }

    async getFieldValue(locator: Locator): Promise<string> {
        await this.waitForElementVisible(locator);
        return await locator.inputValue();
    }

    async getBackgroundColor(locator: Locator): Promise<string> {
        return locator.evaluate(el => getComputedStyle(el).backgroundColor);
    }

    // ========== Actions ==========
    async clickElement(locator: Locator) {
        await locator.click();
    }

    async setValueAndBlur(locator: Locator, value: string) {
        // Clear fields first to ensure clean state
        await locator.clear();
        await locator.fill(value);
        await locator.blur();
    }

    async selectDropdownOption(dropdownLocator: Locator, optionValue: string) {
        await dropdownLocator.selectOption(optionValue);
    }

    // ========== Wait Methods ==========
    async waitForElementVisible(locator: Locator, timeoutMs: number = 10000) {
        await locator.waitFor({ state: 'visible', timeout: timeoutMs });
    }

    async waitForElementAttacched(locator: Locator, timeoutMs: number = 10000) {
        await locator.waitFor({ state: 'attached', timeout: timeoutMs });
    }
}