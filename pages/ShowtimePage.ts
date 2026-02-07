import { expect, Locator, Page } from "@playwright/test";
import { CommonPage } from "./CommonPage";
import { ShowtimeInfo } from "../api/booking/booking.types";

import { pageURLPaths, pageURLs } from "../tests/utils/pageRoutes";
import { getRandomSeatNumbersPreferConsecutive } from "../tests/utils/bookingSampleProvider";
import { OrderDetails } from "./shared.types";

export class ShowtimePage extends CommonPage {

    // ========== Static Configuration ==========
    static readonly ACCESSIBLE_NAMES = {
        // seat map legends
        reservedLegend: 'X',

        // preview showtime fields
        cinemaBranch: 'Cụm Rạp:',
        address: 'Địa chỉ:',
        screen: 'Rạp:',
        showtime: 'Ngày giờ chiếu:',
        movieTitle: 'Tên Phim:',
        selectedSeats: 'Chọn: ',

        // booking button
        bookingButton: 'ĐẶT VÉ',

        // alerts content
        successAlert: 'Đặt vé thành công',
        emptySelectionAlert: 'Bạn chưa chọn ghế',
        loginRequestAlert: 'Bạn chưa đăng nhập',

        // alert buttons    
        successAlertExitBtn: 'Đồng ý',
        emptySelectionAlertExitBtn: 'Đã hiểu',
        acceptLoginRedirect: 'Đồng ý',
        cancelLoginRequest: 'Không',
    };

    static readonly LEGEND_LABELS = {
        reserved: 'Đã đặt',
        standard: 'Thường',
        vip: 'Vip'
    }

    constructor(page: Page) {
        super(page);
    }


    // ========== Locators ==========
    // Seat map
    get btnSeats() {
        return this.page.getByRole('button')
            .filter({ hasNotText: 'ĐẶT VÉ' })                       // filter booking button
            .filter({ hasNot: this.page.locator(' + p') });         // filter seat legend buttons
    }

    get btnAvailableSeats() {
        return this.seatMap.getByRole('button', { disabled: false });
    }

    get seatMap() {
        return this.btnSeats.locator('..');
    }

    get btnReservedSeats() {
        return this.seatMap.getByRole('button', { name: ShowtimePage.ACCESSIBLE_NAMES.reservedLegend });
    }

    get lblLegendReserved() {
        return this.page
            .getByText(ShowtimePage.LEGEND_LABELS.reserved)
            .locator('xpath=.//preceding-sibling::button');
    }

    get lblLegendStandard() {
        return this.page
            .getByText(ShowtimePage.LEGEND_LABELS.standard)
            .locator('xpath=.//preceding-sibling::button');
    }

    get lblLegendVip() {
        return this.page
            .getByText(ShowtimePage.LEGEND_LABELS.vip)
            .locator('xpath=.//preceding-sibling::button');
    }

    // Order preview & booking alerts
    get pnlOrderPreview() {
        return this.btnConfirmBooking.locator('..');
    }

    get lblPrice() {
        return this.pnlOrderPreview.locator('p');
    }

    get btnConfirmBooking() {
        return this.page.getByRole('button', { name: ShowtimePage.ACCESSIBLE_NAMES.bookingButton });
    }

    get btnExitSuccessAlert() {
        return this.page.getByRole('button', { name: ShowtimePage.ACCESSIBLE_NAMES.successAlertExitBtn });
    }

    get btnExitEmptySelectionAlert() {
        return this.page.getByRole('button', { name: ShowtimePage.ACCESSIBLE_NAMES.emptySelectionAlertExitBtn });
    }

    get btnAcceptLoginRedirect() {
        return this.page.getByRole('button', { name: ShowtimePage.ACCESSIBLE_NAMES.acceptLoginRedirect });
    }

    get btnCancelLoginRequest() {
        return this.page.getByRole('button', { name: ShowtimePage.ACCESSIBLE_NAMES.cancelLoginRequest });
    }

    get alertBookingSuccess() {
        return this.page.getByRole('dialog', { name: ShowtimePage.ACCESSIBLE_NAMES.successAlert });
    }

    get alertEmptySelection() {
        return this.page.getByRole('dialog', { name: ShowtimePage.ACCESSIBLE_NAMES.emptySelectionAlert });
    }

    get alertLoginRequest() {
        return this.page.getByRole('dialog', { name: ShowtimePage.ACCESSIBLE_NAMES.loginRequestAlert });
    }

    // Conditional locators
    getSeatBtnBySeatNumber(seatNumber: string) {
        return this.page.getByRole('button', { name: seatNumber, exact: true });
    }

    getShowtimeFieldLocatorByName(showtimeField: string) {
        return this.page.getByRole('heading', { name: showtimeField, exact: true }).locator('~ h3');
    }

    // ========== Navigation & Wait ==========
    async navigateToShowtimePageAndWaitForSeatMap(showtimeId: string) {

        const url = pageURLs.showtime(showtimeId);

        await this.navigateToPage(url);
        await this.waitForSeatMapAndPreview();

        return url;
    }

