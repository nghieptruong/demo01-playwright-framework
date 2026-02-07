import { movieEndpoints } from "../config/apiRoutes";
import { Movie } from "../shared.types";
import { MovieScreenings } from "./movies.types";

export async function getMovies(): Promise<Movie[]> {
    const res = await fetch(movieEndpoints.list());
    const data: Movie[] = await res.json();
    return data;
}

export async function getMovie(movieTitle: string): Promise<Movie> {
    const res = await fetch(movieEndpoints.info(movieTitle));
    const data: Movie[] = await res.json();
    return data[0];
}

export async function getMovieScreenings(movieId: string): Promise<MovieScreenings> {
    const res = await fetch(movieEndpoints.showtimes(movieId));
    const data: MovieScreenings = await res.json();
    return data;
}