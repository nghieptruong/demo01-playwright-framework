// URL Paths and URLs for Pages

export const pageURLPaths = {
    movie: '/detail/',
    showtime: '/purchase/',
} as const;

export const pageURLs = {
    home: '/',
    login: '/sign-in',
    register: '/sign-up',
    account: '/account',
    movie: (movieId: string) => pageURLPaths.movie + movieId,
    showtime: (showtimeId: string) => pageURLPaths.showtime + showtimeId,
} as const;
