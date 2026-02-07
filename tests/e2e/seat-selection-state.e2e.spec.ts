
import { BookingData } from "../../api/booking/booking.types";
import { findMovieIdByShowtimeId } from "../../api/cinemas/helpers";
import { expect, test } from "../../fixtures/custom-fixtures";
import { ShowtimePage } from "../../pages/ShowtimePage";
import { getSampleShowtimesWithAvailableSeats } from "../utils/bookingSampleProvider";
import { pickRandomNumberBetween } from "../utils/dataManipulation.helpers";
import { getShowtimeBookingData } from "../../api/booking/booking.api";

test.describe('E2E: Seat Selection State Isolation', () => {

    test('Seat selection is cleared when switching to another showtime', async ({ page, homePage }) => {
        let showtimePage: ShowtimePage;

        let showtimeIdA: string;
        let showtimeIdB: string;

        let showtimeAData: BookingData;
        let showtimeBData: BookingData;

        let movieIdA: string;
        let movieIdB: string;

        let selectedSeats: string[];

        await test.step('Find 2 sample showtimes with available seats to run test', async () => {
            showtimePage = new ShowtimePage(page);
            const numSeatsRequired = pickRandomNumberBetween(1, 8);

            const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({ seatQuantity: numSeatsRequired, sampleSize: 2 });
            test.skip(sampleShowtimes.length !== 2, 'Test skipped: No 2 showtimes with available seats found.');

            showtimeIdA = sampleShowtimes[0];
            showtimeIdB = sampleShowtimes[1];

            showtimeAData = await getShowtimeBookingData(showtimeIdA);
            showtimeBData = await getShowtimeBookingData(showtimeIdB);

            movieIdA = await findMovieIdByShowtimeId(showtimeIdA);
            movieIdB = await findMovieIdByShowtimeId(showtimeIdB);
        });

        await test.step('Go to Homepage and Wait for dropdowns to load', async () => {
            await homePage.navigateToHomePageAndWait();
            await homePage.showtimeSelector.waitForMovieOptionsLoaded();
        });

        await test.step('Apply filters to find and select the wanted showtime', async () => {
            // Apply each filter dropdown to select the showtime
            await homePage.showtimeSelector.selectMovieById(movieIdA);
            await homePage.showtimeSelector.selectCinemaBranchByName(showtimeAData.thongTinPhim.tenCumRap);
            await homePage.showtimeSelector.selectShowtimeById(showtimeIdA);
        });

        await test.step(`Confirm selection to navigate to first showtime and select seats`, async () => {
            await homePage.showtimeSelector.clickFindTicketsButton();

            showtimePage = new ShowtimePage(page);
            await showtimePage.waitForSeatMapAndPreview();
            selectedSeats = await showtimePage.selectAvailableSeatsPreferConsecutive();
        });

        await test.step(`Navigate back to Homepage and apply filters to select another showtime`, async () => {
            await showtimePage.navigateBack();
            await homePage.showtimeSelector.waitForMovieOptionsLoaded();

            await homePage.showtimeSelector.selectMovieById(movieIdB);
            await homePage.showtimeSelector.selectCinemaBranchByName(showtimeBData.thongTinPhim.tenCumRap);
            await homePage.showtimeSelector.selectShowtimeById(showtimeIdB);
        });

        await test.step(`Confirm selection to navigate to second showtime and verify default empty selection`, async () => {
            await homePage.showtimeSelector.clickFindTicketsButton();
            await showtimePage.waitForSeatMapAndPreview();

            const previewSeats = await showtimePage.getPreviewSelectedSeats();

            // Assertion: Default empty selection & No seats remain selected from previous showtime
            expect.soft(previewSeats.length, `Default selection should be empty`).toBe(0);

            expect(previewSeats,
                `Selected seats from previous showtime ${showtimeIdA} are still present: ${selectedSeats}`
            ).not.toEqual(expect.arrayContaining(selectedSeats));

        });

    });

    test('Seat selection is cleared when navigating away and back', async ({ page, homePage }) => {
        let showtimePage: ShowtimePage;

        let showtimeData: BookingData;
        let showtimeId: string;
        let movieId: string;

        let selectedSeats: string[];

        await test.step('Pre-test Prep: Find showtime with available seats', async () => {

            const availableShowtimes = await getSampleShowtimesWithAvailableSeats({
                // request at least 8 seats to minimize chance of sold-out during test
                seatQuantity: 8,
                sampleSize: 1
            });

            test.skip(availableShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');

            showtimeId = availableShowtimes[0];
            showtimeData = await getShowtimeBookingData(showtimeId);

            movieId = await findMovieIdByShowtimeId(showtimeId);
        });

        await test.step('Go to Homepagenand Wait for dropdowns seletor to load', async () => {
            await homePage.navigateToHomePageAndWait();
            await homePage.showtimeSelector.waitForMovieOptionsLoaded();
        });

        await test.step('Apply filters to find and select the wanted showtime', async () => {
            // Apply each filter dropdown to select the showtime
            await homePage.showtimeSelector.selectMovieById(movieId);
            await homePage.showtimeSelector.selectCinemaBranchByName(showtimeData.thongTinPhim.tenCumRap);
            await homePage.showtimeSelector.selectShowtimeById(showtimeId);
        });

        await test.step(`Confirm selection to navigate to showtime page and select seats`, async () => {
            await homePage.showtimeSelector.clickFindTicketsButton();

            showtimePage = new ShowtimePage(page);
            await showtimePage.waitForSeatMapAndPreview();

            selectedSeats = await showtimePage.selectAvailableSeatsPreferConsecutive();
        });

        await test.step(`Navigate back to Homepage and apply filters to the same showtime again`, async () => {
            await showtimePage.navigateBack();
            await homePage.showtimeSelector.waitForMovieOptionsLoaded();

            await homePage.showtimeSelector.selectMovieById(movieId);
            await homePage.showtimeSelector.selectCinemaBranchByName(showtimeData.thongTinPhim.tenCumRap);
            await homePage.showtimeSelector.selectShowtimeById(showtimeId);
        });

        await test.step(`Confirm selection to navigate to showtime page and verify selection reset`, async () => {
            await homePage.showtimeSelector.clickFindTicketsButton();
            await showtimePage.waitForSeatMapAndPreview();

            const previewSeats = await showtimePage.getPreviewSelectedSeats();

            // Assertion: Default empty selection & No seats remain selected from previous showtime
            expect.soft(previewSeats.length, `Default selection should be empty`).toBe(0);

            expect(previewSeats,
                `Previously selected seats in showtime ${showtimeId} are still present: ${selectedSeats}`
            ).not.toEqual(expect.arrayContaining(selectedSeats));

        });
    });

})

