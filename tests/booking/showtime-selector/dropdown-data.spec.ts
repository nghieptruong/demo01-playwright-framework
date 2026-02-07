import { getCinemaBranchesShowingMovie, getShowtimeIdsByMovieIdBranchId } from "../../../api/cinemas/helpers";
import { getMovies } from "../../../api/movies/movies.api";
import { Movie } from "../../../api/shared.types";
import { expect, test } from "../../../fixtures/custom-fixtures";
import { DropdownOptionInfo } from "../../../pages/components/ChainedDropdownsHome";

test.describe('Verify Dropdown Filters Data Accuracy: UI vs API', () => {

    test.beforeEach(async ({ homePage }) => {
        await test.step(`Navigate to Homepage and wait for dropdowns to load`, async () => {
            await homePage.navigateToHomePageAndWait();
            await homePage.showtimeSelector.waitForMovieOptionsLoaded();
        });
    });

    test('Movie Dropdown Loads Correct Data', async ({ homePage }) => {

        let uiMovies: DropdownOptionInfo[];
        let apiMovies: Movie[];

        await test.step(`Get UI movie list and fetch Api movie list`, async () => {
            uiMovies = await homePage.showtimeSelector.getMovieOptionsInfo();
            apiMovies = await getMovies();
        });

        await test.step(`Verify UI displays same movies as in api data`, async () => {
           
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

    test('Cinema Dropdown Loads Correct Data', async ({ homePage }) => {

        test.setTimeout(120000); // Extend timeout due to multiple api calls in loop
        let movieIds: string[];

        await test.step(`Get movie list to iterate`, async () => {
            const movies = await getMovies();
            // skip if no movie found in database
            test.skip(movies.length === 0, 'No movie found in database. Cannot continue test.');
            movieIds = movies.map(m => m.maPhim.toString());
        });

        await test.step(`Verify cinema branch options for each movie`, async () => {

            for (const movieId of movieIds) {
                await homePage.reloadPage();
                await homePage.showtimeSelector.waitForMovieOptionsLoaded();
        
                // Select movie to load cinema branch options 
                await homePage.showtimeSelector.selectMovieById(movieId);
        
                // Get ui-displayed and api cinema branch ids for this movie
                const uiCinemas = await homePage.showtimeSelector.getBranchOptionsInfo();   
                const apiCinemas = await getCinemaBranchesShowingMovie(movieId);

                // skip comparison if both have no cinema branches data
                if (apiCinemas.length === 0 && uiCinemas.length === 0) {
                    console.warn(`No cinema branches found in both api and ui for this movie: ${movieId}`);
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

    test('Showtime Dropdown Loads Correct Data', async ({ homePage }) => {

        test.setTimeout(200000); // Extend timeout due to multiple api calls in loop
        let movieIds: string[];

        await test.step(`Get movie list to iterate`, async () => {
            const movies = await getMovies();
            // skip if no movie found in database
            test.skip(movies.length === 0, 'No movie found in database. Cannot continue test.');
            movieIds = movies.map(m => m.maPhim.toString());
        });

        await test.step(`Iterate through each movie and branch combination and verify showtime options`, async () => {

            for (const movieId of movieIds) {
               
                // Get cinema branches for this movie from database
                const apiCinemaBranches = await getCinemaBranchesShowingMovie(movieId);
                const cinemaBranchIds = apiCinemaBranches.map(c => c.maCumRap);
                
                // Skip if no option available
                if (apiCinemaBranches.length === 0) {
                    console.warn(`No cinema branches available this movie: ${movieId}. Skip to next movie.`);
                    continue;
                }

                // For each movie and branch combination, select and verify showtimes
                for (const cinemaId of cinemaBranchIds) {
                    await homePage.reloadPage();
                    await homePage.showtimeSelector.waitForMovieOptionsLoaded();

                    // Select movie & cinema branch
                    await homePage.showtimeSelector.selectMovieById(movieId);
                    await homePage.showtimeSelector.selectCinemaBranchById(cinemaId);

                    // Get showtime options from ui and api to compare
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