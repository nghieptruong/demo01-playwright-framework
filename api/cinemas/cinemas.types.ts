import { BranchBase, CinemaBase, LichChieuPhim, MovieBase } from "../shared.types";

// Cinema List: https://movie0706.cybersoft.edu.vn/api/QuanLyRap/LayThongTinHeThongRap
export interface Cinema extends CinemaBase {
    biDanh: string;
}

//  Screening Schedule For Each Cinema: 
// https://movie0706.cybersoft.edu.vn/api/QuanLyRap/LayThongTinLichChieuHeThongRap?maHeThongRap=${cinemaId}&maNhom=GP09

export interface DanhSachPhim extends MovieBase {
    lstLichChieuTheoPhim: LichChieuPhim[];
}

export interface ListCumRap extends BranchBase {
    danhSachPhim: DanhSachPhim[];
}

export interface ShowtimesByCinema extends CinemaBase {
    lstCumRap: ListCumRap[];
    mahom: string;
}

// Helper type to combine movie and its showtime ids

export type MovieAndShowtimeIds = {
    maPhim: string,
    tenPhim: string,
    maLichChieu: string[]
}