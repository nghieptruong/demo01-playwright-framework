import { Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";
import { pageURLPaths } from "../tests/utils/pageRoutes";
import { VerticalTabsMovie } from "./components/VerticalTabsMovie";
export class MoviePage extends CommonPage {

    // ========== Components ==========
    readonly movieShowtimesTabs: VerticalTabsMovie;

    // ========== Static Configuration ==========
    readonly SELECTORS = {
        btnPlayVideo: '//button[.//img[@alt="video-button"]]',
        showtimeBlock: '#cinemaList',
    }

    constructor(page: Page) {
        super(page);
        this.movieShowtimesTabs = new VerticalTabsMovie(page, '#cinemaList');
    }

    // ========== Navigation ==========
    async navigateToMoviePageAndWait(movieId: string) {
        const moviePageURL = `${pageURLPaths.movie}${movieId}`;
        await this.navigateToPage(moviePageURL);
        await this.waitForShowtimeTabsLoaded();
    }

    async waitForShowtimeTabsLoaded() {
        await this.waitForElementVisible(this.movieShowtimesTabs.lnkShowtimes.first());
    }

    // ========== Locators ==========
    get btnPlayVideo() {
        return this.page.locator(this.SELECTORS.btnPlayVideo);
    }

    get lblMovieTitle() {
        return this.page.getByRole('heading', { level: 1 });
    }

    get lblMovieDuration() {
        return this.page.getByRole('heading', { level: 5 });
    }

    get lblRating() {
        return this.page.getByRole('progressbar').first();
    }

    get showtimeBlock() {
        return this.page.locator(this.SELECTORS.showtimeBlock);
    }

    // ========== Getters ==========
    async getMovieTitle(): Promise<string> {
        return await this.getElementText(this.lblMovieTitle);
    }

    async getMovieDurationText(): Promise<string> {
        return await this.getElementText(this.lblMovieDuration);
    }

    async getMovieDurationMinutes(): Promise<number> {
        const durationText = await this.getMovieDurationText();
        const durationMin = durationText.replace('phút', '').trim();
        return parseInt(durationMin);
    }

    async getMovieRating(): Promise<number> {
        const ratingValue = await this.getElementAttribute(this.lblRating, 'aria-valuenow');
        return ratingValue ? parseFloat(ratingValue) / 10 : 0;
    }

    // ========== Verifications ==========
    async verifyRedirectToShowtimeBookingPage(showtimeId: string) {
        await this.verifyNavigationToShowtimePage(showtimeId);
    };

}