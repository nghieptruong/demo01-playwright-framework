export interface AccountData {
    taiKhoan: string,
    hoTen: string,
    email: string,
    soDt: string | null,
    matKhau: string,
    maLoaiNguoiDung: string,
}

export const accountDataKeys: readonly (keyof AccountData)[] = [
    'taiKhoan',
    'hoTen',
    'email',
    'soDt',
    'matKhau',
    'maLoaiNguoiDung',
];

export type AccountDataFields = typeof accountDataKeys[number];

export const userTypeOptions = ['KhachHang', 'QuanTri'] as const;