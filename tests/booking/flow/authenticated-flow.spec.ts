import { test } from "../../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../../pages/ShowtimePage";
import { pickRandomNumberBetween } from "../../utils/shared.helpers";
import { getRandomSeatNumbersPreferConsecutive, getSampleShowtimesWithAvailableSeats } from "../../utils/booking.helpers";
import { getAvailableSeats } from "../../../api/showtimes/showtimes.helpers";
import { userBooking } from "../../test-data/testUsers";

test.describe('Ticket Booking Functionality Tests (Logged-in User)', () => {

    let showtimePage: ShowtimePage;
    let numSeatsChecked: number;

    test.beforeEach(async ({ page, loginPage }) => {
        // instead of using fixture to avoid potential errors when run parallel tests
        const user = userBooking[2];

        await loginPage.navigateToLoginPage();
        await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
        await loginPage.verifySuccessMsgAndLoggedInStatus();

        showtimePage = new ShowtimePage(page);
        numSeatsChecked = pickRandomNumberBetween(1, 8);
    });

    test('Successful Seats Booking @smoke @regression', async ({ page }) => {

        const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: numSeatsChecked });
        test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');
        const sampleShowtimeIds = sampleShowtimes.map(showtime => showtime.maLichChieu.toString());

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Book seats for showtime ${showtime}`, async () => {
                // Pick random available seats (default 2)
                const availableSeats = await getAvailableSeats(showtime);
                const seatsToBook = getRandomSeatNumbersPreferConsecutive(availableSeats);

                // Go to showtime page and attempt to book seats
                const showtimePageURL = await showtimePage.navigateToShowtimePageAndWait(showtime);
                await showtimePage.selectNonSelectedSeats(seatsToBook);
                await showtimePage.clickBookTickets();

                // Verify success message
                await showtimePage.verifySuccessAlert();
                await showtimePage.exitSuccessAlert();

                // Navigate back to showtime page if needed & Verify booked seats are now unavailable (unselectable)
                if (page.url() !== showtimePageURL) {
                    await showtimePage.navigateToShowtimePageAndWait(showtime);
                }

                await showtimePage.verifySeatSelectability(seatsToBook, false);
            });
        }
    })

    test('Invalid Ticket Booking due to Empty Selection', async ({ }) => {

        const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: numSeatsChecked });
        const sampleShowtimeIds = sampleShowtimes.map(showtime => showtime.maLichChieu.toString());

        for (const showtime of sampleShowtimeIds) {

            await showtimePage.navigateToShowtimePageAndWait(showtime);
            await showtimePage.clickBookTickets();

            // Verify error alert
            await showtimePage.verifyEmptySelectionAlert();
            await showtimePage.exitEmptySelectionAlert();
        }
    })

});

