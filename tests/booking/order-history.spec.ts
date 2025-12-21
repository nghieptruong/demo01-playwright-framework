import { expect, test } from "../../fixtures/custom-fixtures";
import { AccountPage } from "../../pages/AccountPage";
import { ShowtimePage } from "../../pages/ShowtimePage";
import { userBooking } from "../test-data/testUsers";
import { getSampleShowtimesWithAvailableSeats } from "../utils/booking.helpers";


test.describe('Order History Verification', () => {

  test.beforeEach(async ({ loginPage }) => {
    // instead of using fixture to avoid potential errors when run parallel tests
    const user = userBooking[3];

    await loginPage.navigateToLoginPage();
    await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
    await loginPage.verifySuccessMsgAndLoggedInStatus();
  });

  test('Order History displays new booking data correctly @regression', async ( {page} ) => {

    const accountPage = new AccountPage(page);
    
    let initialOrderCount: number;
    let showtimeId: string;
    let newOrder: { movieTitle: string; bookedSeats: string[]; price: string };

    await test.step('Get initial order count', async () => {
      await accountPage.navigateToAccountPage();
      await accountPage.waitForOrderHistoryPanel();
      initialOrderCount = await accountPage.orderHistory.countOrders();
    });

    await test.step('Find showtime and book tickets', async () => {
      // Find a showtime with at least 8 available seats (fallback: 1) to minimize sold-out risk during booking
      const sampleShowtimes = await getSampleShowtimesWithAvailableSeats({
        seatQuantity: 8,
        sampleSize: 1
      });

      test.skip(sampleShowtimes.length === 0, 'Test skipped: No showtimes with available seats found.');

      showtimeId = sampleShowtimes[0].maLichChieu.toString();
      const showtimePage = new ShowtimePage(page);

      // Go to showtime page and book tickets and collect order details
      await showtimePage.navigateToShowtimePageAndWait(showtimeId);
      newOrder = await showtimePage.selectSeatsAndCollectOrderDetails();  // default: 2 seats
      await showtimePage.clickBookTickets();
      await showtimePage.exitSuccessAlert();
    });

    await test.step('Verify order history updated correctly', async () => {
      const { movieTitle, bookedSeats, price } = newOrder;

      // Go to account page to verify order history update
      await accountPage.navigateToAccountPage();

      // Assertion 1: Order count increased by 1
      await expect.poll(async () => {
        return await accountPage.orderHistory.countOrders();
      }, { timeout: 10000 }
      ).toBe(initialOrderCount + 1);

      // Assertion 2: Last displayed order match the booking details
      const uiLastOrder = await accountPage.orderHistory.getLastOrderDetails();

      expect.soft(uiLastOrder.movieTitle, 'Incorrect movie title').toBe(movieTitle);
      expect.soft(uiLastOrder.bookedSeats, 'Incorrect seat numbers').toEqual(bookedSeats);
      expect.soft(uiLastOrder.price, 'Incorrect price').toBe(price);
    });

  })

})
