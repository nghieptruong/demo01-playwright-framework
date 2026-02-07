import { sendDeleteUserRequest, sendRegisterRequest } from "../../api/users/accounts.api";
import { getAdminAuthToken } from "../../api/users/accounts.helpers";
import type { AccountDataApi } from "../../api/users/accounts.types";
import { generateNewUserAccountForAccountFormTest, generateRegisterRequestPayload, generateRegisterRequestPayloadWithCustomData } from "./accountDataGenerator";

export async function deleteTestUser(username: string) {
    const authToken = await getAdminAuthToken();
    const { status, error } = await sendDeleteUserRequest(username, authToken);
    if (status !== 200 && status !== 404) {
        throw new Error(
            `Failed to delete user: ${username}, status: ${status}${error ? `, error: ${error}` : ''}`
        );
    }
}

export async function createNewTestUser(): Promise<AccountDataApi> {
    const registerPayload = generateRegisterRequestPayload();
    const newAccount = await sendRegisterRequest(registerPayload);
    return newAccount;
}

// Temporary function for specific test case with known issue
export async function createTestUserForAccountFormTest(): Promise<AccountDataApi> {
    const userAccount = generateNewUserAccountForAccountFormTest();
    const registerPayload = generateRegisterRequestPayloadWithCustomData(userAccount);
    const newAccount = await sendRegisterRequest(registerPayload);
    return newAccount;
}