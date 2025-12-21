import { extractSeatingData, getAvailableStandardSeats, getAvailableVipSeats, getReservedSeats } from "../../../api/showtimes/showtimes.helpers";
import { expect, test } from "../../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../../pages/ShowtimePage";
import { getRandomSampleShowtimeIds, getSampleShowtimesWithAvailableStandardSeats, getSampleShowtimesWithAvailableVipSeats, getSampleShowtimesWithReservedSeats } from "../../utils/booking.helpers";
import { pickSampleItems, shuffleItems } from "../../utils/shared.helpers";

test.describe('Seat Map Data Accuracy: UI vs API', () => {

    test('Total seat count', async ({ page }) => {

        let sampleShowtimeIds: string[] = [];

        await test.step(`Pick random sample showtimes`, async () => {

            sampleShowtimeIds = await getRandomSampleShowtimeIds({ sampleSize: 2 });

            test.skip(sampleShowtimeIds.length === 0, 'Test skipped: No showtimes found.');
        })

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Verify total seat count for showtime: ${showtime}`, async () => {

                // Go to showtime page
                const showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWait(showtime);

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

        let sampleShowtimeIds: string[] = [];

        await test.step(`Find sample showtimes with reserved seats`, async () => {

            const sampleShowtimes = await getSampleShowtimesWithReservedSeats({ sampleSize: 2 });

            test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with reserved seats found.');

            sampleShowtimeIds = sampleShowtimes.map(s => s.maLichChieu.toString());
        })

        for (const showtime of sampleShowtimeIds) {
            await test.step(`Verify reserved seat count and sample seats state for showtime: ${showtime}`, async () => {

                // Go to showtime page
                const showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWait(showtime);

                // Assertion 1: Verify reserved seat count
                const uiReservedSeats = await showtimePage.countReservedSeats();
                const apiReservedSeatNums = await getReservedSeats(showtime);

                expect(uiReservedSeats,
                    `Count mismatch. Expected ${apiReservedSeatNums.length} but received ${uiReservedSeats} reserved seats.`
                ).toEqual(apiReservedSeatNums.length);

                // Assertion 2: Verify sample reserved seats are not selectable on UI
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

        let sampleShowtimeIds: string[] = [];

        await test.step(`Find sample showtimes with available standard seats`, async () => {

            const sampleShowtimes = await getSampleShowtimesWithAvailableStandardSeats({ sampleSize: 2 });

            test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with availale Standard seats found.');

            sampleShowtimeIds = sampleShowtimes.map(s => s.maLichChieu.toString());
        })

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Verify UI standard seat numbers match Api for showtime: ${showtime}`, async () => {

                // Go to showtime page
                const showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWait(showtime);

                const [uiStandard, apiStandard] = await Promise.all([
                    showtimePage.getAvailableStandardSeatNumbers(),
                    getAvailableStandardSeats(showtime)
                ]);

                expect(uiStandard.sort()).toEqual(apiStandard.sort());
            });
        }
    });

    test('VIP seat numbers', async ({ page }) => {

        let sampleShowtimeIds: string[] = [];

        await test.step(`Find sample showtimes with available VIP seats`, async () => {

            const sampleShowtimes = await getSampleShowtimesWithAvailableVipSeats({ sampleSize: 2 });
            test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with availale Vip seats found.');

            sampleShowtimeIds = sampleShowtimes.map(s => s.maLichChieu.toString());
        });

        for (const showtime of sampleShowtimeIds) {

            await test.step(`Verify UI standard seat numbers match Api for showtime: ${showtime}`, async () => {

                // Go to showtime page
                const showtimePage = new ShowtimePage(page);
                await showtimePage.navigateToShowtimePageAndWait(showtime);

                const [uiVip, apiVip] = await Promise.all([
                    showtimePage.getAvailableVipSeatNumbers(),
                    getAvailableVipSeats(showtime)
                ]);

                expect(uiVip.sort()).toEqual(apiVip.sort());
            })
        }
    });

})
