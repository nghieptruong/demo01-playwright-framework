import { getShowtimeBookingData } from "../../../api/booking/booking.api";
import { findMovieTitleByShowtimeId } from "../../../api/booking/booking.helpers";
import { getMovie } from "../../../api/movies/movies.api";
import { expect, test } from "../../../fixtures/custom-fixtures";
import { pickRandomItem } from "../../utils/dataManipulation.helpers";
import { getShowtimeIdsForAllMovies } from "../../../api/cinemas/helpers";

test.beforeEach(async ({ homePage }) => {
    await test.step(`Navigate to Homepage and wait for dropdowns to load`, async () => {
        await homePage.navigateToHomePageAndWait();
        await homePage.showtimeSelector.waitForMovieOptionsLoaded();
    });
});

test.describe('No default selection', () => {

    test('Filters are not pre-selected', async ({ homePage }) => {

        await expect(
            homePage.showtimeSelector.selMovieDropdown,
            'Movie filter should not be pre-selected'
        ).toHaveValue('');

        await expect(
            homePage.showtimeSelector.selCinemaBranchDropdown,
            'Cinema filter should not be pre-selected'
        ).toHaveValue('');

        await expect(
            homePage.showtimeSelector.selShowtimeDropdown,
            'Showtime filter should not be pre-selected'
        ).toHaveValue('');

    })
})

test.describe('Valid Ticket Search With Filters', () => {

    test('Valid Ticket Search With Complete Filters @smoke @regression', async ({ homePage }) => {

        let movieId: string;
        let cinemaBranchName: string;
        let sampleShowtimeId: string;

        await test.step(`Find a valid movie, cinema branch, and showtime filter to run test`, async () => {
            // Pick a random showtime first to make sure filters wont return empty showtime
            sampleShowtimeId = pickRandomItem(await getShowtimeIdsForAllMovies());
            const showtimeInfo = await getShowtimeBookingData(sampleShowtimeId);

            // Get movieId and cinema branch name from showtime info to select in filters
            const movieTitle = await findMovieTitleByShowtimeId(sampleShowtimeId);
            movieId = (await getMovie(movieTitle)).maPhim.toString();
            cinemaBranchName = showtimeInfo.thongTinPhim.tenCumRap;
        });

        await test.step(`Apply filters and click Find ticket button`, async () => {
            await homePage.showtimeSelector.selectMovieById(movieId);
            await homePage.showtimeSelector.selectCinemaBranchByName(cinemaBranchName);
            await homePage.showtimeSelector.selectShowtimeById(sampleShowtimeId);
            await homePage.showtimeSelector.clickFindTicketsButton();
        });

        await test.step(`Verify navigation to correct showtime page`, async () => {
            await homePage.verifyNavigationToShowtimePage(sampleShowtimeId);
        });
    })
})

test.describe('Invalid Ticket Search Triggers Alert', async () => {

    test('Incomplete Movie Selection Alert', async ({ homePage }) => {
        await homePage.showtimeSelector.triggerNoMovieSelectedAlert();
        await homePage.showtimeSelector.verifyAndCloseMissingFilterAlert();
        await homePage.verifyNoNavigation();
    });

    test('Incomplete Cinema Selection Alert', async ({ homePage }) => {
        await homePage.showtimeSelector.triggerNoCinemaSelectedAlert();
        await homePage.showtimeSelector.verifyAndCloseMissingFilterAlert();
        await homePage.verifyNoNavigation();
    });

    test('Incomplete Showtime Selection Alert', async ({ homePage }) => {
        await homePage.showtimeSelector.triggerNoShowtimeSelectedAlert();
        await homePage.showtimeSelector.verifyAndCloseMissingFilterAlert();
        await homePage.verifyNoNavigation();
    });
})