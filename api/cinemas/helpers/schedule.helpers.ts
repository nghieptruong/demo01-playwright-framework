import { getAllMovieIds } from '../../movies/movies.helpers';
import { MovieBase } from '../../shared.types';
import { getCinemaSchedule, getMovieSchedule } from '../cinemas.api';
import { BranchScheduleByMovie, MovieAndShowtimeIds, BranchInfoByMovie } from '../cinemas.types';
import { getCinemaIdByBranchName } from './branch.helpers';

/**
 * Schedule & Showtime Operations
 * Functions for working with movie showtimes and schedules
 */

// ===== Cinema-based schedules =====

export async function getCinemaSysScheduleGroupedByBranch(cinemaId: string) {
    const data = await getCinemaSchedule(cinemaId);
    const listCinemas = data.flatMap(data => data.lstCumRap);
    return listCinemas;
}

export async function getShowtimeIdsForAllMovies(): Promise<string[]> {
    const movies = await getAllMovieIds();
    let showtimeIds: string[] = [];

    for (const m of movies) {
        const ids = await getShowtimeIdsForMovie(m);
        showtimeIds = showtimeIds.concat(ids);
    }
    return showtimeIds;
}

export async function getMovieSchedulesForBranch(branchName: string): Promise<BranchScheduleByMovie[]> {
    const cinemaId = await getCinemaIdByBranchName(branchName);
    const cinemaShowtimes = await getCinemaSysScheduleGroupedByBranch(cinemaId);

    const schedules = cinemaShowtimes
        .filter(c => c.tenCumRap === branchName)
        .flatMap(c => c.danhSachPhim);

    return schedules;
}

export async function getActiveMoviesForBranch(branchName: string): Promise<MovieBase[]> {
    const listMovies = await getMovieSchedulesForBranch(branchName);
    let movieInfo: MovieBase[] = [];

    for (const movie of listMovies) {
        movieInfo.push({
            maPhim: movie.maPhim,
            tenPhim: movie.tenPhim,
            hinhAnh: movie.hinhAnh
        })
    }
    return movieInfo;
}

export async function getActiveShowtimeIdsForBranch(branchName: string): Promise<string[]> {
    const branchShowtimes = await getMovieSchedulesForBranch(branchName);
    return extractShowtimeIdsFromBranchData(branchShowtimes);
}

export async function getMovieAndShowtimeInfoForBranch(branchName: string): Promise<MovieAndShowtimeIds[]> {
    const data = await getMovieSchedulesForBranch(branchName);
    let allGroups: MovieAndShowtimeIds[] = [];

    for (const group of data) {
        const movieId = group.maPhim.toString();
        const movieTitle = group.tenPhim;
        const ids = group.lstLichChieuTheoPhim.map(m => m.maLichChieu.toString());

        allGroups.push({
            maPhim: movieId,
            tenPhim: movieTitle,
            maLichChieu: ids
        });
    }
    return allGroups;
}

export async function getShowtimeIdsForBranchAndMovie(branchName: string, movieName: string): Promise<string[]> {
    const branchShowtimes = await getMovieSchedulesForBranch(branchName);

    const branchShowtimesFiltered = branchShowtimes
        .filter(b => b.tenPhim === movieName)
        .flatMap(m => m.lstLichChieuTheoPhim)
        .map(s => s.maLichChieu.toString());

    return branchShowtimesFiltered;
}

// ===== Movie-based schedules =====

export async function filterMoviesWithAvailableShowtimes(): Promise<string[]> {
    const allMovieIds = await getAllMovieIds();
    const movieIdsWithShowtimes: string[] = [];

    for (const movieId of allMovieIds) {
        const showtimes = await getMovieSchedule(movieId);
        if (showtimes.length > 0) {
            movieIdsWithShowtimes.push(movieId);
        }
    }
    return movieIdsWithShowtimes;
}

export async function getShowtimeIdsForMovie(movieId: string): Promise<string[]> {
    const showtimeData = await getMovieSchedule(movieId);
    return showtimeData
        .flatMap(s => s.cumRapChieu)
        .flatMap(s => s.lichChieuPhim)
        .map(s => s.maLichChieu.toString());
}

export async function getCinemaSysNameShowingMovie(movieId: string): Promise<string[]> {
    const movieShowtimes = await getMovieSchedule(movieId);
    const cinemas = movieShowtimes.map(c => c.tenHeThongRap);
    return cinemas;
}

export async function getCinemaBranchesShowingMovie(movieId: string): Promise<BranchInfoByMovie[]> {
    const movieShowtimes = await getMovieSchedule(movieId);

    if (movieShowtimes.length === 0) {
        console.warn(`No showtimes found in api data. MovieId: ${movieId}`);
        return [];
    }

    const showtimesByBranches = movieShowtimes.flatMap(data => data.cumRapChieu);
    let branchInfo: BranchInfoByMovie[] = [];

    for (const branch of showtimesByBranches) {
        branchInfo.push({
            maCumRap: branch.maCumRap,
            tenCumRap: branch.tenCumRap
        })
    }
    return branchInfo;
}

export async function getBranchNamesByMovieAndCinema(movieId: string, cinemaName: string): Promise<string[]> {
    const movieShowtimes = await getMovieSchedule(movieId);
    const cinema = movieShowtimes.find(c => c.tenHeThongRap === cinemaName);

    if (!cinema) {
        throw new Error(`Cannot find cinema ${cinemaName} for movieId ${movieId}`);
    }
    const branchNames = cinema.cumRapChieu.map(b => b.tenCumRap);
    return branchNames;
}

export async function getShowtimeIdsByMovieIdBranchId(movieId: string, branchId: string): Promise<string[]> {
    const data = await getMovieSchedule(movieId);
    const filteredMovies = data.flatMap(data => data.cumRapChieu);
    const filteredBranches = filteredMovies.filter(m => m.maCumRap === branchId);

    const showtimeIds = filteredBranches.flatMap(s => s.lichChieuPhim).map(s => s.maLichChieu.toString());
    return showtimeIds;
}

export async function getMovieShowingDurationInMinutes(movieId: string): Promise<number> {
    const showtimes = await getMovieSchedule(movieId);
    const duration = showtimes[0].cumRapChieu[0].lichChieuPhim[0].thoiLuong;
    if (!duration) {
        throw new Error(`Cannot find duration for movieId: ${movieId}`);
    }
    return duration;
}

export async function findMovieIdByShowtimeId(showtimeId: string): Promise<string> {
    const allMovieIds = await getAllMovieIds();

    for (const movieId of allMovieIds) {
        const allShowtimeIds = await getShowtimeIdsForMovie(movieId);

        if (allShowtimeIds.includes(showtimeId)) {
            return movieId;
        }
    }
    throw new Error(`No movie found for showtimeId: ${showtimeId}`);
}



// ===== Internal helper functions =====

// function extractShowtimeIdsFromCinemaData(cinemaData: CinemaSysSchedule[]): string[] {
//     return cinemaData
//         .flatMap(s => s.lstCumRap)
//         .flatMap(s => s.danhSachPhim)
//         .flatMap(s => s.lstLichChieuTheoPhim)
//         .map(s => s.maLichChieu.toString());
// }

function extractShowtimeIdsFromBranchData(branchData: BranchScheduleByMovie[]): string[] {
    return branchData
        .flatMap(s => s.lstLichChieuTheoPhim)
        .map(s => s.maLichChieu.toString());
}
