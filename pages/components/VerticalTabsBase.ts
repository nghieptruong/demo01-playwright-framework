import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "../BasePage";

export abstract class VerticalTabsBase extends BasePage {         // used for mapping/grouping showtimes in different ways 

    // ========== Static Configuration ==========
    static readonly SELECTORS = {
        image: 'img[alt]',
    };

    // ========== Constructor ==========
    protected readonly root: Locator;

    constructor(page: Page, rootSelector: string) {
        super(page);
        this.root = page.locator(rootSelector);
    }

    // ========== Locators ==========
    get tabPanels() {
        return this.root.getByRole('tabpanel');
    }

    get tabLists() {
        return this.root.getByRole('tablist');
    }

    get tabs() {
        return this.getTabsFromTabList(this.tabLists);
    }

    getTabsFromTabList(tablist: Locator): Locator {
        return tablist.getByRole('tab');
    }

    getActiveTab(tablist: Locator): Locator {
        return tablist.getByRole('tab', { selected: true });
    }

    getNonActiveTabs(tablist: Locator): Locator {
        return tablist.locator('tab[aria-selected="false"]');     // why getByRole("tab", ( { selected: false })) doesnt work?
    }

    getTabLocatorByTabName(tablist: Locator, tabName: string): Locator {
        return tablist.getByRole('tab', { name: tabName });
    }

    // ========== Get Info ==========
    async getTabImageAltText(tab: Locator): Promise<string> {
        await tab.waitFor();
        const imgLocator = tab.locator(VerticalTabsBase.SELECTORS.image);
        if (!await imgLocator.isVisible()) {
            throw new Error(`Image not visible for tab`);
        }
        return await this.getElementAttribute(imgLocator, 'alt');
    }

    async getAllTabAltTexts(tablist: Locator): Promise<string[]> {

        const tabs = this.getTabsFromTabList(tablist);
        await tabs.first().waitFor();

        let altTexts: string[] = [];

        const tabCount = await this.getElementCount(tabs);

        for (let i = 0; i < tabCount; i++) {
            const tab = tabs.nth(i);
            const altText = await this.getTabImageAltText(tab);
            altTexts.push(altText);
        }
        return altTexts;
    }

    async isTabSelected(tab: Locator): Promise<boolean> {
        const isSelected = await tab.getAttribute('aria-selected');
        if (!isSelected) {
            throw new Error(`aria-selected attribute not found for tab`);
        };
        return isSelected === 'true';
    }

    // ========== Actions ==========
    async selectTab(tab: Locator): Promise<void> {
        await this.clickElement(tab);
        await expect(tab).toHaveAttribute("aria-selected", "true");
    }

}
