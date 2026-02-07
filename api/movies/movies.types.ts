import { Movie, ScreeningBase } from "../shared.types";

export interface MovieScreenings extends Movie {
    lichChieu: Screenings[];
}
interface Screenings extends ScreeningBase {
    maPhim: number;
    tenPhim: string;
    thongTinRap: TheaterInfo;
}
interface TheaterInfo {
    maRap: number;
    tenRap: string;
    maCumRap: string;
    tenCumRap: string;
    maHeThongRap: string;
    tenHeThongRap: string;
}