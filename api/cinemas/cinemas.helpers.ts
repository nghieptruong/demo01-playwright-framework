import { L } from '@faker-js/faker/dist/airline-DF6RqYmq';
import { BranchBase, MovieBase } from '../shared.types';
import { fetchCinemasList, fetchShowtimeDataByCinemaId } from './cinemas.api';
import { Cinema, DanhSachPhim, ListCumRap, MovieAndShowtimeIds, ShowtimesByCinema } from './cinemas.types';

// Get info
export async function extractAllCinemaIds(): Promise<string[]> {
    const data = await fetchCinemasList();
    return data.flatMap(data => data.maHeThongRap);
}

function extractShowtimeIdsFromCinemaData(cinemaData: ShowtimesByCinema[]): string[] {
    return cinemaData
        .flatMap(s => s.lstCumRap)
        .flatMap(s => s.danhSachPhim)
        .flatMap(s => s.lstLichChieuTheoPhim)
        .map(s => s.maLichChieu.toString());
}

function extractShowtimeIdsFromBranchData(branchData: DanhSachPhim[]): string[] {
    return branchData
        .flatMap(s => s.lstLichChieuTheoPhim)
        .map(s => s.maLichChieu.toString());
}

export async function extractShowtimeIdsForAllCinemas(): Promise<string[]> {

    const cinemas = await extractAllCinemaIds();

    const showtimePromises = cinemas.map(c => fetchShowtimeDataByCinemaId(c));
    const showtimesArrays = await Promise.all(showtimePromises);
    const allShowtimes = showtimesArrays.flat();

    return extractShowtimeIdsFromCinemaData(allShowtimes);
}

export async function getCinemaInfoById(cinemaId: string): Promise<Cinema> {
    const data = await fetchCinemasList();
    const cinemaInfo = data.find(c => c.maHeThongRap === cinemaId);
    if (!cinemaInfo) {
        throw new Error(`Cannot find cinema info for cinemaId: ${cinemaId}`);
    }
    return cinemaInfo;
}

export async function getShowtimeDataForCinema(cinemaId: string): Promise<ListCumRap[]> {

    const data = await fetchShowtimeDataByCinemaId(cinemaId);

    const listCinemas = data.flatMap(data => data.lstCumRap);

    return listCinemas;
}

export async function getBranchesForCinemaByAlias(cinemaAlias: string): Promise<BranchBase[]> {
    const cinemaId = await matchCinemaIdAndAlias(cinemaAlias);
    return await getBranchesForCinemaById(cinemaId);
}

export async function getBranchesForCinemaById(cinemaId: string): Promise<BranchBase[]> {

    const listBranches = await getShowtimeDataForCinema(cinemaId);

    let branchInfo: BranchBase[] = [];

    for (const branch of listBranches) {

        branchInfo.push({
            maCumRap: branch.maCumRap,
            tenCumRap: branch.tenCumRap,
            diaChi: branch.diaChi
        })
    }
    return branchInfo;
}

export async function getShowtimesForBranch(branchName: string): Promise<DanhSachPhim[]> {

    const cinemaId = await findCinemaIdByBranchName(branchName);

    const cinemaShowtimes = await getShowtimeDataForCinema(cinemaId);

    const branchShowtimes = cinemaShowtimes
        .filter(c => c.tenCumRap === branchName)
        .flatMap(c => c.danhSachPhim);

    return branchShowtimes;
}

export async function getMoviesInfoForBranch(branchName: string): Promise<MovieBase[]> {

    const listMovies = await getShowtimesForBranch(branchName);

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

export async function getShowtimeIdsForBranch(branchName: string): Promise<string[]> {

    const branchShowtimes = await getShowtimesForBranch(branchName);

    return extractShowtimeIdsFromBranchData(branchShowtimes);
}

export async function findCinemaByShowtimeId(showtimeId: string): Promise<string> {
    const cinemaIds = await extractAllCinemaIds();

    for (const id of cinemaIds) {

        const cinemaShowtimes = await fetchShowtimeDataByCinemaId(id);
        
        const allShowtimeIds = extractShowtimeIdsFromCinemaData(cinemaShowtimes);  

        if (allShowtimeIds.includes(showtimeId)) {
            return id;
        }
    }
    throw new Error(`No cinema found for showtimeId: ${showtimeId}`);
}

export async function getMovieAndShowtimeInfoForBranch(branchName: string): Promise<MovieAndShowtimeIds[]> {

    const data = await getShowtimesForBranch(branchName);

    let allGroups: MovieAndShowtimeIds[] = [];

    for (const group of data) {
        const movieId = group.maPhim.toString();
        const movieTitle = group.tenPhim;
        const ids = group.lstLichChieuTheoPhim.map(m => m.maLichChieu.toString());

        allGroups.push
            ({
                maPhim: movieId,
                tenPhim: movieTitle,
                maLichChieu: ids
            });

    }
    return allGroups;
}

export async function getShowtimeIdsForBranchAndMovie(branchName: string, movieName: string): Promise<string[]> {

    const branchShowtimes = await getShowtimesForBranch(branchName);

    const branchShowtimesFiltered = branchShowtimes
        .filter(b => b.tenPhim === movieName)
        .flatMap(m => m.lstLichChieuTheoPhim)
        .map(s => s.maLichChieu.toString());

    return branchShowtimesFiltered;
}

export async function matchCinemaIdAndAlias(value: string): Promise<string> {

    const data = await fetchCinemasList();

    const findCinema = data.find(d => d.biDanh === value || d.maHeThongRap === value);

    if (findCinema === undefined) {
        throw new Error('Unidentified Cinema Id or Alias');
    }

    const matchedValue = findCinema.biDanh === value ? findCinema.maHeThongRap : findCinema.biDanh;
    return matchedValue;
}

export async function matchCinemaNameAndId(value: string): Promise<string> {
    const data = await fetchCinemasList();
    const findCinema = data.find(d => d.tenHeThongRap === value || d.maHeThongRap === value);
    if (findCinema === undefined) {
        throw new Error('Unidentified Cinema Name or Id');
    }
    const matchedValue = findCinema.tenHeThongRap === value ? findCinema.maHeThongRap : findCinema.tenHeThongRap;
    return matchedValue;
}

export async function findCinemaIdByBranchName(branchName: string): Promise<string> {
    const cinemaIds = await extractAllCinemaIds();

    for (const id of cinemaIds) {
        const branches = await getBranchesForCinemaById(id);
        const branchNames = branches.map(b => b.tenCumRap);

        if (branchNames.includes(branchName))
            return id;
    }

    throw new Error(`No Cinema found for this branch ${branchName}`);
}

export async function matchBranchNameAndId(value: string): Promise<string> {

    const cinemaIds = await extractAllCinemaIds();

    for (const id of cinemaIds) {
        const branches = await getBranchesForCinemaById(id);
        for (const branch of branches) {
            if (branch.maCumRap === value || branch.tenCumRap === value) {
                return branch.maCumRap === value ? branch.tenCumRap : branch.maCumRap ?? '';
            }
        }
    }
    throw new Error('Unidentified Branch Id or Name');
}

export async function getBranchInfoById(branchId: string): Promise<BranchBase> {

    const cinemaIds = await extractAllCinemaIds();

    for (const id of cinemaIds) {

        const branches = await getBranchesForCinemaById(id);

        const branch = branches.find(b => b.maCumRap === branchId);

        if (branch) {
            return branch;
        }
    }

    throw new Error(`No branch found for this id ${branchId}`);
}