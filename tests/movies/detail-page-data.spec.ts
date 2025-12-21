
import { matchBranchNameAndId } from "../../api/cinemas/cinemas.helpers";
import { fetchShowtimesByMovieId } from "../../api/movies/movies.api";
import { filterMoviesWithAvailableShowtimes, getBranchNamesForMovieBycinema, getCinemaNamesForMovie, getMovieDurationMinById, getMovieInfoById, getShowtimeIdsByMovieIdBranchId } from "../../api/movies/movies.helpers";
import { expect, test } from "../../fixtures/custom-fixtures";
import { MoviePage } from "../../pages/MoviePage";
import { pickSampleItems, shuffleItems } from "../utils/shared.helpers";

let moviePage: MoviePage;
let sampleMovies: string[];

test.describe('Movie Detail Page Data Verification', () => {

    test.beforeEach(async ({ page }) => {
        moviePage = new MoviePage(page);

        const movieIds = await filterMoviesWithAvailableShowtimes();
        sampleMovies = pickSampleItems(shuffleItems(movieIds));

    });

    test('Verify Movie Details', async () => {

        for (const movieId of sampleMovies) {

            const showtimes = await fetchShowtimesByMovieId(movieId);

            if (showtimes.length === 0) {
                console.warn(`No showtimes found for movie id ${movieId}, no movie detail page to verify.`);
                continue;
            }

            // Go to movie detail page
            await moviePage.navigateToMoviePageAndWait(movieId);

            // Get movie from ui vs api and compare
            const uiTitle = await moviePage.getMovieTitle();
            const uiDuration = await moviePage.getMovieDurationMinutes();
            const uiRating = await moviePage.getMovieRating();

            const apiMovieData = await getMovieInfoById(movieId);
            const apiDuration = await getMovieDurationMinById(movieId);

            expect.soft(uiTitle,
                `Movie title mismatch for movie id ${movieId}`
            ).toBe(apiMovieData.tenPhim);

            expect.soft(uiDuration,
                `Movie duration mismatch for movie id ${movieId}`
            ).toBe(apiDuration);

            expect.soft(uiRating,
                `Movie rating mismatch for movie id ${movieId}`
            ).toBe(apiMovieData.danhGia);

        }
    });

    test('Verify Movie Showtimes Details', async () => {

        for (const movieId of sampleMovies) {

            // Go to movie detail page and wait for showtime tabs loaded
            await moviePage.navigateToMoviePageAndWait(movieId);
            await moviePage.waitForShowtimeTabsLoaded();

            // Get available cinemas and sort
            const uiCinemaNames = await moviePage.movieShowtimesTabs.getAllCinemaNames();
            const apiCinemaNames = await getCinemaNamesForMovie(movieId);

            const uiCinemasSorted = uiCinemaNames.sort();
            const apiCinemasSorted = apiCinemaNames.sort();

            // Assertion 1: UI available cinemas match api data
            expect(uiCinemasSorted,
                `Showtime cinemas mismatch for movie id ${movieId}`
            ).toEqual(apiCinemasSorted);

            // Select each cinema tab and verify branches and showtimes
            for (const cinemaName of uiCinemaNames) {

                await moviePage.movieShowtimesTabs.selectCinemaTabByName(cinemaName);

                // Get branch and showtimes data from UI & Get api data
                const uiBranchShowtimesMap = await moviePage.movieShowtimesTabs.getShowtimesGroupedByBranch();

                const uiBranchNames = Object.keys(uiBranchShowtimesMap);
                const apiBranches = await getBranchNamesForMovieBycinema(movieId, cinemaName);

                const uiBranchesSorted = uiBranchNames.sort();
                const apiBranchesSorted = apiBranches.sort();

                // Assertion 2: UI branches match api data
                expect(uiBranchesSorted,
                    `Showtime branches mismatch for movie id ${movieId} at cinema ${cinemaName}`
                ).toEqual(apiBranchesSorted);


                // Assertion 3: UI showtimes match api data for each branch
                for (const branchName of uiBranchNames) {

                    const uiShowtimes = uiBranchShowtimesMap[branchName];

                    const branchId = await matchBranchNameAndId(branchName);
                    const apiShowtimes = await getShowtimeIdsByMovieIdBranchId(movieId, branchId);

                    const uiShowtimesSorted = uiShowtimes.sort();
                    const apiShowtimesSorted = apiShowtimes.sort();

                    expect(uiShowtimesSorted,
                        `Showtimes mismatch for movie id ${movieId} at cinema ${cinemaName}, branch ${branchName}`
                    ).toEqual(apiShowtimesSorted);
                }
            }
        }

    });
});








