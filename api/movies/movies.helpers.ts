import { M } from '@faker-js/faker/dist/airline-DF6RqYmq';
import { fetchMoviesList, fetchShowtimesByMovieId } from './movies.api';
import { BranchInfoByMovie, Movie, MovieShowtimesGroupedByCinema } from './movies.types';

export async function extractAllMovieIds(): Promise<string[]> {
    const movieList = await fetchMoviesList();
    return movieList.map(m => m.maPhim.toString());
}

export async function filterMoviesWithAvailableShowtimes(): Promise<string[]>  {
    const allMovieIds = await extractAllMovieIds();
    const movieIdsWithShowtimes: string[] = [];
    for (const movieId of allMovieIds) {
        const showtimes = await fetchShowtimesByMovieId(movieId);
        if (showtimes.length > 0) {
            movieIdsWithShowtimes.push(movieId);
        }
    }
    return movieIdsWithShowtimes;
}

export async function extractKeyMovieInfo(): Promise<{ maPhim: string; tenPhim: string; moTa: string }[]> {
    const movieList = await fetchMoviesList();

    return movieList.map(movie => ({
        maPhim: movie.maPhim.toString(),
        tenPhim: movie.tenPhim,
        moTa: movie.moTa
    }));
}

export async function getMovieInfoById(movieId: string): Promise<Movie> {
    const movieList = await fetchMoviesList();
    const movieInfo = movieList.find(m => m.maPhim.toString() === movieId);

    if (!movieInfo) {
        throw new Error(`Cannot find movie info for movieId: ${movieId}`);
    }

    return movieInfo;
}

export async function extractShowtimeIdsForAllMovies(): Promise<string[]> {
   
    const movies = await extractAllMovieIds();

    const showtimePromises = movies.map(m => fetchShowtimesByMovieId(m));
    const showtimesArrays = await Promise.all(showtimePromises);

    const allShowtimes = showtimesArrays.flat();
    return extractShowtimeIds(allShowtimes);
}

function extractShowtimeIds(showtimeData: MovieShowtimesGroupedByCinema[]): string[] {
    return showtimeData
        .flatMap(s => s.cumRapChieu)
        .flatMap(s => s.lichChieuPhim)
        .map(s => s.maLichChieu.toString());
}

export async function getCinemaNamesForMovie(movieId: string): Promise<string[]> {
    const movieShowtimes = await fetchShowtimesByMovieId(movieId);
    const cinemas = movieShowtimes.map(c => c.tenHeThongRap);
    return cinemas;
}

export async function getBranchesInfoForMovie(movieId: string): Promise<BranchInfoByMovie[]> {

    const movieShowtimes = await fetchShowtimesByMovieId(movieId);

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

export async function getBranchNamesForMovieBycinema(movieId: string, cinemaName: string): Promise<string[]> {
    const movieShowtimes = await fetchShowtimesByMovieId(movieId);
    
    const cinema = movieShowtimes.find(c => c.tenHeThongRap === cinemaName);  

    if (!cinema) {
        throw new Error(`Cannot find cinema ${cinemaName} for movieId ${movieId}`);
    }
    const branchNames = cinema.cumRapChieu.map(b => b.tenCumRap);
    return branchNames;
}

export async function getShowtimeIdsByMovieIdBranchId(movieId: string, branchId: string): Promise<string[]> {
    const data = await fetchShowtimesByMovieId(movieId);

    const filteredMovies = data.flatMap(data => data.cumRapChieu);
    const filteredBranches = filteredMovies.filter(m => m.maCumRap === branchId);

    const showtimeIds = filteredBranches.flatMap(s => s.lichChieuPhim).map(s => s.maLichChieu.toString());
    return showtimeIds;
}

export async function getMovieDurationMinById(movieId: string): Promise<number> {
    const showtimes = await fetchShowtimesByMovieId(movieId);
    const duration = showtimes[0].cumRapChieu[0].lichChieuPhim[0].thoiLuong;
    if (!duration) {
        throw new Error(`Cannot find duration for movieId: ${movieId}`);
    }
    return duration;
}

export async function findMovieIdByShowtimeId(showtimeId: string): Promise<string> {
    const allMovieIds = await extractAllMovieIds();
    
    for (const movieId of allMovieIds) {

        const showtimes = await fetchShowtimesByMovieId(movieId);
        const allShowtimeIds = extractShowtimeIds(showtimes);
        
        if (allShowtimeIds.includes(showtimeId)) {
            return movieId;
        }   
    }
    throw new Error(`No movie found for showtimeId: ${showtimeId}`);
}