    async waitForSeatMapAndPreview() {
        await this.waitForElementVisible(this.seatMap);
        await this.waitForElementVisible(this.pnlOrderPreview);
    }

    // ========== Get Info ==========
    // Seat map
    getCurrentShowtimeIdNumber(): number {
        const url = this.page.url();
        const id = url.split(pageURLPaths.showtime).pop() ?? '';
        return parseInt(id);
    }

    async countTotalSeats(): Promise<number> {
        return await this.getElementCount(this.btnSeats);
    }

    async getAvailableSeatNumbers(): Promise<string[]> {
        const availableSeatNumbers: string[] = await this.btnAvailableSeats.evaluateAll((seats) => {
            return seats.map(seat => seat.textContent?.trim() || '');
        });
        return availableSeatNumbers;
    }

    async countReservedSeats(): Promise<number> {
        return await this.getElementCount(this.btnReservedSeats);
    }

    async getSeatsMatchingLegendMarker(legend: Locator): Promise<string[]> {

        const backgroundColor = await this.getBackgroundColor(legend);

        const matchedSeatNumbers: string[] = await this.btnSeats.evaluateAll((seats, bgColor) => {
            return seats.filter(seat => {
                const color = getComputedStyle(seat).backgroundColor;
                return color === bgColor;
            }).map(seat => seat.textContent?.trim() || '');
        }, backgroundColor);

        return matchedSeatNumbers;
    }

    async getAvailableStandardSeatNumbers(): Promise<string[]> {
        return await this.getSeatsMatchingLegendMarker(this.lblLegendStandard);
    }

    async getAvailableVipSeatNumbers(): Promise<string[]> {
        return await this.getSeatsMatchingLegendMarker(this.lblLegendVip);
    }

    async isSeatSelected(seatNumber: string): Promise<boolean> {

        const btnSeat = this.getSeatBtnBySeatNumber(seatNumber);
        const btnStyle = await this.getElementAttribute(btnSeat, "style");

        if (await btnSeat.count() !== 1) {
            throw new Error(`Cannot locate this seat button. Locator: ${btnSeat}`);
        }

        if (!btnStyle) {
            return false;
        }

        return true;
    }

    // Order preview 
    async getTextForShowtimeInfoField(showtimeField: string): Promise<string> {
        const fieldLocator = this.getShowtimeFieldLocatorByName(showtimeField);

        if (await fieldLocator.isHidden()) {
            return '';
        }

        return await this.getElementText(fieldLocator);
    }

    async getShowtimeInfo(): Promise<ShowtimeInfo> {

        const cinemaBranch = await this.getTextForShowtimeInfoField(ShowtimePage.ACCESSIBLE_NAMES.cinemaBranch);

        const address = await this.getTextForShowtimeInfoField(ShowtimePage.ACCESSIBLE_NAMES.address);

        const screen = await this.getTextForShowtimeInfoField(ShowtimePage.ACCESSIBLE_NAMES.screen);

        const showtime = await this.getTextForShowtimeInfoField(ShowtimePage.ACCESSIBLE_NAMES.showtime);
        const dateAndTime = this.splitDateAndTime(showtime);

        const movieTitle = await this.getTextForShowtimeInfoField(ShowtimePage.ACCESSIBLE_NAMES.movieTitle);

        return {
            maLichChieu: this.getCurrentShowtimeIdNumber(),
            tenCumRap: cinemaBranch,
            diaChi: address,
            tenRap: screen,
            ngayChieu: dateAndTime.date,
            gioChieu: dateAndTime.time,
            tenPhim: movieTitle,
        };
    }

    async getPreviewSelectedSeats(): Promise<string[]> {
        const previewSeatsText = await this.getTextForShowtimeInfoField(ShowtimePage.ACCESSIBLE_NAMES.selectedSeats);
        return this.extractPreviewSeatNumbers(previewSeatsText);
    }

    async getPreviewPriceText(): Promise<string> {
        const fullText = await this.getElementText(this.lblPrice);
        return fullText.replace(/\D/g, ''); // remove non-digit characters
    }

    async getPreviewPrice(): Promise<number> {
        const priceText = await this.getPreviewPriceText();
        return this.extractPreviewPrice(priceText);
    }

    async getCurrentOrderPreviewDetails(): Promise<OrderDetails> {

        const showtimeInfo = await this.getShowtimeInfo();
        const selectedSeats = await this.getPreviewSelectedSeats();
        const price = await this.getPreviewPriceText();
        return {
            movieTitle: showtimeInfo.tenPhim,
            bookedSeats: selectedSeats,
            price: price
        };
    }

    // Helper to extract info
    extractPreviewSeatNumbers(previewSeatsText: string): string[] {
        if (!previewSeatsText) {
            return [];
        }
        const selectedSeats = previewSeatsText
            .split(', ')
            .map(seat => seat.replace(/Ghế\s*/, '').trim()) // remove "Ghế " and trim
            .filter(seat => seat !== '');
        return selectedSeats;
    }

