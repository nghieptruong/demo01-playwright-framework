import { expect, test } from "../../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../../pages/ShowtimePage";
import { pickRandomNumberBetween, pickSampleItems, shuffleItems } from "../../utils/dataManipulation.helpers";
import { getSampleShowtimesWithAvailableSeats, getSampleShowtimesWithReservedSeats, getSampleShowtimesWithAvailableMixedSeats } from "../../utils/bookingSampleProvider";
import { getAvailableSeats, getReservedSeats, getAvailableStandardSeats, getAvailableVipSeats } from "../../../api/booking/booking.helpers";

test.describe('Seat Selectability Verification', () => {

    let showtimePage: ShowtimePage;
    let requiredSeatQuant: number;
    let sampleShowtimeIds: string[] = [];

    test.beforeEach(async () => {
        // Randomize the required seat quantity between 4 to 8
        requiredSeatQuant = pickRandomNumberBetween(4, 8);
    });
    
    test('Unavailable seats are non-selectable @regression', async ({ page }) => {

        await test.step(`Find sample showtimes with reserved seats to run tests`, async () => {
            sampleShowtimeIds = await getSampleShowtimesWithReservedSeats({ seatQuantity: requiredSeatQuant, sampleSize: 1 });
            test.skip(sampleShowtimeIds.length === 0, 'Test skipped: No showtimes with reserved seats found.');
        });

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Go to booking page of showtime ${showtime} and wait for seat map`, async () => {
                showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);
            });

            await test.step(`Verify reserved seats buttons are disabled`, async () => {
                // Pick sample reserved seats to test (from api data)
                const unavailableSeats = await getReservedSeats(showtime);
                const seatsToTest = pickSampleItems(shuffleItems(unavailableSeats));

                // Assertion: Seat button is not found (count = 0) / disabled
                await showtimePage.verifySeatSelectability(seatsToTest, false);
            });
        }
    });

    test('Available Seats can be Selected and Deselected @regression', async ({ page }) => {

        await test.step(`Find sample showtimes with available seats to run tests`, async () => {
            sampleShowtimeIds = await getSampleShowtimesWithAvailableSeats({ seatQuantity: requiredSeatQuant, sampleSize: 2 });
            test.skip(sampleShowtimeIds.length === 0, 'Test skipped: No showtimes with available seats found.');
        });

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Go to booking page of showtime ${showtime} and wait for seat map`, async () => {
                showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);
            });

            await test.step(`Verify available seats are selectable for showtime: ${showtime}`, async () => {
                // Pick random available seats to test (from api data)
                const availableSeats = await getAvailableSeats(showtime);
                const seatsToTest = pickSampleItems(shuffleItems(availableSeats));

                // Select seats
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

        test('Standard and VIP seats can be combined in selection', async ({ page }) => {

            await test.step(`Find sample showtimes with mixed seat types available to run test`, async () => {
                sampleShowtimeIds = await getSampleShowtimesWithAvailableMixedSeats({ seatQuantity: requiredSeatQuant, sampleSize: 2 });
                test.skip(sampleShowtimeIds.length === 0, 'Test skipped: No showtimes with mixed seat types found.');
            });

            for (const showtime of sampleShowtimeIds) {

                await test.step(`Go to booking page of showtime ${showtime} and wait for seat map`, async () => {
                    showtimePage = new ShowtimePage(page);
                    await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);
                });

                await test.step(`Verify VIP and standard seats can be selected in combination`, async () => {

                    // Get available standard and VIP seats (api data)
                    const standardSeats = await getAvailableStandardSeats(showtime);
                    const vipSeats = await getAvailableVipSeats(showtime);

                    // Pick sample seats from both types
                    const standardSeatsToSelect = pickSampleItems(shuffleItems(standardSeats));
                    const vipSeatsToSelect = pickSampleItems(shuffleItems(vipSeats));
                    const mixedSeats = [...standardSeatsToSelect, ...vipSeatsToSelect];

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