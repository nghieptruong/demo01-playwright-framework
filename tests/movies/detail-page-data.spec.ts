import { getMovieSchedule } from "../../api/cinemas/cinemas.api";
import { getBranchNamesByMovieAndCinema, getCinemaSysNameShowingMovie, getMovieShowingDurationInMinutes, getShowtimeIdsByMovieIdBranchId, matchBranchNameAndId } from "../../api/cinemas/helpers";
import { getMovieScreenings } from "../../api/movies/movies.api";
import { getAllMovieIds } from "../../api/movies/movies.helpers";
import { expect, test } from "../../fixtures/custom-fixtures";
import { MoviePage } from "../../pages/MoviePage";
import { pickSampleItems, shuffleItems } from "../utils/dataManipulation.helpers";

let moviePage: MoviePage;
let sampleMovies: string[];

test.describe('Movie Detail Page Data Verification', () => {

    test.beforeEach(async ({ page }) => {
        moviePage = new MoviePage(page);

        // Pick sample movies to run test
        const movieIds = await getAllMovieIds();
        sampleMovies = pickSampleItems(shuffleItems(movieIds));
    });

    test('Verify Movie Details', async () => {

        for (const movieId of sampleMovies) {

            const showtimes = await getMovieSchedule(movieId);

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

            const apiMovieScreenings = await getMovieScreenings(movieId);
            const apiDuration = await getMovieShowingDurationInMinutes(movieId);

            expect.soft(uiTitle,
                `Movie title mismatch for movie id ${movieId}`
            ).toBe(apiMovieScreenings.tenPhim);

            expect.soft(uiDuration,
                `Movie duration mismatch for movie id ${movieId}`
            ).toBe(apiDuration);

            expect.soft(uiRating,
                `Movie rating mismatch for movie id ${movieId}`
            ).toBe(apiMovieScreenings.danhGia);

        }
    });

    test('Verify Movie Showtimes Details In Vertical Tabs', async () => {

        for (const movieId of sampleMovies) {

            // Go to movie detail page and wait for showtime tabs loaded
            await moviePage.navigateToMoviePageAndWait(movieId);
            await moviePage.waitForShowtimeTabsLoaded();

            // Get available cinemas and sort
            const uiCinemaNames = await moviePage.movieShowtimesTabs.getAllCinemaNames();
            const apiCinemaNames = await getCinemaSysNameShowingMovie(movieId);

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
                const apiBranches = await getBranchNamesByMovieAndCinema(movieId, cinemaName);

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








