import { userEndpoints } from "../config/apiRoutes";
import { AccountDataApi, RegisterRequestPayload } from "./accounts.types";

export async function searchAccounts(username: string): Promise<AccountDataApi[]> {
    const res = await fetch(userEndpoints.search(username));
    const data: AccountDataApi[] = await res.json();
    return data;
}

export async function sendRegisterRequest(payload: RegisterRequestPayload) {
    const res = await fetch(userEndpoints.register(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
            `Failed to register user: ${res.status} ${res.statusText}. Response: ${errorText}`
        );
    }

    const data: AccountDataApi = await res.json();
    return data;
}

export async function sendDeleteUserRequest(username: string, accessToken: string) {
    const res = await fetch(userEndpoints.delete(username), {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': '*/*',
        },
    });

    if (!res.ok && res.status !== 404) {
        const errorText = await res.text();
        return { status: res.status, error: errorText };
    }

    return { status: res.status, error: null };
}
