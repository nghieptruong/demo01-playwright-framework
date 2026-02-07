import { Locator } from "@playwright/test";
import { expect, test } from "../../fixtures/custom-fixtures";
import { pickSampleItems, shuffleItems } from "../utils/dataManipulation.helpers";

test.describe('Cinema Screenings Table Functional Test', () => {

    test.beforeEach(async ({ homePage }) => {

        await test.step(`Navigate to Homepage and wait for cinema tabs to load`, async () => {
            await homePage.navigateToHomePageAndWait();
            await homePage.cinemaShowtimesTabs.waitForTabsLoaded();
        });
    });

    test.describe('Default tab selections', () => {

        test('Default Cinema Tab auto-selects first cinema', async ({ homePage }) => {
            const firstCinema = homePage.cinemaShowtimesTabs.cinemaTabs.first();
            await firstCinema.waitFor();

            // Assertion: First Cinema Tab is selected by default
            const isSelected = await homePage.cinemaShowtimesTabs.isTabSelected(firstCinema);
            expect(isSelected, 'First Cinema Tab is not selected by default').toBe(true);
        });

        test('Default Branch Tab auto-selects first branch & screenings populated', async ({ homePage }) => {

            let shuffledCinemas: Locator[];

            await test.step(`Get all displayed cinema tabs and shuffle to run test in random order`, async () => {
                // Shuffle list of cinemas for iterations
                const cinemas = await homePage.cinemaShowtimesTabs.cinemaTabs.all();
                shuffledCinemas = shuffleItems(cinemas);
            });

            await test.step(`Verify first branch tab is auto-selected and screenings populated for each cinema`, async () => {

                for (const cinema of shuffledCinemas) {

                    // Select cinema if not already selected 
                    await homePage.cinemaShowtimesTabs.selectCinemaAndWaitBranchTablistUpdated(cinema);

                    // Get first branch selected state and count of movies & screenings
                    const firstBranch = homePage.cinemaShowtimesTabs.branchTabs.first();
                    const isSelected = await homePage.cinemaShowtimesTabs.isTabSelected(firstBranch);

                    const [movieCount, screeningCount] = await Promise.all([
                        homePage.cinemaShowtimesTabs.countMovies(),
                        homePage.cinemaShowtimesTabs.countShowtimes(),
                    ]);

                    // Assertion: First Branch Tab is selected by default
                    expect.soft(isSelected, `First branch tab is not selected by default in cinema ${cinema}`).toBe(true);

                    // Assertion: Movie Screenings Tab is populated
                    expect.soft(movieCount, 'No movies displayed!').toBeGreaterThan(0);
                    expect.soft(screeningCount, 'No screenings displayed!').toBeGreaterThan(0);
                }
            });
        });
    });

    test.describe('Branch switching', () => {

        test('Switching branch updates Movie Screening Tab @regression', async ({ homePage }) => {

            let shuffledSampleCinemas: Locator[];

            await test.step(`Pick sample cinemas from available cinemas to run tests`, async () => {
                const currentCinemas = await homePage.cinemaShowtimesTabs.cinemaTabs.all();

                /// Pick sample cinemas (first, last, random)
                const sampleCinemas = pickSampleItems(currentCinemas);
                shuffledSampleCinemas = shuffleItems(sampleCinemas);
            });

            await test.step(`Switch branch tabs and verify screenings update`, async () => {

                for (const cinema of shuffledSampleCinemas) {

                    // Select cinema if different
                    await homePage.cinemaShowtimesTabs.selectCinemaAndWaitBranchTablistUpdated(cinema);

                    // Pick sample branches from unselected ones (first, last, random) 
                    const currentNonSelectedBranches = await homePage.cinemaShowtimesTabs.branchNonActiveTabs.all();

                    if (currentNonSelectedBranches.length === 0) continue;

                    const sampleBranches = pickSampleItems(currentNonSelectedBranches);

                    // Switch branch and verify screening list update
                    for (const branch of sampleBranches) {
                        await homePage.cinemaShowtimesTabs.selectBranchAndWaitShowtimesUpdated(branch);
                    }
                }
            });
        });
    })

    test.describe('Navigation', () => {
        test('Screening link navigates to correct ticket page @regression', async ({ homePage }) => {

            test.setTimeout(200000);

            let shuffledSampleCinemas: Locator[];

            await test.step(`Pick sample cinemas from available cinemas to run tests`, async () => {
                const currentCinemas = await homePage.cinemaShowtimesTabs.cinemaTabs.all();

                /// Pick sample cinemas (first, last, random)
                const sampleCinemas = pickSampleItems(currentCinemas);
                shuffledSampleCinemas = shuffleItems(sampleCinemas);
            });

            await test.step(`Select random screening and verify navigation to correct ticket page`, async () => {
                for (const cinema of shuffledSampleCinemas) {

                    // Select cinema if not already selected
                    await homePage.cinemaShowtimesTabs.selectCinemaAndWaitBranchTablistUpdated(cinema);

                    // Pick sample branches from current list 
                    const currentBranches = await homePage.cinemaShowtimesTabs.branchTabs.all();
                    const sampleBranches = pickSampleItems(currentBranches);

                    for (const branch of sampleBranches) {
                        ;
                        // Switch branch & select random screening
                        await homePage.cinemaShowtimesTabs.selectBranchAndWaitShowtimesUpdated(branch);

                        const selectedShowtime = await homePage.cinemaShowtimesTabs.selectRandomShowtime();

                        // Verify navigation to correct ticket page
                        await homePage.cinemaShowtimesTabs.verifyNavigationToShowtimePage(selectedShowtime);

                        // Navigate back to Homepage & Re-select the parent cinema for next inner loop 
                        await homePage.cinemaShowtimesTabs.goBackAndReselectParentCinema(cinema);
                    }
                }
            });
        });
    })

})