import { pickRandomItem, shuffleItems } from "./dataManipulation.helpers";
import { getShowtimeIdsForAllMovies } from "../../api/cinemas/helpers";
import { getAvailableSeats, getAvailableStandardSeats, getAvailableVipSeats, getReservedSeats } from "../../api/booking/booking.helpers";

// Generic filter function for showtimes
type ShowtimeFilterFn = (showtimeId: string, seatQuantity: number) => Promise<boolean>;

async function getSampleShowtimesByFilter(
    filterFn: ShowtimeFilterFn,
    options?: { seatQuantity?: number; sampleSize?: number }
): Promise<string[]> {

    const seatQuantity = options?.seatQuantity ?? 1;
    let sampleSize = options?.sampleSize ?? 1;

    const allShowtimeIds = shuffleItems(await getShowtimeIdsForAllMovies());
    sampleSize = Math.min(sampleSize, allShowtimeIds.length);

    const shuffledShowtimeIds = shuffleItems(allShowtimeIds);
    const sampleShowtimes: string[] = [];

    for (const id of shuffledShowtimeIds) {

        if (await filterFn(id, seatQuantity)) {
            sampleShowtimes.push(id);
        }

        if (sampleShowtimes.length >= sampleSize) break;
    }

    return sampleShowtimes;
}

// Pick sample showtimes matching conditions
export async function getRandomSampleShowtimeIds(options?: { sampleSize?: number }) {

    const sampleSize = options?.sampleSize ?? 1;

    const allShowtimeIds = await getShowtimeIdsForAllMovies();
    const shuffledShowtimes = shuffleItems(allShowtimeIds);

    return shuffledShowtimes.slice(0, sampleSize);
}

export async function getSampleShowtimesWithAvailableSeats(
    options?: { seatQuantity?: number; sampleSize?: number }
) {
    const requestedSeatQuantity = options?.seatQuantity ?? 1;

    let sampleShowtimes = await getSampleShowtimesByFilter(async (id, seatQuantity) => {
        const availableSeats = await getAvailableSeats(id);
        return availableSeats.length >= seatQuantity;
    }, options);

    // Fallback: if no showtimes found with requested quantity, try with any available seats
    if (sampleShowtimes.length === 0 && requestedSeatQuantity > 1) {
        console.warn(`No showtimes with ${requestedSeatQuantity} available seats found. Trying with any available seats.`);

        sampleShowtimes = await getSampleShowtimesByFilter(async (id) => {
            const availableSeats = await getAvailableSeats(id);
            return availableSeats.length >= 1;
        }, { ...options, seatQuantity: 1 });
    }

    return sampleShowtimes;
}

export async function getSampleShowtimesWithAvailableStandardSeats(
    options?: { seatQuantity?: number; sampleSize?: number }
) {
    return getSampleShowtimesByFilter(async (id, seatQuantity) => {
        const standardSeats = await getAvailableStandardSeats(id);
        return standardSeats.length >= seatQuantity;
    }, options);
}

export async function getSampleShowtimesWithAvailableVipSeats(
    options?: { seatQuantity?: number; sampleSize?: number }
) {
    return getSampleShowtimesByFilter(async (id, seatQuantity) => {
        const vipSeats = await getAvailableVipSeats(id);
        return vipSeats.length >= seatQuantity;
    }, options);
}

export async function getSampleShowtimesWithAvailableMixedSeats(
    options?: { seatQuantity?: number; sampleSize?: number }
) {
    return getSampleShowtimesByFilter(async (id, seatQuantity) => {
        const [standardSeats, vipSeats] = await Promise.all([
            getAvailableSeats(id),
            getAvailableVipSeats(id),
        ]);
        return standardSeats.length >= seatQuantity && vipSeats.length >= seatQuantity;
    }, options);
}

export async function getSampleShowtimesWithReservedSeats(
    options?: { seatQuantity?: number; sampleSize?: number }
) {
    let sampleShowtimes = await getSampleShowtimesByFilter(async (id, seatQuantity) => {
        const unavailableSeats = await getReservedSeats(id);
        return unavailableSeats.length >= seatQuantity;
    }, options);

    // Fallback: if no showtimes found with requested quantity, try with any reserved seats
    if (sampleShowtimes.length === 0) {
        console.warn(`No showtimes with requested reserved seats found. Trying with any reserved seats.`);

        sampleShowtimes = await getSampleShowtimesByFilter(async (id) => {
            const unavailableSeats = await getReservedSeats(id);
            return unavailableSeats.length >= 1;
        }, { ...options, seatQuantity: 1 });
    }
    return sampleShowtimes;
}

// Pick sample seats
export function getRandomSeatNumbersPreferConsecutive(seats: string[], sampleSize: number = 2): string[] {

    if (seats.length === 0) {
        throw new Error("No seats to choose from.");
    }

    if (seats.length <= sampleSize) {
        console.warn(`Requested ${sampleSize} consecutive seats, but only ${seats.length} total seats available. Selecting all available seats.`);
        return seats;
    }

    // Create lookup map to preserve original format
    const seatMap = new Map<number, string>();

    seats.forEach(seat => seatMap.set(parseInt(seat), seat));

    const seatsAsc = Array.from(seatMap.keys()).sort((a, b) => a - b);

    // Find all groups of consecutive seats
    const consecutiveSeatsGroups: number[][] = [];

    for (let start = 0; start <= seatsAsc.length - sampleSize; start++) {

        let consecutive = true;

        for (let offset = 1; offset < sampleSize; offset++) {
            if (seatsAsc[start + offset] !== seatsAsc[start] + offset) {
                consecutive = false;
                break;
            }
        }

        if (consecutive) {
            consecutiveSeatsGroups.push(seatsAsc.slice(start, start + sampleSize));
        }
    }

    // If no consecutive groups found, fallback to random selection
    if (consecutiveSeatsGroups.length === 0) {
        console.warn(
            `No ${sampleSize} consecutive seats found. Choosing non-consecutive seats.`
        );

        return seats.slice(0, sampleSize);
    }

    // Map back to original string format
    const foundSeats = pickRandomItem(consecutiveSeatsGroups).map(num => seatMap.get(num)!);
    return foundSeats;
}