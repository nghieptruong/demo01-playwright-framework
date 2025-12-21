import { Page } from "@playwright/test";
import { BasePage } from "../BasePage";

export class SearchBarHome extends BasePage {

    // ========== Constructor ==========
    constructor(page: Page) {
        super(page);
    }

    // ========== Locators ==========
    get txtSearchBar() {
        return this.page.getByPlaceholder('Tìm kiếm phim');
    }

    get btnSearchSubmit() {
        return this.page.locator('form').filter({ has: this.txtSearchBar }).getByRole('button');
    }

    // ========== Actions ========== (to implement later)
    
    // async searchKeyword(keyword: string) {
    //     await this.setValueAndBlur(this.txtSearchBar, keyword);
    //     await this.clickElement(this.btnSearchSubmit);
    // }

}