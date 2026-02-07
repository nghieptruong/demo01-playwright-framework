import { Locator, Page } from "@playwright/test";
import { BasePage } from "../BasePage";
import { OrderDetails } from "../shared.types";

export class OrderHistory extends BasePage {

    // ========== Static Configuration ==========
    static readonly ACCESSIBLE_NAMES = {
        lblMovie: 'Tên phim: ',
        lblPrice: 'Giá vé: ',
        lblBookedSeats: 'Ghế số:',
    }

    // ========== Constructor ==========
    constructor(page: Page) {
        super(page);
    }

    // ========== Locators ==========
    get pnlOrderHistory(): Locator {
        return this.page.locator('main > div')
            .filter({ has: this.page.getByRole('heading', { name: 'Lịch sử đặt vé' }) })
            .filter({ has: this.page.getByRole('separator') });
    }

    get lblMovieTitle(): Locator {
        return this.pnlOrderHistory
            .getByRole('heading', { name: OrderHistory.ACCESSIBLE_NAMES.lblMovie })
            .locator('..');
    }

    get lblPrice(): Locator {
        return this.pnlOrderHistory
            .getByRole('heading', { name: OrderHistory.ACCESSIBLE_NAMES.lblPrice });
    }

    get lblBookedSeats(): Locator {
        return this.pnlOrderHistory
            .getByRole('heading', { name: OrderHistory.ACCESSIBLE_NAMES.lblBookedSeats });
    }

    // ========== Get Info ==========
    async countOrders(timeout: number = 5000): Promise<number> {
        try {
            await this.lblMovieTitle.first().waitFor({ state: 'visible', timeout });
        } catch {
            return 0;
        }
        return await this.lblMovieTitle.count();
    }

    async getLastOrderDetails(): Promise<OrderDetails> {

        await this.waitForElementVisible(this.lblMovieTitle.last());
        await this.lblMovieTitle.last().scrollIntoViewIfNeeded();

        const movieTitleText = await this.lblMovieTitle.last().innerText();
        const movieTitle = movieTitleText.replace(OrderHistory.ACCESSIBLE_NAMES.lblMovie, '').trim();

        const seatText = await this.lblBookedSeats.last().innerText();
        const bookedSeats = seatText.replace(OrderHistory.ACCESSIBLE_NAMES.lblBookedSeats, '').trim().split(/\s+/);

        const priceText = await this.lblPrice.last().innerText();
        const price = priceText.replace(/\D/g, '').trim();

        return {
            movieTitle,
            bookedSeats,
            price,
        };
    }
}
