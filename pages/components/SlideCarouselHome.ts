import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "../BasePage";
import { pageURLs } from "../../tests/utils/pageRoutes";

export type CarouselMovieInfo = {
    maPhim: string,
    tenPhim: string,
    moTa: string
}
export class SlideCarouselHome extends BasePage {

    // ========== Static Configuration ==========
    static readonly SELECTORS = {

        // slide
        pnlCarouselSlide: 'div.CarouselItem',
        pnlSlideNavigator: 'div.CarouselItem + div',

        // item
        pnlMovieItem: '//a[not(.="MUA VÉ")]',
        btnPlayVideo: '//button[.//img[@alt="video-button"]]',
        lnkGoToMoviePage: 'a:has-text("MUA VÉ")',
        lblRating: 'span',

        // iframe
        videoFrame: 'iframe',
        videoTrailer: 'video[src]',
        btnCloseVideo: 'button.modal-video-close-btn',
    }

    // ========== Constructor ==========
    readonly root: Locator;

    constructor(page: Page, rootSelector: string) {
        super(page);
        this.root = page.locator(rootSelector);
    }

    // ========== Locators ==========
    get pnlCarouselSlide() {
        return this.root.locator(SlideCarouselHome.SELECTORS.pnlCarouselSlide);
    }

    get slideCards() {
        return this.pnlCarouselSlide.locator(SlideCarouselHome.SELECTORS.pnlMovieItem);
    }

    get videoTrailer() {
        return this.pnlCarouselSlide
            .frameLocator(SlideCarouselHome.SELECTORS.videoFrame)
            .locator(SlideCarouselHome.SELECTORS.videoTrailer);
    }

    get btnSlideNavigator() {
        return this.root
            .locator(SlideCarouselHome.SELECTORS.pnlSlideNavigator)
            .getByRole("button");
    }

    get btnCloseVideo() {
        return this.page.locator(SlideCarouselHome.SELECTORS.btnCloseVideo);
    }

    getMovieCardByMovieId(movieId: string): Locator {
        const href = pageURLs.movie(movieId);
        return this.slideCards
            .filter({ has: this.page.locator(`a[href*='${href}']`) }).first();
    }

    getShowtimesPanelForMovie(movieItem: Locator): Locator {

        const movieShowtimeContainer = movieItem.locator("div")
            .filter({ has: this.page.getByRole("heading", { level: 4 }) })
            .filter({ hasNot: this.page.locator(SlideCarouselHome.SELECTORS.lnkGoToMoviePage) })
            .first();

        return movieShowtimeContainer;
    }

    getFindTicketsLinkForMovie(movieItem: Locator): Locator {
        return movieItem.getByRole("link", { name: "MUA VÉ" })
    }

    getLnkMoviePageByMovieId(movieId: string): Locator {
        const movieItem = this.getMovieCardByMovieId(movieId);
        return movieItem.locator(SlideCarouselHome.SELECTORS.lnkGoToMoviePage);
    }

    // ========== Wait Methods ==========
    async waitForCarouselLoaded() {
        await this.waitForElementVisible(this.pnlCarouselSlide);
        await this.waitForElementVisible(this.slideCards.first());
        await this.waitForElementVisible(this.btnSlideNavigator.first());
    }

    // ========== Get Info ==========
    async countSlides(): Promise<number> {
        return await this.getElementCount(this.btnSlideNavigator);
    }

    async countMovies(): Promise<number> {
        return await this.getElementCount(this.slideCards);
    }

    async getActiveSlideIndex(): Promise<number> {

        const buttons = this.btnSlideNavigator;

        const count = await buttons.count();

        for (let i = 0; i < count; i++) {
            const isSelected = await this.isSlideActive(i);
            if (isSelected) return i;
        }

        throw new Error('No pre-selected slide found.')
    }

    async getNonActiveSlideIndexes(): Promise<number[]> {

        let indexes: number[] = [];

        const buttons = this.btnSlideNavigator;
        const count = await this.getElementCount(buttons);

        for (let i = 0; i < count; i++) {
            const isSelected = await this.isSlideActive(i);
            if (!isSelected) {
                indexes.push(i);
            }
        }

        return indexes;
    }

    async getMovieId(movieItem: Locator): Promise<string> {

        await this.waitForElementVisible(movieItem);

        const href = await this.getElementAttribute(movieItem, 'href');
        const id = (href.split('/detail/').pop()) ?? '';
        return id;

    }

    async getMovieInfoByMovieId(movieId: string): Promise<CarouselMovieInfo> {
        const movieItem = this.getMovieCardByMovieId(movieId);
        return await this.extractMovieInfoFromLocator(movieItem);
    }

