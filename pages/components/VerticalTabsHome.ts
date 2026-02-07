import { expect, Locator, Page } from "@playwright/test";
import { pickRandomItem } from "../../tests/utils/dataManipulation.helpers";
import { extractShowtimeId } from "../../tests/utils/shared.helpers";
import { pageURLPaths } from "../../tests/utils/pageRoutes";
import { cinemaEndpoints } from "../../api/config/apiRoutes";
import { findCinemaSysIdByAlias } from "../../api/cinemas/helpers";
import { VerticalTabsBase } from "./VerticalTabsBase";

export type BranchTabUI = {
      tenCumRap: string,
      diaChi: string,
}

export class VerticalTabsHome extends VerticalTabsBase {

      // ========== Static Configuration ==========
      static readonly CUSTOM_SELECTORS = {
            lnkShowtime: `a[href*='${pageURLPaths.showtime}']`,
      };

      // ========== Constructor ==========
      constructor(page: Page, rootSelector: string) {
            super(page, rootSelector);
      }

      // ========== Wait Methods ==========
      async waitForTabsLoaded() {
            await this.waitForElementVisible(this.cinemaTabs.first());
            await this.cinemaTabs.first().scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(500);  // wait for any tab animation to complete
      }

      // ========== Locators ==========
      get tabComponent() {
            return this.root;
      }

      get cinemaTabList() {
            return this.cinemaTabs.locator('xpath=ancestor::div[@role="tablist"]');
      }

      get cinemaTabs() {
            // Assume cinema tabs always the only tab with images (business logic)
            return this.tabLists.getByRole('tab')
                  .filter({ has: this.page.locator('img[alt]') })
      }

      get branchTabList() {
            // Note: This assumes branch tablist is always  the 1st following tablist after cinema tablist 
            return this.cinemaTabList.locator('xpath=following::div[@role="tablist"][1]');
      }

      get branchTabs() {
            return this.getTabsFromTabList(this.branchTabList);
      }

      get branchNonActiveTabs() {
            return this.getNonActiveTabs(this.branchTabList);
      }

      get showtimePanel() {
            return this.tabPanels.last();   // business logic: showtime tabpanel is always the last tabpanel
      }

      get movieHeadings() {
            return this.showtimePanel.getByRole('heading', { level: 2 });
      }

      get lnkShowtimes() {
            return this.root.locator(VerticalTabsHome.CUSTOM_SELECTORS.lnkShowtime);
      }

      get tabpanelMovieSections() {
            return this.movieHeadings.locator('..');  // parent of movie heading                                                     
      }

      // --- Conditional locators ---
      // Tab locator by name
      getCinemaTabByCinemaAlias(cinemaAlias: string): Locator {
            return this.getTabLocatorByTabName(this.cinemaTabList, cinemaAlias);
      }

      getBranchTabByBranchName(branchName: string): Locator {
            return this.getTabLocatorByTabName(this.branchTabList, branchName);
      }

      // Text within branch tab
      getBranchNameLocator(branchTab: Locator): Locator {
            return branchTab.getByRole('heading', { level: 4 });
      }

      getBranchAddressLocator(branchTab: Locator): Locator {
            return branchTab.getByRole('heading', { level: 6 });
      }

      // Movie sections within Showtime tabpanel 
      getMovieHeadingLocatorForSection(movieSection: Locator): Locator {
            return movieSection.getByRole('heading', { level: 2 });
      }

      getMovieRatingLocatorSection(heading: Locator): Locator {
            return heading.locator('span');
      }

      getShowtimeLinksInMovieSection(movieSection: Locator): Locator {
            return movieSection.locator(VerticalTabsHome.CUSTOM_SELECTORS.lnkShowtime);
      }

      getShowtimeLinkById(showtimeId: string): Locator {
            const href = `${pageURLPaths.showtime}${showtimeId}`;
            return this.showtimePanel.locator(`a[href*='${href}']`);
      }

      // ========== Get Info ========== 
      async getCinemaAliasFromTab(cinemaTab: Locator): Promise<string> {
            const alias = await this.getTabImageAltText(cinemaTab);
            return alias;
      }

      async getBranchInfoFromTab(branchTab: Locator): Promise<BranchTabUI> {
            await branchTab.waitFor();

            const name = this.getBranchNameLocator(branchTab);
            const address = this.getBranchAddressLocator(branchTab);

            return ({
                  tenCumRap: await this.getElementText(name),
                  diaChi: await this.getElementText(address),
            })

      }

      async getShowtimeIdFromLink(showtimeLink: Locator): Promise<string> {
            const href = await this.getElementAttribute(showtimeLink, 'href');
            if (!href) throw new Error(`href not found. Locator: ${showtimeLink}`);
            return extractShowtimeId(href);
      }

      async getMovieTitleForSection(movieSection: Locator): Promise<string> {

            const heading = this.getMovieHeadingLocatorForSection(movieSection);
            const rating = this.getMovieRatingLocatorSection(movieSection);

            const headingText = await this.getElementText(heading);
            const ratingText = await rating.innerText() ?? '';                // C18 

            const title = headingText.replace(ratingText, '');

            if (title === '') {
                  throw new Error(`Movie title is not found. Movie section locator: ${movieSection}`);
            }

            return title;
      }

      async getAllShowtimeIdsForSection(movieSection: Locator): Promise<string[]> {

            const links = this.getShowtimeLinksInMovieSection(movieSection);
            const allLinks = await links.all();

            let listIds: string[] = [];

            for (const link of allLinks) {
                  const id = await this.getShowtimeIdFromLink(link);
                  listIds.push(id);
            }

            return listIds;
      }

