/**
 * Form Validation Rules - Test Data
 * Contains validation test cases for form-level validation (cross-field validation)
 */

import { generateValidUiRegisterData } from "./accountDataGenerator";
import { testUser } from "../test-data/testUsers";

export interface FormValidationInput {
    taiKhoan: string;
    matKhau: string;
    confirmPassWord: string;
    hoTen: string;
    email: string;
}

export interface FormValidationTest {
    case: string;
    input: FormValidationInput;
    expectedError: string;
}

// Register form validation rules (password mismatch + uniqueness errors)
export interface RegisterFormValidationRules {
    confirmPassWord: { tests: FormValidationTest[] };
    taiKhoan: { tests: FormValidationTest[] };
    email: { tests: FormValidationTest[] };
    taiKhoanAndEmail: { tests: FormValidationTest[] };
}

// Account form validation rules (only email uniqueness)
export interface AccountFormValidationRules {
    email: { tests: FormValidationTest[] };
}

// Generate base data once to ensure consistency
const baseData1 = generateValidUiRegisterData();
const baseData2 = generateValidUiRegisterData();
const baseData4 = generateValidUiRegisterData();
const baseData3 = generateValidUiRegisterData();

// Register form validation rules
export const registerFormValidationRules: RegisterFormValidationRules = {
    confirmPassWord: {
        tests: [
            {
                case: "mismatchedPassword",
                input: {
                    taiKhoan: baseData1.taiKhoan,
                    matKhau: baseData1.matKhau,
                    confirmPassWord: baseData1.matKhau + Date.now(),
                    hoTen: baseData1.hoTen,
                    email: baseData1.email
                },
                expectedError: "Mật khẩu không khớp !",
            },
            {
                case: "mismatchedPasswordCasing",
                input: {
                    taiKhoan: baseData2.taiKhoan,
                    matKhau: baseData2.matKhau,
                    confirmPassWord: baseData1.matKhau.toUpperCase(),  // generated password has mixed casing
                    hoTen: baseData2.hoTen,
                    email: baseData2.email
                },
                expectedError: "Mật khẩu không khớp !"
            }
        ]
    },
    taiKhoan: {
        tests: [
            {
                case: "existingUsername",
                input: {
                    taiKhoan: testUser.taiKhoan,
                    matKhau: baseData3.matKhau,
                    confirmPassWord: baseData3.matKhau,
                    hoTen: baseData3.hoTen,
                    email: baseData3.email
                },
                expectedError: "Tài khoản đã tồn tại!"
            }
        ]
    },
    email: {
        tests: [
            {
                case: "existingEmail",
                input: {
                    taiKhoan: baseData4.taiKhoan,
                    matKhau: baseData4.matKhau,
                    confirmPassWord: baseData4.matKhau,
                    hoTen: baseData4.hoTen,
                    email: testUser.email
                },
                expectedError: "Email đã tồn tại!"
            }
        ]
    },
    taiKhoanAndEmail: {
        tests: [
            {
                case: "existingUsernameAndEmail",
                input: {
                    taiKhoan: testUser.taiKhoan,
                    matKhau: baseData4.matKhau,
                    confirmPassWord: baseData4.matKhau,
                    hoTen: baseData4.hoTen,
                    email: testUser.email
                },
                expectedError: "Tài khoản đã tồn tại!"
            }
        ]
    }
};

// Account form validation rules (reuses email case only)
export const accountFormValidationRules: AccountFormValidationRules = {
    email: registerFormValidationRules.email
};

