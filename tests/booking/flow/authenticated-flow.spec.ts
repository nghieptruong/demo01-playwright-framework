import { test } from "../../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../../pages/ShowtimePage";
import { pickRandomNumberBetween } from "../../utils/dataManipulation.helpers";
import { getRandomSeatNumbersPreferConsecutive, getSampleShowtimesWithAvailableSeats } from "../../utils/bookingSampleProvider";
import { getAvailableSeats } from "../../../api/booking/booking.helpers";
import { createNewTestUser, deleteTestUser } from "../../utils/testUserProvider";
import { loginAndGoToHomePage } from "../../utils/shared.helpers";
import type { AccountDataApi } from "../../../api/users/accounts.types";

test.describe('Ticket Booking Functionality Tests (Logged-in User)', () => {

    let showtimePage: ShowtimePage;
    let user: AccountDataApi;

    test.beforeEach(async ({ page, loginPage }) => {
        await test.step('Find sample showtimes with available seats to run test', async () => {
            showtimePage = new ShowtimePage(page);
            const numSeatsRequired = pickRandomNumberBetween(1, 8);

            // Default if not specified: 1 sample
            const sampleShowtimeIds = await getSampleShowtimesWithAvailableSeats({ seatQuantity: numSeatsRequired });
            test.skip(sampleShowtimeIds.length === 0, 'Test skipped: No showtimes with available seats found.');
        });

        await test.step('Login as new test user', async () => {
            user = await createNewTestUser();
            await loginAndGoToHomePage(loginPage, user);
        });

    });

    test.afterEach(async () => {
        await test.step('Delete test user after test', async () => {
            await deleteTestUser(user.taiKhoan);
        });
    });

    test('Successful Booking Available Seats @smoke @regression', async ({ page }) => {

        let sampleShowtimeIds: string[] = [];
        let showtimePageURL: string;
        let seatsToBook: string[] = [];

        for (const showtime of sampleShowtimeIds) {
            await test.step(`Navigate to booking page for showtime ${showtime}`, async () => {
                // Navigate and wait for seat map to load
                showtimePageURL = await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);
            });

            await test.step(`Select sample available seats and click Booking button`, async () => {
                const availableSeats = await getAvailableSeats(showtime);
                seatsToBook = getRandomSeatNumbersPreferConsecutive(availableSeats);

                await showtimePage.selectNonSelectedSeats(seatsToBook);
                await showtimePage.clickBookTickets();
            });

            await test.step('Verify booking success dialog', async () => {
                await showtimePage.verifySuccessAlert();
                await showtimePage.exitSuccessAlert();
            });

            await test.step('Verify booked seats now become unavailable on booking page', async () => {
                if (page.url() !== showtimePageURL) {
                    await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);
                } else {
                    await page.reload();
                }
                await showtimePage.verifySeatSelectability(seatsToBook, false);
            });
        }
    })

    test('Invalid Ticket Booking due to Empty Selection', async ({ }) => {
        let sampleShowtimeIds: string[] = [];

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Navigate to booking page for showtime ${showtime}`, async () => {
                await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);
            });

            await test.step(`Click booking button without selecting seat`, async () => {
                await showtimePage.clickBookTickets();
            });

             await test.step(`Verify empty selection alert`, async () => {
                await showtimePage.verifyEmptySelectionAlert();
                await showtimePage.exitEmptySelectionAlert();
            });
        }
    })
});
