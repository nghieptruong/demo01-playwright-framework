
import { expect, test } from "../../fixtures/custom-fixtures";
import { getMovies } from "../../api/movies/movies.api";

test.describe('Verify Movie Carousel Data Accuracy: UI vs API', () => {

    test.beforeEach(async ({ homePage }) => {
        await homePage.navigateToHomePageAndWait();
        await homePage.featuredMoviesCarousel.waitForCarouselLoaded();
    });

    test('Carousel Displays Correct Movies', async ({ homePage }) => {

        const uiMovies = await homePage.featuredMoviesCarousel.getAllMoviesInfoInCarousel();
        const apiMovies = await getMovies();

        // Skip test if no movies are available in both ui and api 
        if (uiMovies.length === 0 && apiMovies.length === 0) {
            console.warn('No available movies in both api and ui to check.');
            return;
        }

        // Reformat to 2D arrays and sort to compare: movie id, name and description
        const [apiMovieArrays, uiMovieArrays] = await Promise.all([
            apiMovies.map(api => [api.maPhim.toString(), api.tenPhim, api.moTa]).sort(),
            uiMovies.map(ui => [ui.maPhim, ui.tenPhim, ui.moTa]).sort(),
        ]);
    
        expect(uiMovieArrays).toEqual(apiMovieArrays);
    })

})

