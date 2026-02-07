import { BookingData } from "../../api/booking/booking.types";
import { findMovieIdByShowtimeId } from "../../api/cinemas/helpers";
import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { HomePage } from "../../pages/HomePage";
import { LoginPage } from "../../pages/LoginPage";
import { ShowtimePage } from "../../pages/ShowtimePage";
import { getSampleShowtimesWithAvailableSeats } from "../utils/bookingSampleProvider";
import { pickRandomNumberBetween } from "../utils/dataManipulation.helpers";
import { createNewTestUser } from "../utils/testUserProvider";
import { loginAndGoToHomePage } from "../utils/shared.helpers";
import { getShowtimeBookingData } from "../../api/booking/booking.api";
import { AccountDataApi } from "../../api/users/accounts.types";

test.describe('E2E: Booking Validation', () => {

    let showtimePage: ShowtimePage;
    let accountPage: AccountPage;
    let homePage: HomePage;

    let sampleShowtimeId: string;
    let showtimeData: BookingData;

    let user: AccountDataApi;
    
    // Variables to hold test data
    let initialOrderCount: number;
    let selectedSeats: string[];

    test.beforeEach(async ({ page }) => {
        await test.step('Find sample showtime with available seats to run test', async () => {
            showtimePage = new ShowtimePage(page);
            const numSeatsRequired = pickRandomNumberBetween(1, 8);

            const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: numSeatsRequired });
            test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');

            sampleShowtimeId = sampleShowtimes[0];
            showtimeData = await getShowtimeBookingData(sampleShowtimeId);
        });

        await test.step('Login as new test user', async () => {
            user = await createNewTestUser();
            const loginPage = new LoginPage(page);
            await loginAndGoToHomePage(loginPage, user);
        });
    });


    test('Booking must be blocked in the situation of stale seat selection', async ({ page }) => {

        await test.step('Go to Account page to get current order count', async () => {
            accountPage = new AccountPage(page);
            await accountPage.navigateToAccountPage();
            initialOrderCount = await accountPage.orderHistory.countOrders();
        });

        await test.step('Go to Homepage and apply filters to select showtime', async () => {
            homePage = new HomePage(page);
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

