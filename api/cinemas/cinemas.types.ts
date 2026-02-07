import { ScreeningBase, MovieBase, Movie } from "../shared.types";

// Cinema System info
export interface CinemaSystem {
    maHeThongRap: string;
    tenHeThongRap: string;
    biDanh: string;
    logo: string;
}

// Cinema System Schedule with Branches
export interface CinemaSysSchedule extends CinemaSysBase {
    lstCumRap: ListCumRap[];
    mahom: string;
}

interface ListCumRap extends BranchBase {
    danhSachPhim: BranchScheduleByMovie[];
}

export interface BranchScheduleByMovie extends MovieBase {
    lstLichChieuTheoPhim: MovieScreening[];
}

// Movie Schedule with Cinema Systems
export interface MovieSchedule extends Movie {  //screeningSchedulesCatalog
    heThongRapChieu: MovieScheduleByCinema[];
}

export interface MovieScheduleByCinema extends CinemaSysBase {  // screeningScheduleCinemaGroup
    cumRapChieu: MovieScheduleByBranch[];
}

interface MovieScheduleByBranch { 
    maCumRap: string;
    tenCumRap: string;
    hinhAnh: string | null;
    lichChieuPhim: MovieScreening[];
}

export interface MovieScreening extends ScreeningBase {   // screeningSchedule
    tenRap: string;
}

// Supporting base interfaces
interface CinemaSysBase {
    maHeThongRap: string;
    tenHeThongRap: string;
    logo: string;
}

export interface BranchBase {
    maCumRap: string;
    tenCumRap: string;
    diaChi: string;
}


 // Utility Types
export type MovieAndShowtimeIds = {
    maPhim: string,
    tenPhim: string,
    maLichChieu: string[]
}


export type BranchInfoByMovie = {
    maCumRap: string;
    tenCumRap: string;
}