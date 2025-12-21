import { fetchCinemasList } from "../../api/cinemas/cinemas.api";
import { getBranchesForCinemaByAlias, getMovieAndShowtimeInfoForBranch } from "../../api/cinemas/cinemas.helpers";
import { expect, test } from "../../fixtures/custom-fixtures";


test.describe('Verify Cinema Data Accuracy: UI vs API', () => {

    test.beforeEach(async ({ homePage }) => {
        await homePage.navigateToHomePageAndWait();
        await homePage.cinemaShowtimesTabs.waitForTabsLoaded();
    });


    test('Cinema Tab displays correct data', async ({ homePage }) => {

        // Fetch all cinema aliases from Api
        const apiCinemaAliases = (await fetchCinemasList()).map(c => c.biDanh);
        const apiCinemaAliasesSorted = apiCinemaAliases.sort();

        // Get UI-displayed cinema aliases 
        const uiCinemaAliases = await homePage.cinemaShowtimesTabs.getCurrentCinemaAliases();
        const uiCinemaAliasesSorted = uiCinemaAliases.sort();

        // Verify the list of cinemas match
        expect(uiCinemaAliasesSorted).toEqual(apiCinemaAliasesSorted);
    })

    test('Branch Tab displays correct data', async ({ homePage }) => {

        const uiCinemas = await homePage.cinemaShowtimesTabs.cinemaTabs.all();

        for (const cinema of uiCinemas) {

            // Select cinema only if it's in unselected state
            await homePage.cinemaShowtimesTabs.selectCinemaAndWaitBranchTablistUpdated(cinema);

            // Get info on UI-displayed branches and API-expected branches 
            const cinemaAlias = await homePage.cinemaShowtimesTabs.getCinemaAlias(cinema);
            const expectedBranches = await getBranchesForCinemaByAlias(cinemaAlias);

            const currentBranches = await homePage.cinemaShowtimesTabs.getCurrentBranchesInfo();

            // Reformat info to 2Ds arrays & Sort to compare
            const [expectedBranchesArrays, currentBranchesArrays] = await Promise.all([
                expectedBranches.map(e => [e.tenCumRap, e.diaChi]).sort(),
                currentBranches.map(d => [d.tenCumRap, d.diaChi]).sort(),
            ]);

            expect(currentBranchesArrays).toEqual(expectedBranchesArrays);

        }
    })

    test('Movie-Screening Tab displays correct data', async ({ homePage }) => {

        test.setTimeout(200000); // extend timeout for this test due to multiple api calls

        // Loop through all UI-displayed cinemas 
        const uiCinemas = await homePage.cinemaShowtimesTabs.cinemaTabs.all();

        for (const cinema of uiCinemas) {

            // Select cinema only if it's in unselected state
            await homePage.cinemaShowtimesTabs.selectCinemaAndWaitBranchTablistUpdated(cinema);

            // Loop through all UI-displayed branches 
            const uiBranches = await homePage.cinemaShowtimesTabs.branchTabs.all();

            for (const branch of uiBranches) {

                // Select branch only if it's in unselected state
                await homePage.cinemaShowtimesTabs.selectBranchAndWaitShowtimesUpdated(branch);

                // Get info on UI vs Api screenings grouped per movie  
                const uiMovieSections = await homePage.cinemaShowtimesTabs.getCurrentMovieSectionsInfo();

                const branchName = (await homePage.cinemaShowtimesTabs.getBranchInfo(branch)).tenCumRap;

                const apiShowtimes = await getMovieAndShowtimeInfoForBranch(branchName);

                for (const uiSection of uiMovieSections) {

                    // Verify that each UI screening group match exactly one Api group
                    const uiShowtimeIds = uiSection.maLichChieu;

                    const matches = apiShowtimes.filter(apiIds =>
                        uiShowtimeIds.every(uiId => apiIds.maLichChieu.includes(uiId))
                    );

                    if (matches.length === 0) {
                        throw new Error(`No API group matches UI IDs ${uiShowtimeIds}`);
                    }

                    if (matches.length > 1) {
                        throw new Error(`Multiple API groups match UI IDs ${uiShowtimeIds}`);
                    }

                    const matchedGroup = matches[0];

                    // Verify movie title and id count matched data from matched group
                    const apiMovieTitle = matchedGroup.tenPhim;
                    const apiScreeningIds = matchedGroup.maLichChieu;
                    const expectedScreeningIds = apiScreeningIds.slice(0, 4); // UI displays top 4 screenings per movie max

                    expect(uiSection.tenPhim,
                        `Expected title: ${apiMovieTitle} but UI displays: ${uiSection.tenPhim} for ${branchName}`
                    ).toBe(apiMovieTitle);

                    expect(uiShowtimeIds).toEqual(expectedScreeningIds);
                }
            }
        }
    })
})
