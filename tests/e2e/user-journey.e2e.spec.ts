import { test, expect } from "../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../pages/ShowtimePage";
import { MoviePage } from "../../pages/MoviePage";
import { getSampleShowtimesWithAvailableSeats } from "../utils/bookingSampleProvider";
import { findMovieIdByShowtimeId } from "../../api/cinemas/helpers";
import { findCinemaIdByShowtimeId, findMovieTitleByShowtimeId, getBranchNameByShowtimeId } from "../../api/booking/booking.helpers";
import { LoginPage } from "../../pages/LoginPage";
import { BookingData } from "../../api/booking/booking.types";
import { pickRandomNumberBetween } from "../utils/dataManipulation.helpers";
import { createNewTestUser, deleteTestUser } from "../utils/testUserProvider";
import { loginAndGoToHomePage } from "../utils/shared.helpers";
import { getShowtimeBookingData } from "../../api/booking/booking.api";
import { getCinemaSystem } from "../../api/cinemas/cinemas.api";
import { AccountDataApi } from "../../api/users/accounts.types";

test.setTimeout(120000);

test.describe('E2E: User Journey - Discovery & Browsing', () => {

    let showtimePage: ShowtimePage;

    let showtimeData: BookingData;
    let sampleShowtime: string;
    let sampleMovieId: string;

    let user: AccountDataApi;

    test.beforeEach(async ({ page }) => {
        await test.step('Find sample showtime with available seats to run test', async () => {
            showtimePage = new ShowtimePage(page);
            const numSeatsRequired = pickRandomNumberBetween(1, 8);

            const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: numSeatsRequired });
            test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');

            sampleShowtime = sampleShowtimes[0];
            showtimeData = await getShowtimeBookingData(sampleShowtime);
            sampleMovieId = await findMovieIdByShowtimeId(sampleShowtime);
        });

        await test.step('Login as new test user', async () => {
            user = await createNewTestUser();
            const loginPage = new LoginPage(page);
            await loginAndGoToHomePage(loginPage, user);
        });
    });

    test('Goal-Oriented User: Dropdown Filter → Select Showtime → Book Tickets', async ({ page, homePage }) => {

        await test.step('Apply filters to find and select the wanted showtime', async () => {
            // await homePage.showtimeSelector.waitForMovieOptionsLoaded();
            // Apply each filter dropdown to select the showtime
            await homePage.showtimeSelector.selectMovieById(sampleMovieId);
            await homePage.showtimeSelector.selectCinemaBranchByName(showtimeData.thongTinPhim.tenCumRap);
            await homePage.showtimeSelector.selectShowtimeById(sampleShowtime);
        });

        await test.step('Click button to navigate to showtime booking page', async () => {
            await homePage.showtimeSelector.clickFindTicketsButton();
        });

        await test.step('Verify showtime details match selected filters', async () => {

            showtimePage = new ShowtimePage(page);
            await showtimePage.waitForSeatMapAndPreview();

            const showtimeInfoOnPage = await showtimePage.getShowtimeInfo();

            expect(showtimeInfoOnPage.maLichChieu.toString(), 'Showtime ID mismatched').toBe(sampleShowtime);
            expect(showtimeInfoOnPage.tenPhim, 'Movie name mismatched').toBe(await findMovieTitleByShowtimeId(sampleShowtime));
            expect(showtimeInfoOnPage.tenCumRap, 'Cinema branch name mismatched').toContain(await getBranchNameByShowtimeId(sampleShowtime));
        });

        await test.step('Select seats and complete booking as logged-in user', async () => {
            await showtimePage.waitForSeatMapAndPreview();
            await showtimePage.selectAvailableSeatsPreferConsecutive();

            await showtimePage.clickBookTickets();
            await showtimePage.verifySuccessAlert();
        });
    });

    test('Discovery User: Browse Movie Carousel → View Details → Select Showtime → Book', async ({ page, homePage }) => {

        let moviePage: MoviePage;
        let movieTitleOnCarousel: string;

        await test.step('Wait for movie carousel on Homepage to load', async () => {
            await homePage.featuredMoviesCarousel.waitForCarouselLoaded();
        });

        await test.step('Browse carousel for a movie and navigate to movie detail page', async () => {
            // Browse carousel slides to find the movie and capture its title
            await homePage.featuredMoviesCarousel.browseCarouselToFindMovie(sampleMovieId);
            movieTitleOnCarousel = (await homePage.featuredMoviesCarousel.getMovieInfoByMovieId(sampleMovieId)).tenPhim;

            // Click to go to movie detail page
            await homePage.featuredMoviesCarousel.clickGoToMoviePageLink(sampleMovieId);
            await homePage.featuredMoviesCarousel.verifyNavigationToMovieDetailPage(sampleMovieId);
        });

        await test.step('Verify movie title on movie detail page is correct', async () => {
            moviePage = new MoviePage(page);
            const movieTitleOnPage = await moviePage.getMovieTitle();

            expect(movieTitleOnPage, 'Movie title on page mismatched').toBe(movieTitleOnCarousel);
        });

        await test.step('Select cinema to find showtime and click on showtime link', async () => {

            await moviePage.movieShowtimesTabs.waitForShowtimesLoaded();

            const cinemaId = await findCinemaIdByShowtimeId(sampleShowtime);
            const cinemaName = (await getCinemaSystem(cinemaId)).tenHeThongRap;
            await moviePage.movieShowtimesTabs.selectCinemaTabByName(cinemaName);

            await moviePage.movieShowtimesTabs.clickShowtimeLinkById(sampleShowtime);
        });

        await test.step('Verify navigate to showtime booking page', async () => {
            await moviePage.verifyNavigationToShowtimePage(sampleShowtime);
        });

        await test.step('Select seats and complete booking as logged-in user', async () => {
            const showtimePage = new ShowtimePage(page);

            await showtimePage.waitForSeatMapAndPreview();
            await showtimePage.selectAvailableSeatsPreferConsecutive();

            await showtimePage.clickBookTickets();
            await showtimePage.verifySuccessAlert();
        });

    });

    test('Location-First User: Browse Cinema Tabs → Browse Locations → Select Showtime → Book', async ({ page, homePage }) => {

        await test.step('Navigate to Homepage and Wait for cinema tabs to load', async () => {
            await homePage.navigateToHomePageAndWait();
            await homePage.cinemaShowtimesTabs.waitForTabsLoaded();
        });

        await test.step('Select cinema, branch and click on showtime link', async () => {
            const cinemaId = await findCinemaIdByShowtimeId(sampleShowtime);
            const cinemaAlias = (await getCinemaSystem(cinemaId)).biDanh;
            await homePage.cinemaShowtimesTabs.selectCinemaByAliasAndVerifyBranchesUpdated(cinemaAlias);
            await homePage.cinemaShowtimesTabs.selectBranchByNameAndVerifyShowtimesUpdated(await getBranchNameByShowtimeId(sampleShowtime)); // need to check
            await homePage.cinemaShowtimesTabs.selectShowtimeById(sampleShowtime);
        });

        await test.step('Verify navigate to showtime booking page', async () => {
            await homePage.verifyNavigationToShowtimePage(sampleShowtime);
        });

        await test.step('Select seats and complete booking as logged-in user', async () => {
            const showtimePage = new ShowtimePage(page);

            await showtimePage.waitForSeatMapAndPreview();
            await showtimePage.selectAvailableSeatsPreferConsecutive();

            await showtimePage.clickBookTickets();
            await showtimePage.verifySuccessAlert();
        });

    });

});
