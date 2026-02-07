
// =========  Account Update Form  ========= 
import type { AccountDataApi } from '../../api/users/accounts.types';

export type EditableAccountData = Omit<AccountDataApi, 'taiKhoan' | 'maLoaiNguoiDung'>;

export const editableAccountDataKeys: readonly (keyof EditableAccountData)[] = [
    'hoTen',
    'email',
    'soDt',
    'matKhau',
];

export type EditableAccountFields = typeof editableAccountDataKeys[number];


// ============  Login Form ============ 

export interface LoginFormData {
    taiKhoan: string;
    matKhau: string;
}

export const loginFieldIds: readonly (keyof LoginFormData)[] = [
    'taiKhoan',
    'matKhau',
];

export type LoginField = typeof loginFieldIds[number];


// ============  Register Form ============
export interface RegisterFormData {
    taiKhoan: string;
    matKhau: string;
    confirmPassWord: string;
    hoTen: string;
    email: string;
}

export const registerFieldIds: readonly (keyof RegisterFormData)[] = [
    'taiKhoan',
    'matKhau',
    'confirmPassWord',
    'hoTen',
    'email',
];

export type RegisterField = typeof registerFieldIds[number];
