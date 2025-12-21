import { fetchMoviesList } from "../../../api/movies/movies.api";
import { getBranchesInfoForMovie, getShowtimeIdsByMovieIdBranchId } from "../../../api/movies/movies.helpers";
import { Movie } from "../../../api/movies/movies.types";
import { expect, test } from "../../../fixtures/custom-fixtures";
import { DropdownOptionInfo } from "../../../pages/components/ChainedDropdownsHome";

test.describe('Verify Dropdown Filters Data Accuracy: UI vs API', () => {

    test.beforeEach(async ({ homePage }) => {
        await homePage.navigateToHomePageAndWait();
        await homePage.showtimeSelector.waitForMovieOptionsLoaded();
    });

    test('Movie Dropdown Options Load Correct Data', async ({ homePage }) => {

        let uiMovies: DropdownOptionInfo[];
        let apiMovies: Movie[];

        await test.step(`Get UI movie list and fetch Api movie list`, async () => {
            uiMovies = await homePage.showtimeSelector.getMovieOptionsInfo();
            apiMovies = await fetchMoviesList();
        });

        await test.step(`Verify UI displays same movies as in api data`, async () => {

            // Skip test if no movies are available in both ui and api => Check data issue
            if (uiMovies.length === 0 && apiMovies.length) {
                console.warn('No available movies in both api and ui to check.');
                return;
            }

            const [apiMovieArrays, uiMovieArrays] = await Promise.all([
                apiMovies.map(api => [api.maPhim.toString(), api.tenPhim]).sort(),
                uiMovies.map(ui => [ui.id, ui.textLabel]).sort(),
            ]);

            expect(uiMovieArrays).toEqual(apiMovieArrays);
        });
    })

    test('Cinema Dropdown Options Load Correct Data', async ({ homePage }) => {

        let uiMovieIds: string[];

        await test.step(`Get UI movie list to iterate`, async () => {
            const uiMovies = await homePage.showtimeSelector.getMovieOptionsInfo();

            if (uiMovies.length === 0) {
                console.warn('No movie found in dropdown. Cannot continue test.');
                return;
            }

            uiMovieIds = uiMovies.map(m => m.id);
        });

        await test.step(`Verify cinema branch options for each movie`, async () => {

            for (const movieId of uiMovieIds) {

                // Select movie to load cinema branch options 
                await homePage.showtimeSelector.selectMovieById(movieId);

                // Get ui-displayed and api cinema branch ids for this movie
                const uiCinemas = await homePage.showtimeSelector.getBranchOptionsInfo();
                const apiCinemas = await getBranchesInfoForMovie(movieId);

                // skip comparison if both have no showtimes data
                if (apiCinemas.length === 0 && uiCinemas.length === 0) {
                    console.warn(`No cinema found in both api and ui for this movie: ${movieId}`);
                    continue;
                }

                // Verify ui displays same cinema branches as in api data
                const [apiCinemaArrays, uiCinemaArrays] = await Promise.all([
                    apiCinemas.map(api => [api.maCumRap, api.tenCumRap]).sort(),
                    uiCinemas.map(ui => [ui.id, ui.textLabel]).sort(),
                ]);

                expect(uiCinemaArrays).toEqual(apiCinemaArrays);
            }
        });
    })

    test('Showtime Dropdown Options Load Correct Data', async ({ homePage }) => {

        let uiMovieIds: string[];

        await test.step(`Get UI movie list to iterate`, async () => {
            const uiMovies = await homePage.showtimeSelector.getMovieOptionsInfo();
            uiMovieIds = uiMovies.map(m => m.id);
        });

        await test.step(`Iterate through each cinema and branch combination and verify showtime options`, async () => {

            for (const movieId of uiMovieIds) {
                // Select movie 
                await homePage.showtimeSelector.selectMovieById(movieId);

                // Get cinema branch options
                const uiCinemas = await homePage.showtimeSelector.getBranchOptionsInfo();
                const uiCinemaIds = uiCinemas.map(c => c.id);

                // Skip if no option available
                if (uiCinemaIds.length === 0) {
                    console.warn(`No cinema found in dropdown for this movie: ${movieId}`);
                    continue;
                }

                // For each branch, select and verify showtimes
                for (const cinemaId of uiCinemaIds) {

                    await homePage.showtimeSelector.selectCinemaBranchById(cinemaId);

                    const uiShowtimes = await homePage.showtimeSelector.getShowtimeOptionsInfo();
                    const apiShowtimeIds = await getShowtimeIdsByMovieIdBranchId(movieId, cinemaId);

                    if (apiShowtimeIds.length === 0 && uiShowtimes.length === 0) {
                        console.warn(`No showtime found in both api and ui for this movie ${movieId} at cinema ${cinemaId}`);
                        continue;
                    }

                    const [apiShowtimeIdsSorted, uiShowtimeIdsSorted] = await Promise.all([
                        apiShowtimeIds.sort(),
                        uiShowtimes.map(ui => ui.id).sort()
                    ]);

                    expect(uiShowtimeIdsSorted).toEqual(apiShowtimeIdsSorted);
                }
            }

        });
    })
})