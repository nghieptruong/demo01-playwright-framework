import { findMovieIdByShowtimeId } from "../../api/movies/movies.helpers";
import { ShowtimeInfo } from "../../api/showtimes/showtimes.types";
import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { HomePage } from "../../pages/HomePage";
import { LoginPage } from "../../pages/LoginPage";
import { ShowtimePage } from "../../pages/ShowtimePage";
import { userBooking } from "../test-data/testUsers";
import { getSampleShowtimesWithAvailableSeats } from "../utils/booking.helpers";


test.describe('E2E: Booking Validation', () => {
    test('Booking must be blocked in the situation of stale seat selection', async ({ page }) => {

        // Initialize pages
        const homePage = new HomePage(page);
        let showtimePage: ShowtimePage;
        let accountPage: AccountPage;

        // Variables to hold test data
        let initialOrderCount: number;
        let selectedSeats: string[];

        // Use a test user from test data
        const user = userBooking[4];

        // Variables to hold sample showtime info
        let sampleShowtime: ShowtimeInfo;
        let showtimeId: string;
        let movieId: string;

        await test.step('Pre-test Prep: Find showtime with available seats', async () => {

            const availableShowtimes = await getSampleShowtimesWithAvailableSeats({
                // request at least 5 seats to minimize chance of sold-out during test
                seatQuantity: 5,
                sampleSize: 2
            });

            test.skip(availableShowtimes.length !== 2, 'Test skipped: No 2 showtimes with available seats found.');

            sampleShowtime = availableShowtimes[0];
            showtimeId = sampleShowtime.maLichChieu.toString();
            movieId = await findMovieIdByShowtimeId(showtimeId);
        });

        await test.step('Go to Login page and complete login', async () => {
            const loginPage = new LoginPage(page);
            await loginPage.navigateToLoginPage();

            await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
            await loginPage.verifySuccessMsgAndLoggedInStatus();
        });

        await test.step('Go to Account page to get current order count', async () => {

            accountPage = new AccountPage(page);
            await accountPage.navigateToAccountPage();

            initialOrderCount = await accountPage.orderHistory.countOrders();
        });

        await test.step('Go to Homepage and apply filters to select showtime', async () => {
            await homePage.navigateToHomePageAndWait();
            await homePage.showtimeSelector.waitForMovieOptionsLoaded();

            await homePage.showtimeSelector.selectMovieById(movieId);
            await homePage.showtimeSelector.selectCinemaBranchByName(sampleShowtime.tenCumRap);
            await homePage.showtimeSelector.selectShowtimeById(showtimeId);
        });

        await test.step('Confirm selection to go to showtime page and make a booking', async () => {
            await homePage.showtimeSelector.clickFindTicketsButton();

            showtimePage = new ShowtimePage(page);
            await showtimePage.waitForSeatMapAndPreview();

            selectedSeats = await showtimePage.selectAvailableSeatsPreferConsecutive();
            await showtimePage.clickBookTickets();

            await showtimePage.verifySuccessAlert();
            await showtimePage.exitSuccessAlert();

        });

        await test.step('Go to account page to verify order succesfully added', async () => {
            await showtimePage.topBarNavigation.clickUserProfileLink();

            accountPage = new AccountPage(page);

            const newOrderCount = await accountPage.orderHistory.countOrders();
            const lastOrder = await accountPage.orderHistory.getLastOrderDetails();

            expect(newOrderCount,
                `Order count did not increase after booking. Initial: ${initialOrderCount}, Current: ${newOrderCount}`
            ).toBe(initialOrderCount + 1);

            expect(lastOrder.bookedSeats, 
                'Last order booked seats do not match selected seats'
            ).toEqual(selectedSeats);
        });

        await test.step('Go back to showtime page and check for stale seat selection state', async () => {
           
            await accountPage.navigateBack();

            await showtimePage.waitForSeatMapAndPreview();

            const previewSeats = await showtimePage.getPreviewSelectedSeats();

            expect(previewSeats,
                `Peviously selected seats are not carried over when returning to showtime page.`
            ).toEqual(expect.arrayContaining(selectedSeats));

        });

        await test.step('Attempt to book phantom seats and verify booking blocked', async () => {
            await showtimePage.clickBookTickets();

            // Assertion: No Success message 
            await showtimePage.verifyNoSuccessAlert();

            // Assertion: No new order in order history 
            await accountPage.navigateToAccountPage();

            const newOrderCount = await accountPage.orderHistory.countOrders();

            expect(newOrderCount,
                'New order was created despite seats were already booked in previous transaction'
            ).toBe(initialOrderCount + 1);

        });

    });
})

