/**
 * Field Validation Rules - Test Data
 * Contains validation test cases for form fields across the application
 */

import { EditableAccountFields, RegisterField } from "../types/form-ui.types";

export interface FieldValidationTest {
  case: string;
  input: string;
  expectedError: string;
}

export type RegisterFieldValidationRules = Record<RegisterField, { tests: FieldValidationTest[] }>;
export type AccountFieldValidationRules = Record<EditableAccountFields, { tests: FieldValidationTest[] }>;

export interface LoginFieldValidationRules {
  taiKhoan: { tests: FieldValidationTest[] };
  matKhau: { tests: FieldValidationTest[] };
}

// Register form field validation rules
export const registerFieldValidationRules: RegisterFieldValidationRules = {
  taiKhoan: {
    tests: [
      {
        case: "blank",
        input: "",
        expectedError: "Đây là trường bắt buộc !"
      },
      {
        case: "invalid_onlyWhitespaces",
        input: "      ",
        expectedError: "Đây là trường bắt buộc !"
      },
      {
        case: "invalid_hasWhitespaces",
        input: "s  p  a  c  e",
        expectedError: "Tên tài khoản chỉ chứa chữ cái, số, dấu gạch dưới (_) và dấu chấm (.) !"
      },
      {
        case: "invalid_hasSpecialChars",
        input: "special@char!#$",
        expectedError: "Tên tài khoản chỉ chứa chữ cái, số, dấu gạch dưới (_) và dấu chấm (.) !"
      },
      {
        case: "invalid_tooShort",
        input: "short",
        expectedError: "Tên tài khoản phải chứa 6 - 20 ký tự !"
      },
      {
        case: "invalid_tooLong",
        input: "steph.curry.123456789.toolong",
        expectedError: "Tên tài khoản phải chứa 6 - 20 ký tự !"
      }
    ]
  },
  matKhau: {
    tests: [
      {
        case: "blank",
        input: "",
        expectedError: "Đây là trường bắt buộc !"
      },
      {
        case: "invalid_OnlyWhitespaces",
        input: "        ",
        expectedError: "Đây là trường bắt buộc !"
      },
      {
        case: "invalid_tooShort",
        input: "A123@",
        expectedError: "Mật khẩu phải có ít nhất 6 kí tự !"
      }
    ]
  },
  confirmPassWord: {
    tests: [
      {
        case: "blank",
        input: "",
        expectedError: "Đây là trường bắt buộc !"
      }
    ]
  },
  hoTen: {
    tests: [
      {
        case: "blank",
        input: "",
        expectedError: "Đây là trường bắt buộc !"
      },
      {
        case: "invalid_onlyWhitespaces",
        input: "      ",
        expectedError: "Đây là trường bắt buộc !"
      },
      {
        case: "invalid_hasNumbers",
        input: "Steph123",
        expectedError: "Họ và tên không chứa số !"
      },
      {
        case: "invalid_hasSpecialChars",
        input: "Steph@Curry",
        expectedError: "Họ và tên không chứa ký tự đặc biệt !"
      }
    ]
  },
  email: {
    tests: [
      {
        case: "blank",
        input: "",
        expectedError: "Đây là trường bắt buộc !"
      },
      {
        case: "invalid_onlyWhitespaces",
        input: "      ",
        expectedError: "Đây là trường bắt buộc !"
      },
      {
        case: "invalid_hasWhitespaces",
        input: "email space @gmail.test",
        expectedError: "Email không đúng định dạng !"
      },
      {
        case: "invalid_missingDomain",
        input: "email.nodomain@",
        expectedError: "Email không đúng định dạng !"
      },
      {
        case: "invalid_missing@",
        input: "emailatgmail.com",
        expectedError: "Email không đúng định dạng !"
      },
      {
        case: "invalid_hasMultiple@",
        input: "email@@gmail.com",
        expectedError: "Email không đúng định dạng !"
      }
    ]
  }
};

// Account form field validation rules (reuses shared fields + adds soDt)
export const accountFieldValidationRules: AccountFieldValidationRules = {

  hoTen: registerFieldValidationRules.hoTen,

  email: registerFieldValidationRules.email,

  matKhau: registerFieldValidationRules.matKhau,

  soDt: {
    tests: [
      {
        case: "blank",
        input: "",
        expectedError: "Vui lòng nhập số điện thoại"
      },
      {
        case: "invalid_onlyWhitespaces",
        input: "      ",
        expectedError: "Vui lòng nhập số điện thoại"
      },
      {
        case: "invalid_hasLetters",
        input: "123ABC456",
        expectedError: "Vui lòng nhập số điện thoại"
      },
      {
        case: "invalid_hasSpecialChars",
        input: "123-456-7890",
        expectedError: "Vui lòng nhập số điện thoại"
      }
    ]
  }
};

// Login form field validation rules
export const loginFieldValidationRules: LoginFieldValidationRules = {
  taiKhoan: {
    // taiKhoan should only be checked for blank input (besides form submission validation)
    tests: registerFieldValidationRules.taiKhoan.tests.filter(test => test.case === "blank" || test.case === "invalid_onlyWhitespaces")
  },
  matKhau: registerFieldValidationRules.matKhau
};


