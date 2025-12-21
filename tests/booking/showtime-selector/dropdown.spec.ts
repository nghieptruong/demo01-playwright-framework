import { extractShowtimeIdsForAllMovies, findMovieIdByShowtimeId } from "../../../api/movies/movies.helpers";
import { fetchShowtimeDetailsByShowtimeId } from "../../../api/showtimes/showtimes.api";
import { expect, test } from "../../../fixtures/custom-fixtures";
import { pickRandomItem } from "../../utils/shared.helpers";

test.beforeEach(async ({ homePage }) => {
    await homePage.navigateToHomePageAndWait();
    await homePage.showtimeSelector.waitForMovieOptionsLoaded();
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

        // Pick a random showtime first to make sure filters wont return empty showtime
        const sampleShowtimeId = pickRandomItem(await extractShowtimeIdsForAllMovies());
        const showtimeInfo = await fetchShowtimeDetailsByShowtimeId(sampleShowtimeId);

        // Get movieId and cinema branch name from showtime info to select in filters
        const movieId = await findMovieIdByShowtimeId(sampleShowtimeId);
        const cinemaBranchName = showtimeInfo.thongTinPhim.tenCumRap;

        // Select each filter
        await homePage.showtimeSelector.selectMovieById(movieId);
        await homePage.showtimeSelector.selectCinemaBranchByName(cinemaBranchName);
        await homePage.showtimeSelector.selectShowtimeById(sampleShowtimeId);

        // Click button to search for tickets
        await homePage.showtimeSelector.clickFindTicketsButton();

        // Verify navigation to correct showtime page
        await homePage.verifyNavigationToShowtimePage(sampleShowtimeId);
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