      async getMovieAndShowtimeInfoForSection(movieSection: Locator): Promise<{
            tenPhim: string;
            maLichChieu: string[];
      }> {

            const movieTitle = await this.getMovieTitleForSection(movieSection);
            const showtimeIds = await this.getAllShowtimeIdsForSection(movieSection);

            const movieSectionInfo = {
                  tenPhim: movieTitle,
                  maLichChieu: showtimeIds
            };

            return movieSectionInfo;
      }

      async countCinemas(): Promise<number> {
            return await this.getElementCount(this.cinemaTabs);
      }

      async countMovies(): Promise<number> {
            return await this.getElementCount(this.showtimePanel);
      }

      async countShowtimes(): Promise<number> {
            return await this.getElementCount(this.lnkShowtimes);
      }

      async getCurrentCinemaAliases(): Promise<string[]> {
            return await this.getAllTabAltTexts(this.cinemaTabList);
      }

      async getCurrentBranchesInfo(): Promise<BranchTabUI[]> {

            await this.waitForElementVisible(this.branchTabs.first());
            const branches = await this.branchTabs.all();

            let branchList: BranchTabUI[] = [];

            for (const branch of branches) {
                  const branchInfo = await this.getBranchInfoFromTab(branch);
                  branchList.push(branchInfo);
            }
            return branchList;
      }

      async getCurrentMovieSectionsInfo(): Promise<{
            tenPhim: string;
            maLichChieu: string[];
      }[]> {

            await this.waitForElementVisible(this.tabpanelMovieSections.first());
            const movieSections = await this.tabpanelMovieSections.all();

            let allMovies: {
                  tenPhim: string;
                  maLichChieu: string[];
            }[] = [];

            for (const section of movieSections) {

                  const info = await this.getMovieAndShowtimeInfoForSection(section);
                  allMovies.push(info);
            }
            return allMovies;
      }

      // ========== Actions ==========
      async selectRandomShowtime(): Promise<string> {

            await this.waitForElementVisible(this.lnkShowtimes.first());

            const showtimes = await this.lnkShowtimes.all();
            const randomShowtime = pickRandomItem(showtimes);
            const showtimeId = await this.getShowtimeIdFromLink(randomShowtime);

            await this.clickElement(randomShowtime);
            return showtimeId;
      }

      async selectShowtimeById(showtimeId: string) {
            const showtimeLink = this.getShowtimeLinkById(showtimeId);
            await this.clickElement(showtimeLink);
      }

      async goBackAndReselectParentCinema(cinema: Locator) {
            await this.navigateBack();
            await this.waitForElementVisible(this.cinemaTabs.first());

            await this.selectCinemaAndWaitBranchTablistUpdated(cinema);
      }

      async selectCinemaByAliasAndVerifyBranchesUpdated(cinemaAlias: string) {
            await this.selectCinemaAndWaitBranchTablistUpdated(cinemaAlias);
      }

      async selectBranchByNameAndVerifyShowtimesUpdated(branchName: string) {
            const branchTab = this.getBranchTabByBranchName(branchName);
            await this.selectBranchAndWaitShowtimesUpdated(branchTab);
      }

      async selectCinemaAndWaitBranchTablistUpdated(cinema: string | Locator) {

            if (typeof cinema === 'string') {
                  cinema = this.getCinemaTabByCinemaAlias(cinema);
            }
            
            if (await this.isTabSelected(cinema)) return;

            // Capture the name of the first displayed branch BEFORE clicking 
            const firstBranchLocator = this.branchTabs.first();
            const initialFirstBranchName = (await this.getBranchInfoFromTab(firstBranchLocator)).tenCumRap;

            // Select cinema
            await this.selectCinemaAndWaitForApiData(cinema);

            // Wait until first branch name changes (verify tab updates before further action)
            await expect
                  .poll(async () => {
                        const branch = this.branchTabs.first();
                        return (await this.getBranchInfoFromTab(branch)).tenCumRap;
                  }, { message: `Branch list did not update within timeout. Cinema locator: ${cinema}`, timeout: 5000 })
                  .not.toBe(initialFirstBranchName);
      }

      async selectCinemaAndWaitForApiData(cinemaTab: Locator) {

            const alias = await this.getCinemaAliasFromTab(cinemaTab);
            const cinemaId = await findCinemaSysIdByAlias(alias);

            const locator = this.getCinemaTabByCinemaAlias(alias);

            await Promise.all([
                  this.page.waitForResponse(cinemaEndpoints.systemSchedule(cinemaId)),
                  this.clickElement(cinemaTab)
            ]);

            await expect(locator).toHaveAttribute("aria-selected", "true");
      }

      async selectBranchAndWaitShowtimesUpdated(branch: Locator | string) {
            if (typeof branch === 'string') {
                  branch = this.getBranchTabByBranchName(branch);
            }
            
            // Skip if already selected 
            if (await this.isTabSelected(branch)) return;

            // Get initial first showtime link href
            const initialFirstLinkTabpanel = this.lnkShowtimes.first();
            const initialFirstId = await this.getShowtimeIdFromLink(initialFirstLinkTabpanel);

            // Select branch
            await this.selectTab(branch);

            // Wait for the first showtime id to change compared to previous
            await expect
                  .poll(async () => {
                        const firstId = this.lnkShowtimes.first();
                        return (await this.getShowtimeIdFromLink(firstId));
                  }, { message: `Showtimes tabpanel did not update within timeout. Branch locator: ${branch}`, timeout: 5000 })
                  .not.toBe(initialFirstId);
      }

}
