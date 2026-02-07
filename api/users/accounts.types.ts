export interface AccountDataApi {
    taiKhoan: string,
    hoTen: string,
    email: string,
    soDt: string | null,
    matKhau: string,
    maLoaiNguoiDung: string,
}

export interface RegisterRequestPayload extends AccountDataApi {
    maNhom: string;
}

export const accountDataKeys: readonly (keyof AccountDataApi)[] = [
    'taiKhoan',
    'hoTen',
    'email',
    'soDt',
    'matKhau',
    'maLoaiNguoiDung',
];

export type AccountDataFields = typeof accountDataKeys[number];

export const userTypeOptions = ['KhachHang', 'QuanTri'] as const;

