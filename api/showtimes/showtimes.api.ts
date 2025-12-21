import { apiURLs } from "../../tests/utils/routes";
import { ShowtimeDetails } from "./showtimes.types";

export async function fetchShowtimeDetailsByShowtimeId(showtimeId: string): Promise<ShowtimeDetails> {
    const res = await fetch(
      apiURLs.showtimeDetailsById(showtimeId));
    const data: ShowtimeDetails = await res.json();
    return data;
}