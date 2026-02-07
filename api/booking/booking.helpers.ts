
import { getShowtimeBookingData } from "./booking.api";
import { SeatInfo, ShowtimeInfo } from "./booking.types";
import { getCinemaIdByBranchName } from '../cinemas/helpers/branch.helpers';

export async function extractShowtimeInfo(showtimeId: string): Promise<ShowtimeInfo> {
    const showtimeDetails = await getShowtimeBookingData(showtimeId);
    return showtimeDetails.thongTinPhim;
}

export async function extractSeatingData(showtimeId: string): Promise<SeatInfo[]> {
    const showtimeDetails = await getShowtimeBookingData(showtimeId);
    return showtimeDetails.danhSachGhe;
}

export async function getAvailableSeats(showtimeId: string): Promise<string[]> {
    const data = await extractSeatingData(showtimeId);
    const available = data.filter(seat => seat.daDat === false).map(avail => avail.tenGhe);
    return available;
}

export async function getReservedSeats(showtimeId: string): Promise<string[]> {
    const data = await extractSeatingData(showtimeId);
    const reserved = data.filter(seat => seat.daDat === true).map(reserved => reserved.tenGhe);
    return reserved;
}

export async function getAvailableStandardSeats(showtimeId: string): Promise<string[]> {
    const data = await extractSeatingData(showtimeId);
    const standard = data.filter(seat => seat.daDat === false && seat.loaiGhe === 'Thuong').map(s => s.tenGhe);
    return standard;
}

export async function getAvailableVipSeats(showtimeId: string): Promise<string[]> {
    const data = await extractSeatingData(showtimeId);
    const vip = data.filter(seat => seat.daDat === false && seat.loaiGhe === 'Vip').map(v => v.tenGhe);
    return vip;
}

export async function calculatePrice(showtimeId: string, seats: string[]): Promise<number> {

    const seatInfo = await extractSeatingData(showtimeId);

    let price: number = 0;

    for (const seat of seats) {

        const findSeat = seatInfo.find(s => s.tenGhe === seat);
        if (!findSeat) {
            throw new Error(`Seat ${seat} not found in showtime data.`);
        }
        price = price + findSeat.giaVe;
    }
    return price;
}

export async function findCinemaIdByShowtimeId(showtimeId: string): Promise<string> {

    const showtimeData = await getShowtimeBookingData(showtimeId);
    const brachName = showtimeData.thongTinPhim.tenCumRap;

    return getCinemaIdByBranchName(brachName);
}

export async function getBranchNameByShowtimeId(showtimeId: string): Promise<string> {
    const showtimeData = await getShowtimeBookingData(showtimeId);
    return showtimeData.thongTinPhim.tenCumRap;
}

export async function findMovieTitleByShowtimeId(showtimeId: string): Promise<string> {

    const showtimeData = await getShowtimeBookingData(showtimeId);
    const movieName = showtimeData.thongTinPhim.tenPhim;
    return movieName;
}