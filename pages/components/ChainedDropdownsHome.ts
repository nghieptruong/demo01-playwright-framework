import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "../BasePage";
import { pickRandomItem, shuffleItems } from "../../tests/utils/dataManipulation.helpers";
import { cinemaEndpoints, movieEndpoints } from "../../api/config/apiRoutes";

export type DropdownOptionInfo = {
    id: string,
    textLabel: string
}
export class ChainedDropdownsHome extends BasePage {

    // ========== Static Configuration ==========
    static readonly SELECTORS = {
        // Dropdown filters
        selMovie: 'select[name="film"]',
        selCinema: 'select[name="cinema"]',
        selShowtime: 'select[name="date"]'
    }

    static readonly ACCESSIBLE_NAMES = {
        // Buttons
        btnSearch: "MUA VÉ NGAY",
        btnCloseAlert: "Đã hiểu",

        // Content
        lblNoMovieAlert: "Bạn chưa chọn phim",
        noCinemaAlert: "Bạn chưa chọn rạp",
        noShowtimeAlert: "Bạn chưa chọn ngày giờ chiếu",
    };

    // ========== Constructor ==========
    readonly root: Locator;

    constructor(page: Page, rootSelector: string) {
        super(page);
        this.root = page.locator(rootSelector);
    }

    // ========== Locators ==========
    get selMovieDropdown() {
        return this.root.locator(ChainedDropdownsHome.SELECTORS.selMovie);
    }

    get selCinemaBranchDropdown() {
        return this.root.locator(ChainedDropdownsHome.SELECTORS.selCinema);
    }

    get selShowtimeDropdown() {
        return this.root.locator(ChainedDropdownsHome.SELECTORS.selShowtime);
    }

    get alertMissingFilter() {
        return this.page.getByRole("dialog");
    }

    get btnCloseAlert() {
        return this.page.getByRole("button", { name: ChainedDropdownsHome.ACCESSIBLE_NAMES.btnCloseAlert });
    }

    get btnFindTicket() {
        return this.root.getByRole("button", { name: ChainedDropdownsHome.ACCESSIBLE_NAMES.btnSearch });
    }

    getOptionsForDropdownFilter(dropdownField: Locator) {
        // Exclude placeholder (empty value)
        // Include hidden options - options of <select> always hidden
        return dropdownField.locator('option:not([value=""])');
    }

    // ========== Wait Methods ==========
    async waitForMovieOptionsLoaded() {
        const options = this.getOptionsForDropdownFilter(this.selMovieDropdown);
        await this.waitForElementAttacched(options.first());
    }

    async waitForCinemaOptions() {
        const options = this.getOptionsForDropdownFilter(this.selCinemaBranchDropdown);
        await this.waitForElementAttacched(options.first());
    }

    async waitForShowtimeOptions() {
        const options = this.getOptionsForDropdownFilter(this.selShowtimeDropdown);
        await this.waitForElementAttacched(options.first());
    }

    // ========== Get Info ==========
    async getOptionInfo(option: Locator): Promise<DropdownOptionInfo> {

        await this.waitForElementAttacched(option);

        // Don't use waitForElementVisible - <option> elements can be hidden
        const id = await option.getAttribute('value') ?? '';
        const textLabel = await option.textContent() ?? '';

        const info: DropdownOptionInfo = {
            id: id,
            textLabel: textLabel
        };

        return info;
    }

    async getOptionsInfoForDropdown(dropdownField: Locator): Promise<DropdownOptionInfo[]> {

        const options = await this.getOptionsForDropdownFilter(dropdownField).all();

        if (options.length === 0) {
            return [];
        }

        let optionsInfo: DropdownOptionInfo[] = [];

        for (const option of options) {
            const info = await this.getOptionInfo(option);
            optionsInfo.push(info);
        }
        return optionsInfo;
    }

    async getMovieOptionsInfo(): Promise<DropdownOptionInfo[]> {
        return await this.getOptionsInfoForDropdown(this.selMovieDropdown);
    }

    async getBranchOptionsInfo(): Promise<DropdownOptionInfo[]> {
        try {
            await this.waitForCinemaOptions();
        }
        catch {
            return [];
        }
        return await this.getOptionsInfoForDropdown(this.selCinemaBranchDropdown);
    }

    async getShowtimeOptionsInfo(): Promise<DropdownOptionInfo[]> {
        return await this.getOptionsInfoForDropdown(this.selShowtimeDropdown);
    }

    async getSelectedShowtimeId(): Promise<string> {
        return await this.getFieldValue(this.selShowtimeDropdown);
    }

