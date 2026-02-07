import { LoginPage } from "../../pages/LoginPage";
import { AccountDataApi } from "../../api/users/accounts.types";
import { UserAccount } from "../types/user-account.types";

// Content extraction functions
export function extractShowtimeId(href: string) {
    const id = href.split('/purchase/').pop();

    if (!id) throw new Error(`Invalid showtime href: ${href}`);

    return id;
}

export async function loginAndGoToHomePage(loginPage: LoginPage, user: AccountDataApi | UserAccount) {

    await loginPage.navigateToLoginPage();
    await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
    await loginPage.verifySuccessMsgAndLoggedInStatus();

    try {
        await loginPage.verifyNavigationToHomePage();
    } catch {
        console.warn('User not redirected to homepage after login. Proceed to navigate manually.');
        await loginPage.navigateToHomePage();
    }
}