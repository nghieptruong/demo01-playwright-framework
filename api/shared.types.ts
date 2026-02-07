export interface MovieBase {
    maPhim: number;
    tenPhim: string;
    hinhAnh: string;
}

export interface ScreeningBase {
    maLichChieu: string | number;
    maRap: string | number;
    ngayChieuGioChieu: string;
    giaVe: number;
    thoiLuong: number;
}

export interface Movie extends MovieBase {
    biDanh: string;
    trailer: string;
    moTa: string;
    maNhom: string;
    ngayKhoiChieu: string;
    danhGia: number;
}
