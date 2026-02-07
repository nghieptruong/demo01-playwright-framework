import { getCinemaSystems } from '../cinemas.api';
import { CinemaSystem } from '../cinemas.types';

/**
 * Cinema System Operations
 * Functions for interacting with cinema systems (e.g., BHD, CGV, Lotte)
 */

export async function extractAllCinemaSysIds(): Promise<string[]> {
    const data = await getCinemaSystems();
    return data.flatMap(data => data.maHeThongRap);
}

export async function getCinemaSysInfo(cinemaId: string): Promise<CinemaSystem> {
    const data = await getCinemaSystems();
    const cinemaInfo = data.find(c => c.maHeThongRap === cinemaId);
    if (!cinemaInfo) {
        throw new Error(`Cannot find cinema info for cinemaId: ${cinemaId}`);
    }
    return cinemaInfo;
}

export async function findCinemaSysIdByAlias(alias: string): Promise<string> {
    const data = await getCinemaSystems();
    const findCinema = data.find(d => d.biDanh === alias);

    if (findCinema === undefined) {
        throw new Error('Unidentified Alias');
    }

    return findCinema.maHeThongRap;
}
