import { getMovies } from './movies.api';

export async function getAllMovieIds(): Promise<string[]> {
    const movieList = await getMovies();
    return movieList.map(m => m.maPhim.toString());
}