    async getMissingFilterAlertName(): Promise<string> {

        const [movie, cinema, showtime] = await Promise.all([
            this.selMovieDropdown.inputValue(),
            this.selCinemaBranchDropdown.inputValue(),
            this.selShowtimeDropdown.inputValue(),
        ]);

        if (!movie) return ChainedDropdownsHome.ACCESSIBLE_NAMES.lblNoMovieAlert;
        if (!cinema) return ChainedDropdownsHome.ACCESSIBLE_NAMES.noCinemaAlert;
        if (!showtime) return ChainedDropdownsHome.ACCESSIBLE_NAMES.noShowtimeAlert;

        throw new Error('No missing filter');
    }

    // ========== Actions ==========

    async triggerNoMovieSelectedAlert() {

        const movie = await this.selMovieDropdown.inputValue();
        if (!movie) {
            return await this.clickElement(this.btnFindTicket);
        }
        throw new Error('Movie is already pre-selected.');
    }

    async triggerNoCinemaSelectedAlert() {

        await this.selectRandomMovie();

        const cinema = await this.selCinemaBranchDropdown.inputValue();
        if (!cinema) {
            return await this.clickElement(this.btnFindTicket);
        }

        throw new Error('Cinema is already pre-selected.');
    }

    async triggerNoShowtimeSelectedAlert() {

        const movies = await this.getMovieOptionsInfo();

        if (movies.length === 0) {
            throw new Error('No movie found in dropdown');
        }

        const movieIds = (await this.getMovieOptionsInfo()).map(m => m.id);
        const shuffledMovieIds = shuffleItems(movieIds);

        for (const id of shuffledMovieIds) {

            await this.selectMovieById(id);
            await expect(this.selMovieDropdown).toHaveValue(id);

            const cinemas = (await this.getBranchOptionsInfo());

            if (cinemas.length === 0) continue;

            const cinemaBranch = await this.selectRandomCinemaBranch();
            await expect(this.selCinemaBranchDropdown).toHaveValue(cinemaBranch);

            return await this.clickElement(this.btnFindTicket);
        }
        throw new Error('No valid cinema found for any movies');
    }

    async selectMovieById(movieId: string | number) {

        if (typeof movieId === 'number') {
            movieId = movieId.toString();
        }

        this.selectDropdownOption(this.selMovieDropdown, movieId); 
        await expect(this.selMovieDropdown).toHaveValue(movieId);

        // Ensure cinema options are populated before caller proceeds
        await this.waitForCinemaOptions();
    }

    async selectCinemaBranchById(cinemaId: string) {
        await this.waitForCinemaOptions();

        await this.selectDropdownOption(this.selCinemaBranchDropdown, cinemaId);
        await expect(this.selCinemaBranchDropdown).toHaveValue(cinemaId);
    }

    async selectCinemaBranchByName(branchName: string) {
        await this.waitForCinemaOptions();
        await this.selectDropdownOption(this.selCinemaBranchDropdown, branchName);
        await expect(this.selCinemaBranchDropdown).toContainText(branchName);
    }

    async selectShowtimeById(showtimeId: string) {
        await this.waitForShowtimeOptions();
        await this.selectDropdownOption(this.selShowtimeDropdown, showtimeId);
        await expect(this.selShowtimeDropdown).toHaveValue(showtimeId);
    }

    async selectRandomOption(filter: Locator): Promise<string> {

        const options = await this.getOptionsInfoForDropdown(filter);

        if (options.length === 0) {
            throw new Error('No available option to select');
        }

        const optionIds = options.map(o => o.id);

        const randomOption = pickRandomItem(optionIds);

        await this.selectDropdownOption(filter, randomOption);
        return randomOption;
    }

    async selectRandomMovie(): Promise<string> {
        return await this.selectRandomOption(this.selMovieDropdown);
    }

    async selectRandomCinemaBranch(): Promise<string> {
        return await this.selectRandomOption(this.selCinemaBranchDropdown);
    }

    async selectRandomShowtime(): Promise<string> {
        return await this.selectRandomOption(this.selShowtimeDropdown);
    }

    async clickFindTicketsButton(): Promise<void> {
        await this.clickElement(this.btnFindTicket);
    }

    // ========== Verifications ==========
    async verifyAndCloseMissingFilterAlert() {

        const alertName = await this.getMissingFilterAlertName();

        await expect(this.alertMissingFilter, 'Empty Selection Alert Not Found').toBeVisible();
        await expect(this.alertMissingFilter).toHaveAccessibleName(alertName);

        await this.clickElement(this.btnCloseAlert);
    }

}