    extractPreviewPrice(previewPriceText: string): number {
        return parseInt(previewPriceText);
    }

    splitDateAndTime(showtimeText: string): { date: string, time: string } {
        const time = showtimeText.split(' -').pop() ?? '';
        const date = showtimeText.split(' -').shift() ?? '';
        return {
            date,
            time
        }
    }

    // ========== Actions ==========
    async selectNonSelectedSeats(seatNumbers: string[]) {

        await this.verifySeatSelectability(seatNumbers, true);

        for (const number of seatNumbers) {
            const btnSeat = this.getSeatBtnBySeatNumber(number);
            const isSelected = await this.isSeatSelected(number);

            if (isSelected) {
                throw new Error(`Seat is already pre-selected. Cannot select seat: ${number}`);
            }

            await this.clickElement(btnSeat);
        }

    }

    async unselectSelectedSeats(seatNumbers: string[]) {

        await this.verifySeatSelectability(seatNumbers, true);

        for (const number of seatNumbers) {
            const btnSeat = this.getSeatBtnBySeatNumber(number);
            const isSelected = await this.isSeatSelected(number);

            if (!isSelected) {
                throw new Error(`Seat is not in selected state. Cannot unselect seat: ${number}`);
            }

            await this.clickElement(btnSeat);
        }

    }

    async selectAvailableSeatsPreferConsecutive(sampleSize: number = 2) {

        const availableSeats = await this.getAvailableSeatNumbers();
        const seatsToSelect = getRandomSeatNumbersPreferConsecutive(availableSeats, sampleSize);

        await this.selectNonSelectedSeats(seatsToSelect);

        return seatsToSelect;
    }

    async clickBookTickets() {
        const bookTicketsButton = this.btnConfirmBooking;
        await this.clickElement(bookTicketsButton);
    }

    async selectSeatsAndCollectOrderDetails(sampleSize: number = 2): Promise<OrderDetails> {
        const showtimeInfo = await this.getShowtimeInfo();
        const seatsToBook = await this.selectAvailableSeatsPreferConsecutive(sampleSize);
        const price = await this.getPreviewPriceText();

        return {
            movieTitle: showtimeInfo.tenPhim,
            bookedSeats: seatsToBook,
            price: price
        };
    }

    async exitSuccessAlert() {
        await expect(this.alertBookingSuccess).toBeVisible();
        await this.clickElement(this.btnExitSuccessAlert);
        await expect(this.alertBookingSuccess).not.toBeVisible();
    }

    async exitEmptySelectionAlert() {
        await this.clickElement(this.btnExitEmptySelectionAlert);
    }

    async acceptLoginRedirect() {
        await expect(this.alertLoginRequest).toBeVisible();
        await this.clickElement(this.btnAcceptLoginRedirect);
    }

    async cancelLoginRedirect() {
        await expect(this.alertLoginRequest).toBeVisible();
        await this.clickElement(this.btnCancelLoginRequest);
        await expect(this.alertLoginRequest).not.toBeVisible();
    }

    // ========== Verifications ==========
    async verifySeatSelectability(seatNumbers: string | string[], shouldBeSelectable: boolean) {

        // Handle both single seat and multiple seats
        const seatNumbersArray = Array.isArray(seatNumbers) ? seatNumbers : [seatNumbers];

        // Collect current URL for error context
        const currentUrl = this.page.url();

        // Verify each seat
        for (const number of seatNumbersArray) {

            const btnSeat = this.getSeatBtnBySeatNumber(number);
            const count = await btnSeat.count();

            if (count > 1) {
                throw new Error('Multiple element located');
            }

            if (count === 0 && shouldBeSelectable) {
                throw new Error(`Seat ${number} expected to be selectable but not found. Showtime URL: ${currentUrl}`);
            }

            if (count === 1) {
                if (shouldBeSelectable && !(await btnSeat.isEnabled())) {
                    throw new Error(`Seat ${number} expected to be selectable but is disabled. Showtime URL: ${currentUrl}`);
                }
                if (!shouldBeSelectable && await btnSeat.isEnabled()) {
                    throw new Error(`Seat ${number} expected to be non-selectable but is enabled. Showtime URL: ${currentUrl}`);
                }
            }
        }
    }

    async verifySuccessAlert() {
        await expect(this.alertBookingSuccess, 'Confirmation message not found').toBeVisible();
    }

    async verifyNoSuccessAlert() {
        await expect.soft(this.alertBookingSuccess, 'Unexpected success alert found').not.toBeVisible();
    }

    async verifyEmptySelectionAlert() {
        await expect(this.alertEmptySelection, 'Empty Selection Alert Not Found').toBeVisible();
    }

    async verifyLoginRequestAlert() {
        await expect(this.alertLoginRequest).toBeVisible();
    }

    async verifySuccessfulRedirectToLogin() {
        await expect(this.page).toHaveURL('/sign-in');
    }

    async verifyLoginRedirectCancelled(currentURL: string) {
        await expect.soft(this.alertLoginRequest).not.toBeVisible();
        await this.verifyNoNavigation(currentURL);
    }
}