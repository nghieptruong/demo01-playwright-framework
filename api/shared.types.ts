export interface CinemaBase {
    maHeThongRap: string;
    tenHeThongRap: string;
    logo: string;
}

export interface MovieBase {
    maPhim: number;
    tenPhim: string;
    hinhAnh: string;
}

export interface BranchBase {
    maCumRap: string;
    tenCumRap: string;
    diaChi: string;
}

export interface LichChieuPhim {   // screeningSchedule
    maLichChieu: string | number;
    maRap: string;
    tenRap: string;
    ngayChieuGioChieu: string;
    giaVe: number;
    thoiLuong: number;
}