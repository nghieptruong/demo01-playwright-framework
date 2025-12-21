import { CinemaBase, LichChieuPhim, MovieBase } from "../shared.types";

// Movie List: https://movie0706.cybersoft.edu.vn/api/QuanLyPhim/LayDanhSachPhim?maNhom=GP09
export interface Movie extends MovieBase {
    biDanh: string;
    trailer: string;
    moTa: string;
    maNhom: string;
    ngayKhoiChieu: string;
    danhGia: number;
}

// Screening Schedules For Each Movie: https://movie0706.cybersoft.edu.vn/api/QuanLyRap/LayThongTinLichChieuPhim?MaPhim=${movieId}
interface CumRapChieu { // screeningScheduleCinema
    maCumRap: string;
    tenCumRap: string;
    hinhAnh: string | null;
    lichChieuPhim: LichChieuPhim[];
}

export interface MovieShowtimesGroupedByCinema extends CinemaBase {  // screeningScheduleCinemaGroup
    cumRapChieu: CumRapChieu[];
}

export interface ShowtimesDataForMovie extends Movie {  //screeningSchedulesCatalog
    heThongRapChieu: MovieShowtimesGroupedByCinema[];
}

export type BranchInfoByMovie = {
    maCumRap: string;
    tenCumRap: string;
}