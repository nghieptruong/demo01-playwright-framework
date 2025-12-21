import { expect, test } from "../../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../../pages/ShowtimePage";
import { pickRandomNumberBetween, pickSampleItems, shuffleItems } from "../../utils/shared.helpers";
import { getSampleShowtimesWithAvailableSeats, getSampleShowtimesWithReservedSeats, getSampleShowtimesWithAvailableMixedSeats } from "../../utils/booking.helpers";
import { getAvailableSeats, getReservedSeats, getAvailableStandardSeats, getAvailableVipSeats } from "../../../api/showtimes/showtimes.helpers";

let showtimePage: ShowtimePage;
let requiredSeatQuant: number;
let sampleShowtimeIds: string[] = [];

test.beforeEach(async ({ page }) => {

    showtimePage = new ShowtimePage(page);
    // Randomize the required seat quantity between 4 to 8
    requiredSeatQuant = await pickRandomNumberBetween(4, 8);

});

test.describe('Seat Selectability Verification', () => {

    test('Unavailable seats are non-selectable @regression', async () => {

        await test.step(`Find sample showtimes with reserved seats`, async () => {

            // Find eligible sample showtimes (fallback: 1 seat, 1 sample)
            const sampleShowtimes = await getSampleShowtimesWithReservedSeats({ seatQuantity: requiredSeatQuant, sampleSize: 2 });

            test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with reserved seats found.');

            sampleShowtimeIds = sampleShowtimes.map(s => s.maLichChieu.toString());

        });

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Verify reserved seats buttons disabled for showtime: ${showtime}`, async () => {

                // Pick sample reserved seats to test (from api data)
                const unavailableSeats = await getReservedSeats(showtime);
                const seatsToTest = pickSampleItems(shuffleItems(unavailableSeats));

                // Navigate to showtime page
                await showtimePage.navigateToShowtimePageAndWait(showtime);

                // Assertion: Seat button is not found (count = 0) / disabled
                await showtimePage.verifySeatSelectability(seatsToTest, false);

            });
        }
    });

    test('Available Seats can be Selected and Deselected @regression', async () => {

        await test.step(`Find sample showtimes with available seats`, async () => {

            // Find eligible sample showtimes (fallback: 1 seat, 1 sample)
            const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: requiredSeatQuant, sampleSize: 2 });

            test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');

            sampleShowtimeIds = sampleShowtimes.map(s => s.maLichChieu.toString());
        });

        for (const showtime of sampleShowtimeIds) {
            await test.step(`Verify available seats are selectable for showtime: ${showtime}`, async () => {

                // Pick random available seats to test (from api data)
                const availableSeats = await getAvailableSeats(showtime);
                const seatsToTest = pickSampleItems(shuffleItems(availableSeats));

                // Go to showtime page ans select seats
                await showtimePage.navigateToShowtimePageAndWait(showtime);
                await showtimePage.selectNonSelectedSeats(seatsToTest);

                // Verify each seat state is updated to selected
                for (const number of seatsToTest) {

                    await expect.poll(() => showtimePage.isSeatSelected(number), {
                        message: `Seat selected state did not update after attempting to select seat`,
                    }).toBe(true);
                }

                // Proceed to unselect seats and verify deselection
                await showtimePage.unselectSelectedSeats(seatsToTest);

                for (const number of seatsToTest) {

                    await expect.poll(() => showtimePage.isSeatSelected(number), {
                        message: `Seat selected state did not update after attempting to unselect seat`,
                    }).toBe(false);

                }
            });
        }
    });

    test.describe('Mixed Seat Types Selection', async () => {

        test('Standard and VIP seats can be combined in selection', async () => {

            await test.step(`Find sample showtimes with mixed seat types available`, async () => {

                // Find eligible sample showtimes (fallback: 1 seat, 1 sample)
                const sampleShowtimes = await getSampleShowtimesWithAvailableMixedSeats({ seatQuantity: requiredSeatQuant, sampleSize: 2 });

                test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with mixed seat types found.');

                sampleShowtimeIds = sampleShowtimes.map(s => s.maLichChieu.toString());
            });

            for (const showtime of sampleShowtimeIds) {

                await test.step(`Verify available seats are selectable for showtime: ${showtime}`, async () => {

                    // Get available standard and VIP seats (api data)
                    const standardSeats = await getAvailableStandardSeats(showtime);
                    const vipSeats = await getAvailableVipSeats(showtime);

                    // Pick sample seats from both types
                    const standardSeatsToSelect = pickSampleItems(shuffleItems(standardSeats));
                    const vipSeatsToSelect = pickSampleItems(shuffleItems(vipSeats));
                    const mixedSeats = [...standardSeatsToSelect, ...vipSeatsToSelect];

                    // Navigate to showtime page and select mixed seats
                    await showtimePage.navigateToShowtimePageAndWait(showtime);
                    await showtimePage.selectNonSelectedSeats(mixedSeats);

                    // Verify all seats are selected
                    for (const seatNumber of mixedSeats) {
                        await expect.poll(() => showtimePage.isSeatSelected(seatNumber), {
                            message: `Seat ${seatNumber} should be selected`
                        }).toBe(true);
                    }

                    // Unselect all seats & verify deselection
                    await showtimePage.unselectSelectedSeats(mixedSeats);

                    for (const seatNumber of mixedSeats) {
                        await expect.poll(() => showtimePage.isSeatSelected(seatNumber), {
                            message: `Seat ${seatNumber} should be deselected`
                        }).toBe(false);
                    }
                });
            }
        });
    });

})