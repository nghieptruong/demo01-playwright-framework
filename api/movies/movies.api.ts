import { apiURLs } from "../../tests/utils/routes";
import { Movie, MovieShowtimesGroupedByCinema, ShowtimesDataForMovie as ShowtimesDataForMovie } from "./movies.types";

export async function fetchMoviesList(): Promise<Movie[]> {
    const res = await fetch(apiURLs.movies);
    const data: Movie[] = await res.json();
    return data;
}

export async function fetchShowtimesByMovieId(movieId: string): Promise<MovieShowtimesGroupedByCinema[]> {  
    const res = await fetch(apiURLs.showtimesByMovieId(movieId));
    const data: ShowtimesDataForMovie = await res.json(); 
    return data.heThongRapChieu;
}