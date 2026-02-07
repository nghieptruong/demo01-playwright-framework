import { faker } from "@faker-js/faker";
import { RegisterFormData } from "../types/user-account.types";
import { RegisterRequestPayload } from "../../api/users/accounts.types";
import { pickRandomNumberBetween } from "./dataManipulation.helpers";
import { UserAccount } from "../types/user-account.types";

const EMAIL_DOMAIN = "@example.com";
const USER_TYPE = "KhachHang";
const GROUP_ID = "GP09";

// Valid Register Data Generators
export function generateValidUiRegisterData(): RegisterFormData {
    const newAccount = generateNewUserAccountInfo();

    return {
        taiKhoan: newAccount.taiKhoan,
        matKhau: newAccount.matKhau,
        confirmPassWord: newAccount.matKhau,
        hoTen: newAccount.hoTen,
        email: newAccount.email,
    };
}

export function generateRegisterRequestPayload(): RegisterRequestPayload {
    const accountData = generateNewUserAccountInfo();
    return generateRegisterRequestPayloadWithCustomData(accountData);
}

export function generateRegisterRequestPayloadWithCustomData(accountData: UserAccount): RegisterRequestPayload {
    return {
        taiKhoan: accountData.taiKhoan,
        matKhau: accountData.matKhau,
        hoTen: accountData.hoTen,
        email: accountData.email,
        soDt: accountData.soDt,
        maLoaiNguoiDung: USER_TYPE,
        maNhom: GROUP_ID,
    };
}

function generateNewUserAccountInfo(): UserAccount {
    const taiKhoan = faker.string.uuid();
    const matKhau = faker.internet.password();
    const hoTen = faker.person.fullName();
    const soDt = generateDifferentPhoneNumber("");
    const email = taiKhoan + EMAIL_DOMAIN;

    return {
        taiKhoan,
        matKhau,
        hoTen,
        soDt,
        email,
    };
}

// Temporary function for specific test case with known issue
export function generateNewUserAccountForAccountFormTest(): UserAccount {
    const data = generateNewUserAccountInfo();
    data.hoTen = data.hoTen.replace(/[^a-zA-Z]/g, '');
    data.soDt = data.soDt.replace(/[^0-9]/g, '');
    return data;
}

// Invalid Data Generators
export function generateTooShortPassword() {
    const shortLength = faker.number.int({ min: 1, max: 5 });
    const shortPassword = faker.internet.password({ length: shortLength });
    return shortPassword;
}

// Data Modifier Functions
export function generateDifferentPassword(currentPassword: string): string {
    const newPassword = currentPassword + faker.string.alphanumeric(3);
    return newPassword;
}
export function generateDifferentPhoneNumber(currentPhone: string | null): string {
    if (!currentPhone || currentPhone.length === 0) {
        return faker.phone.number();
    }

    const phoneNum = parseInt(currentPhone);
    const changedNumber = phoneNum + pickRandomNumberBetween(1, 1000);
    return changedNumber.toString();
}

export function generateDifferentName(currentName: string): string {
    const newName = currentName + faker.person.firstName();
    return newName;
}


export function generateDifferentUsername(currentUsername: string) {
    return currentUsername + Date.now();
}

export function changePasswordCasing(currentPassword: string) {
    return currentPassword.toUpperCase();
}