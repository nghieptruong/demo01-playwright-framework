import { getCinemaBranches, getCinemaSystems } from "../../api/cinemas/cinemas.api";
import { findCinemaSysIdByAlias, getMovieAndShowtimeInfoForBranch } from "../../api/cinemas/helpers";
import { expect, test } from "../../fixtures/custom-fixtures";
import { CinemaSystem } from "../../api/cinemas/cinemas.types";

test.describe('Verify Cinema Data Accuracy: UI vs API', () => {

    test.beforeEach(async ({ homePage }) => {
        await homePage.navigateToHomePageAndWait();
        await homePage.cinemaShowtimesTabs.waitForTabsLoaded();
    });

    test('Cinema Tab displays correct data', async ({ homePage }) => {

        let uiCinemaAliasesSorted: string[];
        let apiCinemaAliasesSorted: string[];

        await test.step(`Fetch cinema list from Api and get UI-displayed cinema aliases`, async () => {
            // Fetch all cinema aliases from Api
            const apiCinemaAliases = (await getCinemaSystems()).map(c => c.biDanh);
            apiCinemaAliasesSorted = apiCinemaAliases.sort();

            // Get UI-displayed cinema aliases 
            const uiCinemaAliases = await homePage.cinemaShowtimesTabs.getCurrentCinemaAliases();
            uiCinemaAliasesSorted = uiCinemaAliases.sort();
        });

        await test.step(`Verify UI displays same cinemas as in api data`, async () => {

            // Verify the list of cinemas match
            expect(uiCinemaAliasesSorted).toEqual(apiCinemaAliasesSorted);
        });
    })

    test('Branch Tab displays correct data', async ({ homePage }) => {

        let cinemaList: CinemaSystem[];

        await test.step(`Get list of cinema systems from database to iterate`, async () => {
            cinemaList = await getCinemaSystems();
        });

        await test.step(`Loop through all UI-displayed cinemas and verify branch data`, async () => {
            for (const cinema of cinemaList) {

                const cinemaAlias = cinema.biDanh;
                const cinemaId = cinema.maHeThongRap;

                // Select cinema only if it's in unselected state
                await homePage.cinemaShowtimesTabs.selectCinemaAndWaitBranchTablistUpdated(cinemaAlias);

                // Get info on UI-displayed branches and API-expected branches 
                const expectedBranches = await getCinemaBranches(cinemaId);
                const displayedBranches = await homePage.cinemaShowtimesTabs.getCurrentBranchesInfo();

                // Reformat info to 2Ds arrays & Sort to compare
                const [expectedBranchesArrays, currentBranchesArrays] = await Promise.all([
                    expectedBranches.map(e => [e.tenCumRap, e.diaChi]).sort(),
                    displayedBranches.map(d => [d.tenCumRap, d.diaChi]).sort(),
                ]);

                expect(currentBranchesArrays).toEqual(expectedBranchesArrays);
            }
        });
    })

    test('Movie-Showtime Tab displays correct data', async ({ homePage }) => {

        test.setTimeout(200000); // extend timeout for this test due to multiple api calls

        let cinemaList: CinemaSystem[];

        await test.step(`Get all cinema systems to iterate`, async () => {
            cinemaList = await getCinemaSystems();
        });

        await test.step(`Loop through all cinemas and branches combination and verify showtimes data`, async () => {

            for (const cinema of cinemaList) {

                const cinemaAlias = cinema.biDanh;
                const cinemaId = await findCinemaSysIdByAlias(cinemaAlias);
                const cinemaBranches = await getCinemaBranches(cinemaId);

                // Select cinema only if it's in unselected state
                await homePage.cinemaShowtimesTabs.selectCinemaAndWaitBranchTablistUpdated(cinemaAlias);

                // Loop through all branches 
                for (const branch of cinemaBranches) {

                    const branchName = branch.tenCumRap;

                    // Select branch only if it's in unselected state
                    await homePage.cinemaShowtimesTabs.selectBranchAndWaitShowtimesUpdated(branchName);

                    // Get info on UI vs Api showtimes grouped per movie  
                    const uiMovieSections = await homePage.cinemaShowtimesTabs.getCurrentMovieSectionsInfo();
                    const expectedMovieShowtimes = await getMovieAndShowtimeInfoForBranch(branchName);

                    for (const uiSection of uiMovieSections) {

                        // Verify that each UI showtime group match exactly one Api group
                        const uiShowtimeIds = uiSection.maLichChieu;

                        const matches = expectedMovieShowtimes.filter(apiIds =>
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
                        const apiShowtimeIds = matchedGroup.maLichChieu;
                        const expectedShowtimeIds = apiShowtimeIds.slice(0, 4); // UI displays top 4 showtimes per movie max

                        expect(uiSection.tenPhim,
                            `Expected title: ${apiMovieTitle} but UI displays: ${uiSection.tenPhim} for ${branchName}`
                        ).toBe(apiMovieTitle);

                        expect(uiShowtimeIds).toEqual(expectedShowtimeIds);
                    }
                }
            }
        });
    })
})
