import { extractShowtimeInfo } from "../../../api/booking/booking.helpers";
import { ShowtimeInfo } from "../../../api/booking/booking.types";
import { expect, test } from "../../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../../pages/ShowtimePage";
import { getRandomSampleShowtimeIds } from "../../utils/bookingSampleProvider";

test.describe('Verify Preview Data Accuracy: UI vs API', () => {

    let showtimePage: ShowtimePage;
    let sampleShowtimeIds: string[];

    test.beforeEach(async () => {
        await test.step('Pick random sample showtime to run tests', async () => {
            //no state change, seat availability does not matter
            sampleShowtimeIds = await getRandomSampleShowtimeIds({ sampleSize: 1 });
        });
    });

    test('Preview displays correct Showtime info', async ({ page }) => {

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Navigate to booking page for showtime ${showtime}`, async () => {
                showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);
            });

            await test.step(`Verify displayed showtime details match api data`, async () => {
                const uiInfo = await showtimePage.getShowtimeInfo();
                const apiInfo = await extractShowtimeInfo(showtime);

                const keysToCompare = Object.keys(uiInfo) as (keyof ShowtimeInfo)[];
                const mismatchedKeys = keysToCompare.filter(key => uiInfo[key] !== apiInfo[key]);

                expect(mismatchedKeys.length,
                    `Showtime ${showtime} mismatched keys: ${mismatchedKeys}`
                ).toEqual(0);
            });

        }
    });

    test('Preview displays no selected seat and zero price by default', async ({ page }) => {

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Navigate to booking page for showtime ${showtime}`, async () => {
                showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);
            });

            await test.step(`Verify default preview displays no selected seat and zero price`, async () => {
                const previewSeats = await showtimePage.getPreviewSelectedSeats();
                const previewPrice = await showtimePage.getPreviewPrice();

                expect.soft(previewSeats.length,
                    `Seats are pre-selected: ${previewSeats}`
                ).toEqual(0);

                expect(previewPrice,
                    `Expect default price to be 0. But received: ${previewPrice}`
                ).toEqual(0);
            });
        }
    });
});