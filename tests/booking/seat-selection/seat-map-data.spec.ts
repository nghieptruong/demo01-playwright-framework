import { extractSeatingData, getAvailableStandardSeats, getAvailableVipSeats, getReservedSeats } from "../../../api/booking/booking.helpers";
import { expect, test } from "../../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../../pages/ShowtimePage";
import { getRandomSampleShowtimeIds, getSampleShowtimesWithAvailableStandardSeats, getSampleShowtimesWithAvailableVipSeats, getSampleShowtimesWithReservedSeats } from "../../utils/bookingSampleProvider";
import { pickSampleItems, shuffleItems } from "../../utils/dataManipulation.helpers";

test.describe('Seat Map Data Accuracy: UI vs API', () => {

    test('Total seat count', async ({ page }) => {

        let sampleShowtimeIds: string[] = [];

        await test.step(`Pick random sample showtimes to run tests`, async () => {
            sampleShowtimeIds = await getRandomSampleShowtimeIds({ sampleSize: 1 });
            test.skip(sampleShowtimeIds.length === 0, 'Test skipped: No showtimes found.');
        })

        for (const showtime of sampleShowtimeIds) {
            await test.step(`Verify total seat count for showtime: ${showtime}`, async () => {
                // Go to showtime page
                const showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);

                // Get and compare ui vs api total seat count
                const uiCount = await showtimePage.countTotalSeats();
                const apiCount = (await extractSeatingData(showtime)).length;

                expect(uiCount,
                    `Count mismatch. Expected ${apiCount} but received ${uiCount} seats.`
                ).toEqual(apiCount);
            });
        }
    })

    test('Reserved seats count and selectability', async ({ page }) => {

        let showtimePage: ShowtimePage;
        let sampleShowtimeIds: string[] = [];

        await test.step(`Find sample showtimes with reserved seats`, async () => {
            sampleShowtimeIds = await getSampleShowtimesWithReservedSeats({ sampleSize: 1 });
            test.skip(sampleShowtimeIds.length === 0, 'Test skipped: No showtimes with reserved seats found.');
        })

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Go to booking page of showtime ${showtime} and wait for seat map`, async () => {
                showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);
            });

            await test.step(`Verify UI reserved seats match API data`, async () => {
                //  Verify reserved seat count
                const uiReservedSeats = await showtimePage.countReservedSeats();
                const apiReservedSeatNums = await getReservedSeats(showtime);

                expect(uiReservedSeats,
                    `Count mismatch. Expected ${apiReservedSeatNums.length} but received ${uiReservedSeats} reserved seats.`
                ).toEqual(apiReservedSeatNums.length);

                // Assertion 2: Pick sample reserved seats and verify they are not selectable on UI
                const sampleApiSeats = pickSampleItems(shuffleItems(apiReservedSeatNums));

                let foundSeats: string[] = [];
                for (const seatNum of sampleApiSeats) {

                    const seatBtn = showtimePage.getSeatBtnBySeatNumber(seatNum);
                    if (await seatBtn.count() !== 0) {
                        foundSeats.push(seatNum);
                    }
                }
                expect(foundSeats, `Reserved seats but found on page. Seat numbers: ${foundSeats}`).toHaveLength(0);
            });
        }
    })

    test('Standard seat numbers', async ({ page }) => {

        let showtimePage: ShowtimePage;
        let sampleShowtimeIds: string[] = [];

        await test.step(`Find sample showtimes with available standard seats`, async () => {
            sampleShowtimeIds = await getSampleShowtimesWithAvailableStandardSeats({ sampleSize: 1 });
            test.skip(sampleShowtimeIds.length === 0, 'Test skipped: No showtimes with availale Standard seats found.');
        })

        for (const showtime of sampleShowtimeIds) {
            
            await test.step(`Go to booking page of showtime ${showtime} and wait for seat map`, async () => {
                showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);
            });

            await test.step(`Verify UI standard seat numbers match API data`, async () => {
                const [uiStandard, apiStandard] = await Promise.all([
                    showtimePage.getAvailableStandardSeatNumbers(),
                    getAvailableStandardSeats(showtime)
                ]);

                expect(uiStandard.sort()).toEqual(apiStandard.sort());
            });
        }
    });

    test('VIP seat numbers', async ({ page }) => {

        let showtimePage: ShowtimePage;
        let sampleShowtimeIds: string[] = [];

        await test.step(`Find sample showtimes with available VIP seats`, async () => {
            sampleShowtimeIds = await getSampleShowtimesWithAvailableVipSeats({ sampleSize: 2 });
            test.skip(sampleShowtimeIds.length === 0, 'Test skipped: No showtimes with availale Vip seats found.');
        });

        for (const showtime of sampleShowtimeIds) {

             await test.step(`Go to booking page of showtime ${showtime} and wait for seat map`, async () => {
                showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWaitForSeatMap(showtime);
            });

            await test.step(`Verify UI standard seat numbers match API data`, async () => {
                const [uiVip, apiVip] = await Promise.all([
                    showtimePage.getAvailableVipSeatNumbers(),
                    getAvailableVipSeats(showtime)
                ]);

                expect(uiVip.sort()).toEqual(apiVip.sort());
            })
        }
    });

})
