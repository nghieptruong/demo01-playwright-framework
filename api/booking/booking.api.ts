import { bookingEndpoints } from "../config/apiRoutes";
import { BookingData } from "./booking.types";

export async function getShowtimeBookingData(showtimeId: string): Promise<BookingData> {
  const res = await fetch(
    bookingEndpoints.showtimeData(showtimeId));
  const data: BookingData = await res.json();
  return data;
}