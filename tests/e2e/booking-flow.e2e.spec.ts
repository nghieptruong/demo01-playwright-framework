import { expect, test } from "../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../pages/ShowtimePage";
import { AccountPage } from "../../pages/AccountPage";
import { getSampleShowtimesWithAvailableSeats } from "../utils/bookingSampleProvider";
import { OrderDetails } from "../../pages/shared.types";
import { LoginPage } from "../../pages/LoginPage";
import { pickRandomNumberBetween } from "../utils/dataManipulation.helpers";
import { createNewTestUser } from "../utils/testUserProvider";
import { loginAndGoToHomePage } from "../utils/shared.helpers";
import { BookingData } from "../../api/booking/booking.types";
import { getShowtimeBookingData } from "../../api/booking/booking.api";
import { AccountDataApi } from "../../api/users/accounts.types";
import { findMovieIdByShowtimeId } from "../../api/cinemas/helpers";

test.setTimeout(120000);

test.describe('E2E: Complete Booking Flow', () => {

    let showtimePage: ShowtimePage;
    let sampleShowtimeId: string;
    let showtimeData: BookingData;
    let tetsUser: AccountDataApi;

    test.beforeEach(async ({ page }) => {
        await test.step('Find sample showtime with available seats to run test', async () => {
            showtimePage = new ShowtimePage(page);
            const numSeatsRequired = pickRandomNumberBetween(1, 8);

            const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: numSeatsRequired });
            test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');

            sampleShowtimeId = sampleShowtimes[0];
            showtimeData = await getShowtimeBookingData(sampleShowtimeId);
        });

        await test.step('Create new test user', async () => {
            tetsUser = await createNewTestUser();
        });
    });

    test('Guest Flow: Apply Filter To Find Showtime → Select seats & Book → Guest Blocked → Login → Select seats & Book → Verify Order History', async ({ page, loginPage, homePage }) => {

        let bookedSeats: string[] = [];
        let orderPreview: OrderDetails;

        await test.step('Go to Homepage and apply filters to select showtime', async () => {
            await homePage.navigateToHomePageAndWait();

            const movieId = await findMovieIdByShowtimeId(sampleShowtimeId);
            await homePage.showtimeSelector.selectMovieById(movieId);
            await homePage.showtimeSelector.selectCinemaBranchByName(showtimeData.thongTinPhim.tenCumRap);
            await homePage.showtimeSelector.selectShowtimeById(sampleShowtimeId);
        });

         await test.step('Confirm selection to go to showtime page and make a booking', async () => {
            await homePage.showtimeSelector.clickFindTicketsButton();

            showtimePage = new ShowtimePage(page);
            await showtimePage.waitForSeatMapAndPreview();
        });

        await test.step('Select seats and attempt booking as guest', async () => {
            // default: select 2 seats, prefer consecutive
            await showtimePage.selectAvailableSeatsPreferConsecutive();
            await showtimePage.clickBookTickets();
        });

        await test.step('Verify booking blocked and login redirect alert', async () => {
            await showtimePage.verifyLoginRequestAlert();
        });

        await test.step('Accept redirect and login with credentials', async () => {
            await showtimePage.acceptLoginRedirect();
            await showtimePage.verifySuccessfulRedirectToLogin();

            await loginPage.fillLoginFormAndSubmit(tetsUser.taiKhoan, tetsUser.matKhau);
            await loginPage.verifySuccessMsgAndLoggedInStatus();
        });

        await test.step('Navigate back to showtime page and complete booking', async () => {
            await showtimePage.navigateToShowtimePageAndWaitForSeatMap(sampleShowtimeId);

            await showtimePage.selectAvailableSeatsPreferConsecutive();

            // Capture order preview details before booking
            orderPreview = await showtimePage.getCurrentOrderPreviewDetails();

            await showtimePage.clickBookTickets();

            await showtimePage.verifySuccessAlert();
            await showtimePage.exitSuccessAlert();
        });

        await test.step('Verify booked seats are now unavailable', async () => {
            await showtimePage.verifySeatSelectability(bookedSeats, false);
        });

        await test.step('Verify booking appears in order history', async () => {
            const accountPage = new AccountPage(page);
            await accountPage.navigateToAccountPage();

            const lastOrder = await accountPage.orderHistory.getLastOrderDetails();

            // Skip timestamp comparison - timing discrepancies expected
            expect(lastOrder.movieTitle, 'Movie title mismatched in Order History').toBe(orderPreview.movieTitle);
            expect(lastOrder.bookedSeats, 'Booked seats mismatched in Order History').toEqual(orderPreview.bookedSeats);
            expect(lastOrder.price, 'Price mismatched in Order History').toBe(orderPreview.price);
        });

    });


    test('Logged-in User Flow: Login → Apply Filter To Find Showtime → Select Seats & Book → Verify Order History', async ({ page, homePage }) => {

        let showtimePage: ShowtimePage;
        let bookedSeats: string[] = [];
        let orderPreview: OrderDetails;

        await test.step('Log in', async () => {
            const loginPage = new LoginPage(page);
            await loginAndGoToHomePage(loginPage, tetsUser);
        });

        await test.step('Go to Homepage and apply filters to select showtime', async () => {
            await homePage.navigateToHomePageAndWait();

            const movieId = await findMovieIdByShowtimeId(sampleShowtimeId);
            await homePage.showtimeSelector.selectMovieById(movieId);
            await homePage.showtimeSelector.selectCinemaBranchByName(showtimeData.thongTinPhim.tenCumRap);
            await homePage.showtimeSelector.selectShowtimeById(sampleShowtimeId);
        });

         await test.step('Confirm selection to go to showtime page and make a booking', async () => {
            await homePage.showtimeSelector.clickFindTicketsButton();

            showtimePage = new ShowtimePage(page);
            await showtimePage.waitForSeatMapAndPreview();
        });

        await test.step('Select seats and complete booking', async () => {
            // default: select 2 seats or whatever available, prefer consecutive
            bookedSeats = await showtimePage.selectAvailableSeatsPreferConsecutive();

            // Capture order preview details before booking
            orderPreview = await showtimePage.getCurrentOrderPreviewDetails();

            await showtimePage.clickBookTickets();

            await showtimePage.verifySuccessAlert();
            await showtimePage.exitSuccessAlert();
        });

        await test.step('Verify booked seats are now unavailable', async () => {
            await showtimePage.verifySeatSelectability(bookedSeats, false);
        });

        await test.step('Verify booking appears in order history', async () => {
            const accountPage = new AccountPage(page);
            await accountPage.navigateToAccountPage();

            const lastOrder = await accountPage.orderHistory.getLastOrderDetails();

            // Skip timestamp comparison - timing discrepancies expected
            expect(lastOrder.movieTitle, 'Movie title mismatched in Order History').toBe(orderPreview.movieTitle);
            expect(lastOrder.bookedSeats, 'Booked seats mismatched in Order History').toEqual(orderPreview.bookedSeats);
            expect(lastOrder.price, 'Price mismatched in Order History').toBe(orderPreview.price);
        });
    });
});