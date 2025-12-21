import { test, expect } from "../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../pages/ShowtimePage";
import { MoviePage } from "../../pages/MoviePage";
import { getSampleShowtimesWithAvailableSeats } from "../utils/booking.helpers";
import { findMovieIdByShowtimeId } from "../../api/movies/movies.helpers";
import { ShowtimeInfo } from "../../api/showtimes/showtimes.types";
import { findCinemaByShowtimeId, getCinemaInfoById } from "../../api/cinemas/cinemas.helpers";
import { Cinema } from "../../api/cinemas/cinemas.types";
import { HomePage } from "../../pages/HomePage";
import { LoginPage } from "../../pages/LoginPage";
import { userE2EJourney } from "../test-data/testUsers";

test.setTimeout(120000); 

test.describe('E2E: User Journey - Discovery & Browsing', () => {

    test('Goal-Oriented User: Dropdown Filter → Select Showtime → Book Tickets', async ({ page }) => {

        const homePage = new HomePage(page);
        let showtimePage: ShowtimePage;

        const user = userE2EJourney[0];

        let sampleShowtime: ShowtimeInfo;
        let sampleShowtimeIdString: string;
        let sampleMovieId: string;

        await test.step('Pre-test Prep: Find showtime with available seats', async () => {

            const availableShowtimes = await getSampleShowtimesWithAvailableSeats({
                // request at least 8 seats to minimize chance of sold-out during booking
                seatQuantity: 8,
                sampleSize: 1
            });

            test.skip(availableShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');

            sampleShowtime = availableShowtimes[0];
            sampleShowtimeIdString = sampleShowtime.maLichChieu.toString();
            // Find movie Id for that showtime (use name would be less reliable due to duplicates)
            sampleMovieId = await findMovieIdByShowtimeId(sampleShowtime.maLichChieu.toString());
        });

        await test.step('Login and redirect to Homepage', async () => {

            const loginPage = new LoginPage(page);
            await loginPage.navigateToLoginPage();

            await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
            await loginPage.verifySuccessMsgAndLoggedInStatus();

            await loginPage.verifyNavigationToHomePage();
        });

        await test.step('Wait for dropdowns selector on Homepage to load', async () => {
            await homePage.showtimeSelector.waitForMovieOptionsLoaded();
        });

        await test.step('Apply filters to find and select the wanted showtime', async () => {

            // Apply each filter dropdown to select the showtime
            await homePage.showtimeSelector.selectMovieById(sampleMovieId);
            await homePage.showtimeSelector.selectCinemaBranchByName(sampleShowtime.tenCumRap);
            await homePage.showtimeSelector.selectShowtimeById(sampleShowtimeIdString);
        });

        await test.step('Click button to navigate to showtime booking page', async () => {
            await homePage.showtimeSelector.clickFindTicketsButton();
        });

        await test.step('Verify showtime details match selected filters', async () => {

            showtimePage = new ShowtimePage(page);
            await showtimePage.waitForSeatMapAndPreview();

            const showtimeInfoOnPage = await showtimePage.getShowtimeInfo();

            expect(showtimeInfoOnPage.maLichChieu, 'Showtime ID mismatched').toBe(sampleShowtime.maLichChieu);
            expect(showtimeInfoOnPage.tenPhim, 'Movie name mismatched').toBe(sampleShowtime.tenPhim);
            expect(showtimeInfoOnPage.tenCumRap, 'Cinema branch name mismatched').toContain(sampleShowtime.tenCumRap);
        });

        await test.step('Select seats and complete booking as logged-in user', async () => {

            await showtimePage.waitForSeatMapAndPreview();
            await showtimePage.selectAvailableSeatsPreferConsecutive();

            await showtimePage.clickBookTickets();
            await showtimePage.verifySuccessAlert();
        });

    });

    test('Discovery User: Browse Movie Carousel → View Details → Select Showtime → Book', async ({ page }) => {

        const homePage = new HomePage(page);
        let moviePage: MoviePage;

        const user = userE2EJourney[1];

        let sampleShowtimeIdString: string;
        let sampleMovieId: string;
        let sampleCinemaInfo: Cinema;

        let movieTitleOnCarousel: string;

        await test.step('Pre-test Prep: Find showtime with available seats', async () => {

            const availableShowtimes = await getSampleShowtimesWithAvailableSeats({
                // request at least 8 seats to minimize chance of sold-out during booking
                seatQuantity: 8,
                sampleSize: 1
            });

            test.skip(availableShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');

            const sampleShowtime = availableShowtimes[0];
            sampleShowtimeIdString = sampleShowtime.maLichChieu.toString();

            // Find cinema info for that showtime 
            const sampleCinemaId = await findCinemaByShowtimeId(sampleShowtimeIdString);
            sampleCinemaInfo = await getCinemaInfoById(sampleCinemaId);

            // Find movie Id for that showtime (use name would be less reliable due to duplicates)
            sampleMovieId = await findMovieIdByShowtimeId(sampleShowtime.maLichChieu.toString());
        });

        await test.step('Login and redirect to Homepage', async () => {

            const loginPage = new LoginPage(page);
            await loginPage.navigateToLoginPage();

            await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
            await loginPage.verifySuccessMsgAndLoggedInStatus();

            await loginPage.verifyNavigationToHomePage();
        });

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

        await test.step('Verify movie title on page matches on carousel', async () => {
            moviePage = new MoviePage(page);

            const movieTitleOnPage = await moviePage.getMovieTitle();

            expect(movieTitleOnPage, 'Movie title on page mismatched').toBe(movieTitleOnCarousel);
        });

        await test.step('Select cinema to find showtime and click on showtime link', async () => {

            await moviePage.movieShowtimesTabs.waitForShowtimesLoaded();
            await moviePage.movieShowtimesTabs.selectCinemaTabByName(sampleCinemaInfo.tenHeThongRap);

            await moviePage.movieShowtimesTabs.clickShowtimeLinkById(sampleShowtimeIdString);
        });

        await test.step('Verify navigate to showtime booking page', async () => {
            await moviePage.verifyNavigationToShowtimePage(sampleShowtimeIdString);
        });

        await test.step('Select seats and complete booking as logged-in user', async () => {
            const showtimePage = new ShowtimePage(page);

            await showtimePage.waitForSeatMapAndPreview();
            await showtimePage.selectAvailableSeatsPreferConsecutive();

            await showtimePage.clickBookTickets();
            await showtimePage.verifySuccessAlert();
        });

    });

    test('Location-First User: Browse Cinema Tabs → Browse Locations → Select Showtime → Book', async ({ page, loggedInHomepage }) => {

        const homePage = loggedInHomepage.homePage;

        let sampleShowtime: ShowtimeInfo;
        let sampleShowtimeIdString: string;
        let sampleMovieId: string;
        let sampleCinemaAlias: string;

        await test.step('Pre-test Prep: Find showtime with available seats', async () => {

            const findAvailableShowtime = await getSampleShowtimesWithAvailableSeats({
                // request at least 5 seats to minimize chance of sold-out during booking
                seatQuantity: 5,
                sampleSize: 1
            });

            test.skip(findAvailableShowtime.length === 0, 'Test skipped: No available showtimes found.');

            sampleShowtime = findAvailableShowtime[0];
            sampleShowtimeIdString = sampleShowtime.maLichChieu.toString();

            // Find cinema info for that showtime 
            const sampleCinemaId = await findCinemaByShowtimeId(sampleShowtimeIdString);
            const sampleCinemaInfo = await getCinemaInfoById(sampleCinemaId);
            sampleCinemaAlias = sampleCinemaInfo.tenHeThongRap;

            // Find movie Id for that showtime (use name would be less reliable due to duplicates)
            sampleMovieId = await findMovieIdByShowtimeId(sampleShowtime.maLichChieu.toString());
        });

        await test.step('Wait for cinema tabs on Homepage to load', async () => {
            await homePage.navigateToHomePageAndWait();
            await homePage.cinemaShowtimesTabs.waitForTabsLoaded();
        });

        await test.step('Select cinema, branch and click on showtime link', async () => {

            await homePage.cinemaShowtimesTabs.selectCinemaByAliasAndVerifyBranchesUpdated(sampleCinemaAlias);
            await homePage.cinemaShowtimesTabs.selectBranchByNameAndVerifyShowtimesUpdated(sampleShowtime.tenCumRap);
            await homePage.cinemaShowtimesTabs.selectShowtimeById(sampleShowtimeIdString);

        });

        await test.step('Verify navigate to showtime booking page', async () => {
            await homePage.verifyNavigationToShowtimePage(sampleShowtimeIdString);
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
