import { expect, Locator, Page } from "@playwright/test";
import { VerticalTabsBase } from "./VerticalTabsBase";
import { pageURLPaths } from "../../tests/utils/pageRoutes";
import { extractShowtimeId } from "../../tests/utils/shared.helpers";

export class VerticalTabsMovie extends VerticalTabsBase {

    // ========== Static Configuration ==========
    static readonly CUSTOM_SELECTORS = {
        lnkShowtime: `a[href*='${pageURLPaths.showtime}']`,
    };

    // ========== Constructor ==========
    constructor(page: Page, rootSelector: string) {
        super(page, rootSelector);
    }

    // ========== Wait Methods ==========
    async waitForShowtimesLoaded() {
        await this.waitForElementVisible(this.lnkShowtimes.first());
    }

    // ========== Locators ==========
    get cinemaTabList() {
        return this.tabLists;
    }

    get ShowtimeTabPanel() {
        return this.tabPanels;
    }

    get cinemaTabs() {
        return this.getTabsFromTabList(this.cinemaTabList);
    }

    get branchNameLocators() {
        return this.ShowtimeTabPanel.getByRole('heading', { level: 3 });
    }

    get lnkShowtimes() {
        return this.root.locator(VerticalTabsMovie.CUSTOM_SELECTORS.lnkShowtime);
    }

    getLnkShowtimeById(showtimeId: string): Locator {
        const href = `${pageURLPaths.showtime}${showtimeId}`;
        return this.root.locator(`a[href*='${href}']`);
    }

    getCinemaTabByCinemaName(cinemaName: string): Locator {
        return this.getTabLocatorByTabName(this.cinemaTabList, cinemaName);
    }

    getBranchSectionByShowtimeLink(showtimeLink: Locator): Locator {
        return showtimeLink.locator('xpath=./preceding::h3[1]');
    }

    // ========== Get Info ==========
    async getCinemaNameForTab(cinemaTab: Locator): Promise<string> {
        const altText = await this.getTabImageAltText(cinemaTab);
        return altText;
    }

    async getAllCinemaNames(): Promise<string[]> {

        const cinemaCount = await this.countCinemas();

        const cinemaAliases: string[] = [];

        for (let i = 0; i < cinemaCount; i++) {

            const cinemaTab = this.cinemaTabs.nth(i);
            const alias = await this.getCinemaNameForTab(cinemaTab);
            cinemaAliases.push(alias);

        }
        return cinemaAliases;
    }

    async getShowtimesGroupedByBranch(): Promise<Record<string, string[]>> {

        let branchAndShowtimesMap: Record<string, string[]> = {};
        const showtimeLinksCount = await this.getElementCount(this.lnkShowtimes);

        for (let i = 0; i < showtimeLinksCount; i++) {

            const showtimeLink = this.lnkShowtimes.nth(i);
            const href = await this.getElementAttribute(showtimeLink, 'href');

            if (!href) continue;

            const id = extractShowtimeId(href);

            const branchNameLocator = this.getBranchSectionByShowtimeLink(showtimeLink);
            const branchName = await this.getElementText(branchNameLocator);

            if (branchAndShowtimesMap[branchName]) {
                branchAndShowtimesMap[branchName].push(id);
                continue;
            }

            branchAndShowtimesMap[branchName] = [id];
        }
        return branchAndShowtimesMap;
    }

    async getShowtimeIdFromLink(showtimeLink: Locator): Promise<string> {
        const href = await this.getElementAttribute(showtimeLink, 'href');
        if (!href) throw new Error(`href not found. Locator: ${showtimeLink}`);
        return extractShowtimeId(href);
    }

    async getAllShowtimeIds(): Promise<string[]> {
        const showtimeCount = await this.getElementCount(this.lnkShowtimes);
        const showtimeIds: string[] = [];
        for (let i = 0; i < showtimeCount; i++) {
            const showtimeLink = this.lnkShowtimes.nth(i);
            const showtimeId = await this.getShowtimeIdFromLink(showtimeLink);
            showtimeIds.push(showtimeId);
        }
        return showtimeIds;
    }

    // ========== Actions ==========
    async countCinemas(): Promise<number> {
        await this.waitForElementVisible(this.cinemaTabs.first());
        return await this.getElementCount(this.cinemaTabs);
    }

    async selectCinemaTabByName(cinemaName: string) {
        const cinemaTab = this.getCinemaTabByCinemaName(cinemaName);
        await this.clickElement(cinemaTab);
    }

    async selectCinemaAndWaitForTabUpdated(cinemaTab: Locator) {

        // Skip if already selected 
        if (await this.isTabSelected(cinemaTab)) return;

        // Get initial first showtime id from tabpanel
        const initialFirstLink = this.lnkShowtimes.first();
        const initialFirstId = await this.getShowtimeIdFromLink(initialFirstLink);

        // Select branch
        await this.selectTab(cinemaTab);

        // Wait for the first showtime id to change compared to previous
        await expect
            .poll(async () => {
                const firstId = this.lnkShowtimes.first();
                return (await this.getShowtimeIdFromLink(firstId));
            }, { message: `Showtimes tabpanel did not update within timeout. Cinema locator: ${cinemaTab}`, timeout: 5000 })
            .not.toBe(initialFirstId);
    }

    async clickShowtimeLinkById(showtimeId: string) {
        const showtimeLink = this.getLnkShowtimeById(showtimeId);
        await this.clickElement(showtimeLink);
    }

}