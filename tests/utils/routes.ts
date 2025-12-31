// URL Paths and URLs for Pages

export const pageURLPaths = {
    movie: '/detail/',
    showtime: '/purchase/',
}

export const pageURLs = {
    home: '/',
    login: '/sign-in',
    register: '/sign-up',
    account: '/account',
    movie: (movieId: string) => pageURLPaths.movie + movieId,
    showtime: (showtimeId: string) => pageURLPaths.showtime + showtimeId,
}

// API URLs and Regexes

const apiBaseURL = 'https://movie0706.cybersoft.edu.vn';

const apiEndpoints = {
    cinemas: '/api/QuanLyRap/LayThongTinHeThongRap',
    movies: '/api/QuanLyPhim/LayDanhSachPhim?maNhom=GP09',
    users: '/api/QuanLyNguoiDung/TimKiemNguoiDung?MaNhom=GP09',
}

const apiWithParamEndpoints = {
    showtimesByCinemaId: (cinemaId: string) => `/api/QuanLyRap/LayThongTinLichChieuHeThongRap?maHeThongRap=${cinemaId}&maNhom=GP09`,
    showtimesByMovieId: (movieId: string) => `/api/QuanLyRap/LayThongTinLichChieuPhim?MaPhim=${movieId}`,
    showtimeDetailsById: (showtimeId: string) => `/api/QuanLyDatVe/LayDanhSachPhongVe?MaLichChieu=${showtimeId}`,
    userInfoByUsername: (username: string) => `/api/QuanLyNguoiDung/TimKiemNguoiDung?MaNhom=GP09&tuKhoa=${username}`,
}

export const apiURLs = {
    cinemas: apiBaseURL + apiEndpoints.cinemas,
    movies: apiBaseURL + apiEndpoints.movies,
    users: apiBaseURL + apiEndpoints.users,
    showtimesByCinemaId: (cinemaId: string) => apiBaseURL + apiWithParamEndpoints.showtimesByCinemaId(cinemaId),
    showtimesByMovieId: (movieId: string) => apiBaseURL + apiWithParamEndpoints.showtimesByMovieId(movieId),
    showtimeDetailsById: (showtimeId: string) => apiBaseURL + apiWithParamEndpoints.showtimeDetailsById(showtimeId),
    userInfoByUsername: (username: string) => apiBaseURL + apiWithParamEndpoints.userInfoByUsername(username),
}

export const apiCinemaRegex = /\/api\/QuanLyRap\/LayThongTinLichChieuHeThongRap\?maHeThongRap=\w+&maNhom=GP09/ 