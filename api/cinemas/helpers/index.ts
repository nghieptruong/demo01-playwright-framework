/**
 * Cinema Helpers - Re-export all helper functions
 * 
 * This index file provides backward compatibility by re-exporting
 * all functions from the focused helper modules.
 */

// Cinema System helpers
export {
    extractAllCinemaSysIds,
    getCinemaSysInfo,
    findCinemaSysIdByAlias
} from './cinema-system.helpers';

// Branch helpers
export {
    getCinemaIdByBranchName,
    matchBranchNameAndId,
    getBranchInfoById
} from './branch.helpers';

// Schedule helpers
export {
    getCinemaSysScheduleGroupedByBranch,
    getShowtimeIdsForAllMovies,
    getMovieSchedulesForBranch as getShowSchedulesForBranch,
    getActiveMoviesForBranch,
    getActiveShowtimeIdsForBranch,
    getMovieAndShowtimeInfoForBranch,
    getShowtimeIdsForBranchAndMovie,
    filterMoviesWithAvailableShowtimes,
    getShowtimeIdsForMovie,
    getCinemaSysNameShowingMovie,
    getCinemaBranchesShowingMovie,
    getBranchNamesByMovieAndCinema,
    getShowtimeIdsByMovieIdBranchId,
    getMovieShowingDurationInMinutes,
    findMovieIdByShowtimeId,
} from './schedule.helpers';
