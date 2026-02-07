import { calculatePrice, getAvailableSeats } from "../../../api/booking/booking.helpers";
import { expect, test } from "../../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../../pages/ShowtimePage";
import { getRandomSeatNumbersPreferConsecutive, getSampleShowtimesWithAvailableSeats } from "../../utils/bookingSampleProvider";
import { pickRandomNumberBetween } from "../../utils/dataManipulation.helpers";

let showtimePage: ShowtimePage;
let requiredSeatsMin: number;

test.beforeEach(async ({ page }) => {
    showtimePage = new ShowtimePage(page);
    requiredSeatsMin = pickRandomNumberBetween(1, 8);
});

test.describe('Seat Preview Dynamic Behavior', () => {

    test('Selecting and Unselecting seats updates seat preview @regression', async ({ }) => {

        let sampleShowtimeIds: string[] = [];
        let seatsToBook: string[] = [];

        await test.step(`Find sample showtimes with available seats to run test`, async () => {
            sampleShowtimeIds = await getSampleShowtimesWithAvailableSeats({ seatQuantity: requiredSeatsMin });
        });

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Go to showtime ${showtime} page and pick random available seats to test`, async () => {
                await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);

                // Pick random available seats (default 2)
                const availableSeats = await getAvailableSeats(showtime);
                seatsToBook = getRandomSeatNumbersPreferConsecutive(availableSeats);
            });

            await test.step(`Verify seat preview updates correctly when selecting seats`, async () => {
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

            });

            await test.step(`Verify seat preview updates correctly when deselecting seats`, async () => {
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

        let sampleShowtimeIds: string[] = [];
        let seatsToBook: string[] = [];
        let postAddPrice: number;

        await test.step(`Find sample showtimes with available seats to run test`, async () => {
            sampleShowtimeIds = await getSampleShowtimesWithAvailableSeats({ seatQuantity: requiredSeatsMin });
        });

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Go to showtime ${showtime} page and pick random available seats to test`, async () => {
                await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);

                // Pick random available seats (3 seats)
                const availableSeats = await getAvailableSeats(showtime);
                seatsToBook = getRandomSeatNumbersPreferConsecutive(availableSeats, 3); // check
            });

            await test.step(`Verify price preview updates correctly when selecting seats`, async () => {
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
                postAddPrice = await showtimePage.getPreviewPrice();

            });

            await test.step(`Verify price preview updates correctly when deselecting seats`, async () => {
                // Pick random seats to unselect (default 2, but not more than selected)
                const seatsToRemove = getRandomSeatNumbersPreferConsecutive(seatsToBook);

                const reducedCost = await calculatePrice(showtime, seatsToRemove);
                const expectedLowerPrice = postAddPrice - reducedCost;

                await showtimePage.unselectSelectedSeats(seatsToRemove);

                await expect.poll(() => showtimePage.getPreviewPrice(), {
                    message: `Price did not update correctly after unselecting seats. Expected price: ${expectedLowerPrice}`,
                }).toEqual(expectedLowerPrice);
            });
        }
    })
})
