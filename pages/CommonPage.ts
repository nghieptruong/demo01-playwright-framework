import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TopBarNavigation } from "./components/TopBarNavigation";

export class CommonPage extends BasePage {

    // ========== Components ==========
    readonly topBarNavigation: TopBarNavigation;

    // ========== Constructor ==========
    constructor(page: Page) {
        super(page);
        this.topBarNavigation = new TopBarNavigation(page);
    }

}