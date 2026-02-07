import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TopBarNavigation } from "./components/TopBarNavigation";
import { pageURLs } from "../tests/utils/pageRoutes";

export class CommonPage extends BasePage {

    // ========== Components ==========
    readonly topBarNavigation: TopBarNavigation;

    // ========== Constructor ==========
    constructor(page: Page) {
        super(page);
        this.topBarNavigation = new TopBarNavigation(page);
    }

    // ========== Navigation ==========
    async navigateToHomePage() {
        await this.navigateToPage(pageURLs.home);
    }
}