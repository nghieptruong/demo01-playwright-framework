import { Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";
import { ChainedDropdownsHome } from "./components/ChainedDropdownsHome";
import { SlideCarouselHome } from "./components/SlideCarouselHome";
import { VerticalTabsHome } from "./components/VerticalTabsHome";
import { pageURLs } from "../tests/utils/pageRoutes";
import { SearchBarHome } from "./components/SearchBarHome";

export class HomePage extends CommonPage {

    // ========== Components ==========
    readonly showtimeSelector: ChainedDropdownsHome;
    readonly featuredMoviesCarousel: SlideCarouselHome;
    readonly cinemaShowtimesTabs: VerticalTabsHome;
    readonly mobileMovieSearchBar: SearchBarHome;

    constructor(page: Page) {
        super(page);
        this.showtimeSelector = new ChainedDropdownsHome(page, '#homeTool');
        this.featuredMoviesCarousel = new SlideCarouselHome(page, '#lichChieu');
        this.cinemaShowtimesTabs = new VerticalTabsHome(page, '#cumRap + div');   // temporary fix, it should be just '#cumRap'
        this.mobileMovieSearchBar = new SearchBarHome(page);
    }

    // ========== Navigation ==========
    async navigateToHomePageAndWait() {
        await this.navigateToPage(pageURLs.home);
        // Wait for main home page content to load
        await this.waitForElementAttacched(this.page.locator('div.App > div:nth-child(3)'));
    }

    async verifyNoNavigation() {
        await super.verifyNoNavigation(pageURLs.home);
    }
}