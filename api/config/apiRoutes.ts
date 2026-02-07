const API_BASE_URL = 'https://movie0706.cybersoft.edu.vn';
const GROUP_CODE = 'GP09';

// Service base paths
const SERVICES = {
    cinemas: `/api/QuanLyRap`,
    movies: `/api/QuanLyPhim`,
    booking: `/api/QuanLyDatVe`,
    users: `/api/QuanLyNguoiDung`,
} as const;

// Common parameters
const PARAMS = {
    groupCode: 'maNhom',
    showtimeId: 'maLichChieu',
    movieId: 'maPhim',
    movieTitle: 'tenPhim',
    cinemaId: 'maHeThongRap',
    keyword: 'tuKhoa',
    username: 'taiKhoan',
} as const;

// Helper to build URL with query params
function buildApiUrl(
    basePath: string,
    params?: Record<string, string | number>
): string {
    const url = `${API_BASE_URL}${basePath}`;
    if (!params) return url;

    const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

    return `${url}?${queryString}`;
}

// Cinema endpoints
export const cinemaEndpoints = {
    systemList: () =>
        buildApiUrl(`${SERVICES.cinemas}/LayThongTinHeThongRap`),

    systemInfo: (cinemaId: string) =>
        buildApiUrl(`${SERVICES.cinemas}/LayThongTinHeThongRap`, {
            [PARAMS.cinemaId]: cinemaId,
        }),

    branchInfo: (cinemaId: string) =>
        buildApiUrl(`${SERVICES.cinemas}/LayThongTinCumRapTheoHeThong`, {
            [PARAMS.cinemaId]: cinemaId,
        }),

    systemSchedule: (cinemaId: string) =>
        buildApiUrl(`${SERVICES.cinemas}/LayThongTinLichChieuHeThongRap`, {
            [PARAMS.cinemaId]: cinemaId,
            [PARAMS.groupCode]: GROUP_CODE,
        }),

    movieSchedule: (movieId: string) =>
        buildApiUrl(`${SERVICES.cinemas}/LayThongTinLichChieuPhim`, {
            [PARAMS.movieId]: movieId,
        }),
} as const;

// Movie endpoints
export const movieEndpoints = {
    list: () =>
        buildApiUrl(`${SERVICES.movies}/LayDanhSachPhim`, {
            [PARAMS.groupCode]: GROUP_CODE
        }),

    info: (movieTitle: string) =>
        buildApiUrl(`${SERVICES.movies}/LayDanhSachPhim`, {
            [PARAMS.groupCode]: GROUP_CODE,
            [PARAMS.movieTitle]: movieTitle,
        }),

    showtimes: (movieId: string) =>
        buildApiUrl(`${SERVICES.movies}/LayThongTinPhim`, {
            [PARAMS.movieId]: movieId,
        }),
} as const;

// Booking endpoints
export const bookingEndpoints = {
    showtimeData: (showtimeId: string) =>
        buildApiUrl(`${SERVICES.booking}/LayDanhSachPhongVe`, {
            [PARAMS.showtimeId]: showtimeId,
        }),
} as const;

// User endpoints
export const userEndpoints = {
    search: (username: string) =>
        buildApiUrl(`${SERVICES.users}/TimKiemNguoiDung`, {
            [PARAMS.groupCode]: GROUP_CODE,
            [PARAMS.keyword]: username,
        }),

    delete: (username: string) =>
        buildApiUrl(`${SERVICES.users}/XoaNguoiDung`, {
            [PARAMS.username]: username,
        }),

    register: () => `${API_BASE_URL}${SERVICES.users}/DangKy`,
    login: () => `${API_BASE_URL}${SERVICES.users}/DangNhap`,
} as const;
