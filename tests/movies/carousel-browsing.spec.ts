import { expect, test } from "../../fixtures/custom-fixtures";
import { pickSampleIndexes, shuffleIndexes } from "../utils/dataManipulation.helpers";

test.describe('Movie Carousel Functional Tests', () => {

    test.beforeEach(async ({ homePage }) => {
        await test.step(`Navigate to Homepage and wait for carousel to load`, async () => {
            await homePage.navigateToHomePageAndWait();
            await homePage.featuredMoviesCarousel.waitForCarouselLoaded();
        });
    });

    test.describe('Carousel Slides default and switching behavior', () => {
        test('First carousel slide is pre-selected and populated @regression', async ({ homePage }) => {
            // Check selection state of first slide in carousel
            const isSelected = await homePage.featuredMoviesCarousel.isSlideActive(0);
            const countMovies = await homePage.featuredMoviesCarousel.countMovies();

            // Verify the first slide is selected and movie items are displayed
            expect(isSelected).toBe(true);
            expect(countMovies).toBeGreaterThan(0);
        })


        test('Switching slide updates movie items @regression', async ({ homePage }) => {

            // Capture initial selected slide index & button
            const initialSelectedSlideIndex = await homePage.featuredMoviesCarousel.getActiveSlideIndex();

            // Navigate through all non-selected slides and wait for slide to update
            const nonSelectedSlideIndex = await homePage.featuredMoviesCarousel.getNonActiveSlideIndexes();

            for (const slideIndex of nonSelectedSlideIndex) {
                await homePage.featuredMoviesCarousel.selectSlideAndWaitForUpdate(slideIndex);
            }

            // Additional check: Navigate back to initial slide and wait for slide to update
            await homePage.featuredMoviesCarousel.selectSlideAndWaitForUpdate(initialSelectedSlideIndex);
        })
    })

    test.describe('Trailer Playback', () => {

        test('Watch movie trailer', async ({ homePage }) => {

            const slidesCount = await homePage.featuredMoviesCarousel.countSlides();
            const shuffleSlideIndexes = shuffleIndexes(slidesCount);

            // Check each slide in random order
            for (const slideIndex of shuffleSlideIndexes) {

                await homePage.featuredMoviesCarousel.selectSlideAndWaitForUpdate(slideIndex);

                // Pick sample movies (first, last, random - in random order)
                const moviesCount = await homePage.featuredMoviesCarousel.countMovies();
                const sampleMovieIndexes = pickSampleIndexes(moviesCount);

                // Click on video button and verify that video is displayed
                for (const movieIndex of sampleMovieIndexes) {

                    await homePage.featuredMoviesCarousel.playTrailerVideo(movieIndex);
                    await homePage.featuredMoviesCarousel.verifyVideoDisplays();
                    await homePage.featuredMoviesCarousel.closeVideo();
                }
            }
        })
    })

    test.describe('Navigation to Movie Page', () => {
        test('Navigate to movie detail page @regression', async ({ homePage }) => {

            const slidesCount = await homePage.featuredMoviesCarousel.countSlides();
            const shuffleSlideIndexes = shuffleIndexes(slidesCount);

            // Check each slide in random order
            for (const slideIndex of shuffleSlideIndexes) {

                await homePage.featuredMoviesCarousel.selectSlideAndWaitForUpdate(slideIndex);

                // Pick sample movies (first, last, random - in random order)
                const moviesCount = await homePage.featuredMoviesCarousel.countMovies();
                const sampleMovieIndexes = pickSampleIndexes(moviesCount);

                for (const movieIndex of sampleMovieIndexes) {

                    // Get a fresh locator for the movie
                    const movie = homePage.featuredMoviesCarousel.slideCards.nth(movieIndex);
                    const movieId = await homePage.featuredMoviesCarousel.getMovieId(movie);

                    // Click on ticket button and verify navigation to movie page
                    await homePage.featuredMoviesCarousel.clickGoToMoviePageLink(movieId);
                    await homePage.featuredMoviesCarousel.verifyNavigationToMovieDetailPage(movieId);

                    // Navigate back to Homepage & Re-select the parent slide 
                    await homePage.navigateToHomePageAndWait();
                    await homePage.featuredMoviesCarousel.waitForCarouselLoaded();
                    await homePage.featuredMoviesCarousel.selectSlideAndWaitForUpdate(slideIndex);
                }
            }
        })
    })
})

