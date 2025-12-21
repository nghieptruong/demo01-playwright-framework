
import { fetchShowtimeDetailsByShowtimeId } from "./showtimes.api";
import { SeatInfo, ShowtimeInfo } from "./showtimes.types";

export async function extractShowtimeInfo(showtimeId: string): Promise<ShowtimeInfo> {
    const showtimeDetails = await fetchShowtimeDetailsByShowtimeId(showtimeId);
    return showtimeDetails.thongTinPhim;
}

export async function extractSeatingData(showtimeId: string): Promise<SeatInfo[]> {
    const showtimeDetails = await fetchShowtimeDetailsByShowtimeId(showtimeId);
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