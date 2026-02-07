// Register Form Input
export interface RegisterFormData extends Omit<UserAccount, 'soDt'> {
    confirmPassWord: string;
}

// Login Form Input
export interface LoginFormData {
    taiKhoan: string;
    matKhau: string;
}

// Shared User Account Base
export interface UserAccount {
    taiKhoan: string;
    hoTen: string;
    email: string;
    matKhau: string;
    soDt: string;
}