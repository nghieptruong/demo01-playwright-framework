import { fetchMoviesList } from "../../../api/movies/movies.api";
import { getBranchesInfoForMovie, getShowtimeIdsByMovieIdBranchId } from "../../../api/movies/movies.helpers";
import { expect, test } from "../../../fixtures/custom-fixtures";

test.describe('Verify Dropdown Filters Data Accuracy: UI vs API', () => {

    test.beforeEach(async ({ homePage }) => {
        await homePage.navigateToHomePageAndWait();
        await homePage.showtimeSelector.waitForMovieOptionsLoaded();
    });

    test('Movie Dropdown Options Load Correct Data', async ({ homePage }) => {

        const uiMovies = await homePage.showtimeSelector.getMovieOptionsInfo();
        const apiMovies = await fetchMoviesList();

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
    })

    test('Cinema Dropdown Options Load Correct Data', async ({ homePage }) => {

        const uiMovies = await homePage.showtimeSelector.getMovieOptionsInfo();

        if (uiMovies.length === 0) {
            console.warn('No movie found in dropdown. Cannot continue test.');
            return;
        }
        const uiMovieIds = uiMovies.map(m => m.id);

        for (const movieId of uiMovieIds) {

            // Select movie to load cinema branch options 
            await homePage.showtimeSelector.selectMovieById(movieId);

            // Get ui-displayed and api cinema branch ids for this movie
            const uiCinemas = await homePage.showtimeSelector.getBranchOptionsInfo();
            const apiCinemas = await getBranchesInfoForMovie(movieId);

            // skip comparison if both have no screenings data
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
    })

    test('Screening Dropdown Options Load Correct Data', async ({ homePage }) => {

        const uiMovies = await homePage.showtimeSelector.getMovieOptionsInfo();
        const uiMovieIds = uiMovies.map(m => m.id);

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

            // For each branch, select and verify screenings
            for (const cinemaId of uiCinemaIds) {

                await homePage.showtimeSelector.selectCinemaBranchById(cinemaId);

                const uiShowtimes = await homePage.showtimeSelector.getShowtimeOptionsInfo();
                const apiShowtimeIds = await getShowtimeIdsByMovieIdBranchId(movieId, cinemaId);

                if (apiShowtimeIds.length === 0 && uiShowtimes.length === 0) {
                    console.warn(`No screening found in both api and ui for this movie ${movieId} at cinema ${cinemaId}`);
                    continue;
                }

                const [apiScreeningIds, uiScreeningIds] = await Promise.all([
                    apiShowtimeIds.sort(),
                    uiShowtimes.map(ui => ui.id).sort()
                ]);

                expect(uiScreeningIds).toEqual(apiScreeningIds);
            }
        }
    })
})