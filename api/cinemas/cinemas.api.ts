
import { apiURLs } from '../../tests/utils/routes';
import { Cinema, ShowtimesByCinema } from './cinemas.types';

export async function fetchCinemasList(): Promise<Cinema[]> {
    const res = await fetch(apiURLs.cinemas);
    const data: Cinema[] = await res.json();
    return data;
}

export async function fetchShowtimeDataByCinemaId(cinemaId: string): Promise<ShowtimesByCinema[]> {
    const res = await fetch(apiURLs.showtimesByCinemaId(cinemaId));
    const data: ShowtimesByCinema[] = await res.json();
    return data;
}

// Use fetchScreeningsByMovieId(movieId: number) from movies.helpers.ts to fetch screenings for movie