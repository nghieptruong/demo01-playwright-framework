import { faker } from "@faker-js/faker";
import { RegisterFormData } from "../types/auth.types";
import { AccountData } from "../../api/users/accounts.types";
import { pickRandomNumberBetween } from "./shared.helpers";


// Register Data Generators

export function generateValidRegisterData(): RegisterFormData {
    const taiKhoan = faker.string.uuid();
    const matKhau = faker.internet.password(); // by default a mix of chars
    return {
        taiKhoan,
        matKhau,
        confirmPassWord: matKhau,
        hoTen: faker.person.fullName(),
        email: faker.internet.email(),
    };
}

export function generateTooShortPassword() {
    const shortLength = faker.number.int({ min: 1, max: 5 });
    const shortPassword = faker.internet.password({ length: shortLength });
    return shortPassword;
}

// Login Data Generators
export function generateValidLoginData(existingUserdata: AccountData) {
    return {
        taiKhoan: existingUserdata.taiKhoan,
        matKhau: existingUserdata.matKhau,
    };
}
export function generateInvalidUsernameLoginData(existingUserdata: AccountData) {
    return {
        taiKhoan: existingUserdata.taiKhoan + Date.now(),
        matKhau: existingUserdata.matKhau,
    };
}
export function generateInvalidPasswordLoginData(existingUserdata: AccountData) {
    return {
        taiKhoan: existingUserdata.taiKhoan,
        matKhau: existingUserdata.matKhau + Date.now(),
    };
}
export function generateIncorrectCasingPasswordLoginData(existingUserdata: AccountData) {
    return {
        taiKhoan: existingUserdata.taiKhoan,
        matKhau: existingUserdata.matKhau.toLowerCase(),
    };
}

// Account Update Generators
export function generateDifferentPassword(currentPassword: string): string {
    const newPassword = currentPassword + faker.string.alphanumeric(3);
    return newPassword;
}
export function generateDifferentPhoneNumber(currentPhone: string | null): string {
    if (!currentPhone) {
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