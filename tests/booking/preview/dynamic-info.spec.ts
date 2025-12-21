import { calculatePrice, getAvailableSeats } from "../../../api/showtimes/showtimes.helpers";
import { expect, test } from "../../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../../pages/ShowtimePage";
import { getRandomSeatNumbersPreferConsecutive, getSampleShowtimesWithAvailableSeats } from "../../utils/booking.helpers";
import { pickRandomNumberBetween } from "../../utils/shared.helpers";

let showtimePage: ShowtimePage;
let requiredSeatsMin: number;

test.beforeEach(async ({ page }) => {
    showtimePage = new ShowtimePage(page);
    requiredSeatsMin = pickRandomNumberBetween(1, 8);
});

test.describe('Seat Preview Dynamic Behavior', () => {

    test('Selecting and Unselecting seats updates seat preview @regression', async ({ }) => {

        // Pick sample eligible showtimes to test
        const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: requiredSeatsMin });
        const sampleShowtimeIds = sampleShowtimes.map(s => s.maLichChieu.toString());

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Verify seat preview for showtime ${showtime}`, async () => {
                // Go to showtime page
                await showtimePage.navigateToShowtimePageAndWait(showtime);

                // Pick random available seats (default 2)
                const availableSeats = await getAvailableSeats(showtime);
                const seatsToBook = getRandomSeatNumbersPreferConsecutive(availableSeats);

                // Verify initial preview does not show these seats
                const previewSeats = await showtimePage.getPreviewSelectedSeats();

                for (const seat of seatsToBook) {
                    expect(previewSeats).not.toContain(seat);
                }

                // Select seats & Verify that preview now shows these seats
                await showtimePage.selectNonSelectedSeats(seatsToBook);

                await expect.poll(() => showtimePage.getPreviewSelectedSeats(), {
                    message: `Preview did not update correctly. Selected seats: ${seatsToBook}.`,
                }).toEqual(expect.arrayContaining(seatsToBook));

                // Unselect seats & Verify they are removed from preview
                await showtimePage.unselectSelectedSeats(seatsToBook);

                await expect.poll(() => showtimePage.getPreviewSelectedSeats(), {
                    message: `Preview did not update correctly. Selected seats: ${seatsToBook}.`,
                }).not.toEqual(expect.arrayContaining(seatsToBook));
            });
        }
    })
})

test.describe('Price Preview Dynamic Behavior', () => {

    test('Selecting and Unselecting seats updates price preview @regression', async ({ }) => {

        const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: requiredSeatsMin });
        const sampleShowtimeIds = sampleShowtimes.map(s => s.maLichChieu.toString());

        for (const showtime of sampleShowtimeIds) {

            // Go to showtime page
            await showtimePage.navigateToShowtimePageAndWait(showtime);

            // Pick random available seats (3 seats)
            const availableSeats = await getAvailableSeats(showtime);
            const seatsToBook = getRandomSeatNumbersPreferConsecutive(availableSeats, 3); // check

            // Get initial price info
            const initialPrice = await showtimePage.getPreviewPrice();

            // Calculate additional cost
            const additionalCost = await calculatePrice(showtime, seatsToBook);
            const expectedHigherPrice = initialPrice + additionalCost;

            // Select seats & Verify that price is correctly added 
            await showtimePage.selectNonSelectedSeats(seatsToBook);

            const softExpect = expect.configure({ soft: true });
            await softExpect.poll(async () => showtimePage.getPreviewPrice(), {
                message: `Price did not update correctly after selecting seats. Expected price: ${expectedHigherPrice}`,
            }).toEqual(expectedHigherPrice);

            // Capture updated price as new baseline to test unselect action 
            const postAddPrice = await showtimePage.getPreviewPrice();

            // Pick random seats to unselect (default 2, but not more than selected)
            const seatsToRemove = getRandomSeatNumbersPreferConsecutive(seatsToBook);

            const reducedCost = await calculatePrice(showtime, seatsToRemove);
            const expectedLowerPrice = postAddPrice - reducedCost;

            await showtimePage.unselectSelectedSeats(seatsToRemove);

            await expect.poll(() => showtimePage.getPreviewPrice(), {
                message: `Price did not update correctly after unselecting seats. Expected price: ${expectedLowerPrice}`,
            }).toEqual(expectedLowerPrice);
        }
    })
})
