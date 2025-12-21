import { getAvailableSeats } from '../../../api/showtimes/showtimes.helpers';
import { test } from '../../../fixtures/custom-fixtures';
import { ShowtimePage } from '../../../pages/ShowtimePage';
import { getRandomSeatNumbersPreferConsecutive, getSampleShowtimesWithAvailableSeats } from '../../utils/booking.helpers';
import { pickRandomNumberBetween } from '../../utils/shared.helpers';

test.describe('Unauthenticated Booking Restrictions', () => {
    let showtimePage: ShowtimePage;
    let requiredSeatQuant: number;
    let sampleShowtimeIds: string[];

    test.beforeEach(async ({ page }) => {
        showtimePage = new ShowtimePage(page);

        await test.step('Find sample showtimes with available seats to run all guest booking tests', async () => {
            // Pick sample showtimes (default: 2) with many available seats to minimize sold-out risk (fallback to any available ones)
            requiredSeatQuant = pickRandomNumberBetween(6, 10);
            const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: requiredSeatQuant });
           
            test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');

            sampleShowtimeIds = sampleShowtimes.map(showtime => showtime.maLichChieu.toString());
        });
    });

    test('Booking as Guest triggers Login redirect alert @regression', async ({ }) => {

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Attempt to book seats as guest for showtime ${showtime}`, async () => {
                // Pick random available seats (default 2)
                const availableSeats = await getAvailableSeats(showtime);
                const seatsToBook = getRandomSeatNumbersPreferConsecutive(availableSeats);

                // Go to showtime page and select seats
                await showtimePage.navigateToShowtimePageAndWait(showtime);
                await showtimePage.selectNonSelectedSeats(seatsToBook);

                // Attempt to book without login
                await showtimePage.clickBookTickets();
            });

            await test.step(`Verify login request alert is shown`, async () => {
                await showtimePage.verifyLoginRequestAlert();
            });
        }
    });

    test('Login Redirect Alert Behavior @regression', async ({ page }) => {

        let initialUrl: string;

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Attempt to book seats as guest for showtime ${showtime}`, async () => {
                
                const availableSeats = await getAvailableSeats(showtime);
                const seatsToBook = getRandomSeatNumbersPreferConsecutive(availableSeats);

                await showtimePage.navigateToShowtimePageAndWait(showtime);
                initialUrl = page.url();

                await showtimePage.selectNonSelectedSeats(seatsToBook);
                await showtimePage.clickBookTickets();
            });

            await test.step(`Wait for login request alert, cancel and verify no redirect`, async () => {
                await showtimePage.verifyLoginRequestAlert();

                await showtimePage.cancelLoginRedirect();
                await showtimePage.verifyLoginRedirectCancelled(initialUrl);
            });

            await test.step(`Trigger login request alert again, accept and verify redirect to login page`, async () => {
                await showtimePage.clickBookTickets();
                await showtimePage.verifyLoginRequestAlert();

                await showtimePage.acceptLoginRedirect();
                await showtimePage.verifySuccessfulRedirectToLogin();

            });
        }
    })

});