    async extractMovieInfoFromLocator(movieItem: Locator): Promise<CarouselMovieInfo> {

        const id = await this.getMovieId(movieItem);

        const movieInfoLocator = this.getShowtimesPanelForMovie(movieItem);
        await this.waitForElementVisible(movieInfoLocator);

        const [rawAllText, rawRating, rawDescription] = await Promise.all([
            this.getElementText(movieInfoLocator),
            movieInfoLocator.locator(SlideCarouselHome.SELECTORS.lblRating).innerText(),
            this.getElementText(movieItem.getByRole("heading", { level: 4 })),
        ]);

        const allText = rawAllText;
        const rating = rawRating ?? '';
        const description = rawDescription;

        const title = allText
            .replace(rating, '')              // remove "C18"
            .replace(description, '')         // remove intro paragraph
            .trim();

        const movieInfo: CarouselMovieInfo = {
            maPhim: id,
            tenPhim: title,
            moTa: description
        };

        return movieInfo;

    }

    async getCurrentlyDisplayedMoviesInfo(): Promise<CarouselMovieInfo[]> {

        const count = await this.slideCards.count();

        let allMoviesInfo: CarouselMovieInfo[] = [];

        for (let index = 0; index < count; index++) {
            const movieLocator = this.slideCards.nth(index);
            await movieLocator.waitFor();

            const movieInfo = await this.extractMovieInfoFromLocator(movieLocator);

            allMoviesInfo.push(movieInfo);
        }

        return allMoviesInfo;
    }

    async getAllMoviesInfoInCarousel(): Promise<CarouselMovieInfo[]> {

        const count = await this.countSlides();

        let allMoviesInfo: CarouselMovieInfo[] = [];

        for (let index = 0; index < count; index++) {

            await this.selectSlideAndWaitForUpdate(index);

            const moviesInfo = await this.getCurrentlyDisplayedMoviesInfo();

            allMoviesInfo.push(...moviesInfo);
        }

        return allMoviesInfo;
    }

    async isSlideActive(slideIndex: number): Promise<boolean> {
        const slideBtn = this.btnSlideNavigator.nth(slideIndex);

        const style = await this.getElementAttribute(slideBtn, 'style');
        const isSelected = style.includes("color");
        return isSelected;
    }

    // ========== Actions ==========
    async selectSlideAndWaitForUpdate(slideIndex: number) {

        const isSelected = await this.isSlideActive(slideIndex);

        // Do nothing if slide is already pre-selected
        if (isSelected) {
            return;
        }

        // If not selected, select slide and wait until first movie id changes
        const firstMovie = this.slideCards.first();
        const currentFirstMovieId = await this.getMovieId(firstMovie);

        await this.selectSlideBtnByIndex(slideIndex);

        await expect.poll(async () => {
            const newFirstMovieId = await this.getMovieId(firstMovie);
            return newFirstMovieId;
        }, { message: 'Carousel slide did not update within timeout', timeout: 8000 })
            .not.toEqual(currentFirstMovieId);
    }

    async selectSlideBtnByIndex(slideIndex: number) {

        const slideBtn = this.btnSlideNavigator.nth(slideIndex);
        await this.clickElement(slideBtn);

    }

    async playTrailerVideo(movieIndex: number) {

        const movie = this.slideCards.nth(movieIndex);

        await this.waitForElementVisible(movie);
        const button = movie.locator(SlideCarouselHome.SELECTORS.btnPlayVideo);

        await movie.hover();
        await this.waitForElementVisible(button);
        await expect(button).toBeEnabled({ timeout: 5000 });

        await this.clickElement(button);
        await this.waitForElementAttacched(this.videoTrailer);
    }

    async closeVideo() {
        await this.clickElement(this.btnCloseVideo);

        await expect(this.videoTrailer).not.toBeVisible();
        await expect(this.videoTrailer).not.toBeAttached({ timeout: 10000 });
    }

    async clickGoToMoviePageLink(movieId: string) {
        const movieItem = this.getMovieCardByMovieId(movieId);
        const link = this.getLnkMoviePageByMovieId(movieId);

        await movieItem.hover();
        await this.waitForElementVisible(link);

        await this.clickElement(link);
    }

    async browseCarouselToFindMovie(movieId: string) {

        const count = await this.countSlides();

        for (let index = 0; index < count; index++) {

            await this.selectSlideAndWaitForUpdate(index);

            const movieItem = this.getMovieCardByMovieId(movieId);
            const exists = await movieItem.count();

            if (exists > 0) {
                return;
            }
        }

        throw new Error(`Movie with id ${movieId} not found in any slide of the carousel.`);
    }

    // ========== Verifications ==========
    async verifyVideoDisplays() {
        await this.waitForElementVisible(this.videoTrailer, 10000);
    }

}



