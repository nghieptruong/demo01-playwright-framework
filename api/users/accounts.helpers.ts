
import { fetchAccountsByUsername } from "./accounts.api";
import { AccountData } from "./accounts.types";

export async function getSingleAccountByUsername(
    username: string
): Promise<AccountData> {
    const accounts = await fetchAccountsByUsername(username);

    if (accounts.length === 0) {
        throw new Error(`No account found for username: ${username}`);
    }

    if (accounts.length > 1) {
        throw new Error(
            `Multiple accounts found for username: ${username}`
        );
    }
    return accounts[0];
}