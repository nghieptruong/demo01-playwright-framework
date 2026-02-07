import { cinemaEndpoints }  from '../config/apiRoutes';
import { CinemaSystem, BranchBase, CinemaSysSchedule, MovieScheduleByCinema, MovieSchedule } from './cinemas.types';

// Note: To refactor use Playwright's APIRequestContext
export async function getCinemaSystems(): Promise<CinemaSystem[]> {
    const res = await fetch(cinemaEndpoints.systemList());
    const data: CinemaSystem[] = await res.json();
    return data;
}

export async function getCinemaSystem(cinemaId: string): Promise<CinemaSystem> {
    const res = await fetch(cinemaEndpoints.systemInfo(cinemaId));
    const data: CinemaSystem[] = await res.json();
    return data[0];
}

export async function getCinemaBranches(cinemaId: string): Promise<BranchBase[]> {
    const res = await fetch(cinemaEndpoints.branchInfo(cinemaId));
    const data: BranchBase[] = await res.json();
    return data;
}

export async function getCinemaSchedule(cinemaId: string): Promise<CinemaSysSchedule[]> {
    const res = await fetch(cinemaEndpoints.systemSchedule(cinemaId));
    const data: CinemaSysSchedule[] = await res.json();
    return data;
}

export async function getMovieSchedule(movieId: string): Promise<MovieScheduleByCinema[]> {
    const res = await fetch(cinemaEndpoints.movieSchedule(movieId));
    const data: MovieSchedule = await res.json();
    return data.heThongRapChieu;
}