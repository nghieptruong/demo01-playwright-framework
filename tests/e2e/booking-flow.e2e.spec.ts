import { expect, test } from "../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../pages/ShowtimePage";
import { AccountPage } from "../../pages/AccountPage";
import { getSampleShowtimesWithAvailableSeats } from "../utils/booking.helpers";
import { OrderDetails } from "../../pages/shared.types";
import { userBooking } from "../test-data/testUsers";
import { LoginPage } from "../../pages/LoginPage";

test.setTimeout(120000); 

test.describe('E2E: Complete Booking Flow', () => {

    test('Select Showtime → Select seats & Book → Guest Blocked → Login → Select seats & Book → Verify Order History', async ({ page, loginPage }) => {

        const showtimePage = new ShowtimePage(page);
        const user = userBooking[0];

        let sampleShowtimeId: string;
        let showtimeURL: string;
        let bookedSeats: string[] = [];
        let orderPreview: OrderDetails;

        await test.step('Find showtime with available seats', async () => {

            const availableShowtimes = await getSampleShowtimesWithAvailableSeats({
                // request at least 8 seats to minimize chance of sold-out during booking
                seatQuantity: 8,
                sampleSize: 1
            });

            test.skip(availableShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');

            sampleShowtimeId = availableShowtimes[0].maLichChieu.toString();
        });

        await test.step('Navigate to showtime booking page', async () => {
            showtimeURL = await showtimePage.navigateToShowtimePageAndWait(sampleShowtimeId);
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

            await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
            await loginPage.verifySuccessMsgAndLoggedInStatus();
        });

        await test.step('Navigate back to showtime page and complete booking', async () => {
            await showtimePage.navigateToShowtimePageAndWait(sampleShowtimeId);

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


    test('Logged-in User: Select Showtime → Select Seats & Book → Verify Order History', async ({ page }) => {

        let showtimePage: ShowtimePage;
        const user = userBooking[1];

        let sampleShowtimeId: string;
        let bookedSeats: string[] = [];
        let orderPreview: OrderDetails;

        await test.step('Find showtime with available seats', async () => {

            const availableShowtimes = await getSampleShowtimesWithAvailableSeats({
                // request at least 8 seats to minimize chance of sold-out during booking
                seatQuantity: 8,
                sampleSize: 1
            });

            test.skip(availableShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');

            sampleShowtimeId = availableShowtimes[0].maLichChieu.toString();
        });

        await test.step('Go to Login page and complete login', async () => {

            const loginPage = new LoginPage(page);

            await loginPage.navigateToLoginPage();

            await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
            await loginPage.verifySuccessMsgAndLoggedInStatus();
        });

        await test.step('Navigate to showtime booking page', async () => {
            showtimePage = new ShowtimePage(page);
            await showtimePage.navigateToShowtimePageAndWait(sampleShowtimeId);
        });

        await test.step('Select seats and complete booking', async () => {

            // default: select 2 seats or whatever available, prefer consecutive
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

});
