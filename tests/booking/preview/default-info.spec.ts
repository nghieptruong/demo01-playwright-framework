import { extractShowtimeInfo } from "../../../api/showtimes/showtimes.helpers";
import { ShowtimeInfo } from "../../../api/showtimes/showtimes.types";
import { expect, test } from "../../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../../pages/ShowtimePage";
import { getRandomSampleShowtimeIds } from "../../utils/booking.helpers";

let showtimePage: ShowtimePage;
let sampleShowtimeIds: string[];

test.beforeAll(async () => {

    await test.step('Pick random sample showtime to run tests', async () => {
        //no state change, seat availability does not matter
        sampleShowtimeIds = await getRandomSampleShowtimeIds({ sampleSize: 2 });
    });

});

test.beforeEach(async ({ page }) => {
    showtimePage = new ShowtimePage(page);
});

test.describe('Verify Preview Data Accuracy: UI vs API', () => {

    test('Preview displays correct Showtime info', async ({ }) => {

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Navigate to showtime page and verify displayed info for showtime ${showtime}`, async () => {
                await showtimePage.navigateToShowtimePageAndWait(showtime);

                const uiInfo = await showtimePage.getShowtimeInfo();
                const apiInfo = await extractShowtimeInfo(showtime);

                const keysToCompare = Object.keys(uiInfo) as (keyof ShowtimeInfo)[];

                const mismatchedKeys = keysToCompare.filter(key => uiInfo[key] !== apiInfo[key]);

                expect(mismatchedKeys.length,
                    `Showtime ${showtime} mismatched keys: ${mismatchedKeys}`
                ).toEqual(0);
            });

        }
    })
})

test.describe('Default preview seat and price @regression', () => {

    test('Preview default no selected seat and zero price', async ({ }) => {

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Navigate and Verify default empty seats and price preview for showtime ${showtime}`, async () => {
                await showtimePage.navigateToShowtimePageAndWait(showtime);

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

})

