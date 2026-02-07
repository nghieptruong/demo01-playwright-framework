import { AccountDataApi } from "../../api/users/accounts.types";

//  Default user for non-mutating tests or to use as reference
export const testUser: AccountDataApi = 
    {
        taiKhoan: 'testUser.primary',
        matKhau: 'Test123456@',
        hoTen: 'TenTen',
        email: 'testUser.primary@email.com',
        soDt: '12345678',
        maLoaiNguoiDung: 'KhachHang',
    }
;

// Users credentials for booking tests - separate users to avoid parallel conflicts
// export const userBooking: LoginFormData[] = [
//     {
//         taiKhoan: 'exampletk1',
//         matKhau: '123456',
//     },
//     {
//         taiKhoan: 'exampletk2',
//         matKhau: '123456',
//     },

//     {
//         taiKhoan: 'exampletk3',
//         matKhau: '123456',
//     },
//     {
//         taiKhoan: 'exampletk4',
//         matKhau: '123456',
//     },
//     {
//         taiKhoan: 'exampletk5',
//         matKhau: '123456',
//     },
// ];


// export const userE2EJourney: LoginFormData[] = [
//     {
//         taiKhoan: 'sweden',
//         matKhau: 'Sweden1!',
//     },
//     {
//         taiKhoan: 'thailand',
//         matKhau: 'Thailand1!',
//     },
//     {
//         taiKhoan: 'vietnam',
//         matKhau: 'Vietnam1!',
//     },

// ];


// // User for profile update test - profile changes possible
// export const userAccountReadonly: LoginFormData =
// {
//     taiKhoan: 'user.readonly',
//     matKhau: 'Test123456@',
// };   // Expect this user data to stay unchaned


// export const userAccountUpdate: LoginFormData =
// {
//     taiKhoan: 'singapore',
//     matKhau: 'Singapore1!',
// };   // Need to revert password after test


// // Users for form display tests (need full data) - no profile modifications - reuse for login tests
// export const userAccountDisplay: AccountDataApi[] = [

//     // Standard users
//     {
//         taiKhoan: 'StephCurry.30',
//         matKhau: 'Warriors30!',
//         hoTen: 'StephCurry',
//         email: 'stephcurry.30@gmail.com',
//         soDt: null,
//         maLoaiNguoiDung: 'KhachHang',
//     },

//     // Duplicate name to test multiple users with same name
//     {
//         taiKhoan: 'fake.StephCurry',
//         matKhau: 'fakePassword1!',
//         hoTen: 'StephCurry',
//         email: 'fake.StephCurry@fakeemail.com',
//         soDt: null,
//         maLoaiNguoiDung: 'KhachHang',
//     },

//     // Users with only special characters in username
//     {
//         taiKhoan: '!@#$%^&*',
//         matKhau: 'SpecialChar1!',
//         hoTen: 'SpecialName',
//         email: 'special.char@email.com',
//         soDt: '123456789',
//         maLoaiNguoiDung: 'KhachHang',
//     },

//     // User with long username and/or name
//     {
//         taiKhoan: 'all_I_want_for_Christmas_is_1234567890$',
//         matKhau: 'RandomPassword@01',
//         hoTen: 'Mariah Angela Carey',
//         email: 'christmas@email.com',
//         soDt: null,
//         maLoaiNguoiDung: 'KhachHang',
//     },

// ];




