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
        // Use a different test user instead of using fixture to avoid potential errors when running parallel tests
        const user = userBooking[2];

        await loginPage.navigateToLoginPage();
        await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
        await loginPage.verifySuccessMsgAndLoggedInStatus();

        showtimePage = new ShowtimePage(page);
        numSeatsChecked = pickRandomNumberBetween(1, 8);
    });

    test('Successful Seats Booking @smoke @regression', async ({ page }) => {

        let sampleShowtimeIds: string[] = [];
        let showtimePageURL: string;
        let seatsToBook: string[] = [];

        await test.step('Find sample showtimes with available seats to run test', async () => {
            const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: numSeatsChecked });
            
            test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');
            
            sampleShowtimeIds = sampleShowtimes.map(showtime => showtime.maLichChieu.toString());
        });

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Find and book sample available seats for showtime ${showtime}`, async () => {
                const availableSeats = await getAvailableSeats(showtime);
                seatsToBook = getRandomSeatNumbersPreferConsecutive(availableSeats);

                showtimePageURL = await showtimePage.navigateToShowtimePageAndWait(showtime);
                await showtimePage.selectNonSelectedSeats(seatsToBook);
                await showtimePage.clickBookTickets();
            });

            await test.step('Verify success message and seats become unavailable on showtime page', async () => {
                await showtimePage.verifySuccessAlert();
                await showtimePage.exitSuccessAlert();

                if (page.url() !== showtimePageURL) {
                    await showtimePage.navigateToShowtimePageAndWait(showtime);
                } else {
                    await page.reload();
                }

                await showtimePage.verifySeatSelectability(seatsToBook, false);
            });

        }
    })

    test('Invalid Ticket Booking due to Empty Selection', async ({ }) => {

        let sampleShowtimeIds: string[] = [];
        await test.step('Find sample showtimes with available seats to run test', async () => {
            const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: numSeatsChecked });
            sampleShowtimeIds = sampleShowtimes.map(showtime => showtime.maLichChieu.toString());
        });

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Click booking with no seats selected and verify alert for showtime: ${showtime}`, async () => {
                await showtimePage.navigateToShowtimePageAndWait(showtime);
                await showtimePage.clickBookTickets();

                await showtimePage.verifyEmptySelectionAlert();
                await showtimePage.exitEmptySelectionAlert();
            });
        }
    })
});
