import { apiURLs } from "../../tests/utils/routes";
import { AccountData } from "./accounts.types";

export async function fetchUserAccountData(): Promise<AccountData[]> {
    const res = await fetch(apiURLs.users);
    const data: AccountData[] = await res.json();
    return data;
}

export async function fetchAccountsByUsername(username: string): Promise<AccountData[]> {
    const res = await fetch(apiURLs.userInfoByUsername(username));
    const data: AccountData[] = await res.json();
    return data;
}