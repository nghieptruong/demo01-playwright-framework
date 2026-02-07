export interface ShowtimeInfo {
    maLichChieu: number;
    tenCumRap: string;
    tenRap: string;
    diaChi: string;
    tenPhim: string;
    hinhAnh?: string;
    ngayChieu: string;
    gioChieu: string
}

export interface SeatInfo {
    maGhe: number;
    tenGhe: string;
    maRap: number;
    loaiGhe: string;
    stt: string;
    giaVe: number;
    daDat: Boolean;
    taiKhoanNguoiDat: string;
}

export interface BookingData {
    thongTinPhim: ShowtimeInfo;
    danhSachGhe: SeatInfo[];
}